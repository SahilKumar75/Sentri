import { API_BASE_URL } from './api';

export type HangoutRoom = {
  id: number;
  roomCode: string;
  roomName: string;
  roomType: string;
  ownerDisplayName: string;
  participantCount: number;
  active: boolean;
  joinLink: string;
  createdAt: string;
  updatedAt: string;
  lastJoinedAt?: string;
};

type RoomResult =
  | { ok: true; room: HangoutRoom }
  | { ok: false; message: string };

type RoomsResult =
  | { ok: true; rooms: HangoutRoom[] }
  | { ok: false; message: string };

export async function listRooms(): Promise<RoomsResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/hangout/rooms`);
    const data = (await response.json()) as HangoutRoom[] | { message?: string; details?: string[] };
    if (!response.ok) {
      return { ok: false, message: extractErrorMessage(data as { message?: string; details?: string[] }) };
    }
    return { ok: true, rooms: data as HangoutRoom[] };
  } catch (error) {
    return { ok: false, message: getNetworkMessage(error) };
  }
}

export async function createRoom(
  sessionToken: string,
  payload: { roomName: string; roomType: string }
): Promise<RoomResult> {
  return mutateRoom('/hangout/rooms', 'POST', payload, sessionToken);
}

export async function getRoom(roomCode: string): Promise<RoomResult> {
  return fetchRoom(`/hangout/rooms/${normalizeRoomCode(roomCode)}`);
}

export async function joinRoom(roomCode: string, guestName?: string): Promise<RoomResult> {
  return mutateRoom(
    `/hangout/rooms/${normalizeRoomCode(roomCode)}/join`,
    'POST',
    guestName ? { guestName } : {},
    null
  );
}

export function extractRoomCode(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return '';
  }

  const schemeMatch = trimmed.match(/sentri:\/\/hangout\/([A-Z0-9-]+)/i);
  if (schemeMatch?.[1]) {
    return normalizeRoomCode(schemeMatch[1]);
  }

  const labeledMatch = trimmed.match(/code\s*[:\-]\s*([A-Z0-9]{6,12})/i);
  if (labeledMatch?.[1]) {
    return normalizeRoomCode(labeledMatch[1]);
  }

  const tokenMatch = trimmed
    .split(/[\s\n\r\t,.;/]+/)
    .map((token) => token.replace(/[^A-Z0-9-]/gi, ''))
    .find((token) => /^[A-Z0-9]{6,12}$/i.test(token) && /\d/.test(token));
  if (tokenMatch) {
    return normalizeRoomCode(tokenMatch);
  }

  return '';
}

async function fetchRoom(path: string): Promise<RoomResult> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`);
    const data = (await response.json()) as HangoutRoom | { message?: string; details?: string[] };
    if (!response.ok) {
      return { ok: false, message: extractErrorMessage(data as { message?: string; details?: string[] }) };
    }
    return { ok: true, room: data as HangoutRoom };
  } catch (error) {
    return { ok: false, message: getNetworkMessage(error) };
  }
}

async function mutateRoom(
  path: string,
  method: 'POST',
  payload: object,
  sessionToken: string | null
): Promise<RoomResult> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as HangoutRoom | { message?: string; details?: string[] };
    if (!response.ok) {
      return { ok: false, message: extractErrorMessage(data as { message?: string; details?: string[] }) };
    }
    return { ok: true, room: data as HangoutRoom };
  } catch (error) {
    return { ok: false, message: getNetworkMessage(error) };
  }
}

function normalizeRoomCode(value: string) {
  return value.trim().toUpperCase();
}

function extractErrorMessage(data: { message?: string; details?: string[] }) {
  if (data.details?.length) {
    return data.details.join(' ');
  }
  return data.message ?? 'Room request failed.';
}

function getNetworkMessage(error: unknown) {
  if (error instanceof Error) {
    return `${error.message}. Check that the Sentri backend is running on your Mac.`;
  }
  return 'Could not reach the Sentri backend. Check that it is running on your Mac.';
}
