import { extractErrorMessage, getNetworkMessage, requestJson } from './http-client';

export async function listRooms() {
  try {
    const response = await requestJson('/hangout/rooms');
    if (!response.ok) {
      return { ok: false, message: extractErrorMessage(response.error, 'Room request failed.') };
    }
    return { ok: true, rooms: response.data };
  } catch (error) {
    return { ok: false, message: getNetworkMessage(error) };
  }
}

export async function createRoom(sessionToken, payload) {
  return mutateRoom('/hangout/rooms', 'POST', payload, sessionToken);
}

export async function getRoom(roomCode) {
  return fetchRoom(`/hangout/rooms/${normalizeRoomCode(roomCode)}`);
}

export async function joinRoom(roomCode, guestName) {
  return mutateRoom(
    `/hangout/rooms/${normalizeRoomCode(roomCode)}/join`,
    'POST',
    guestName ? { guestName } : {},
    null
  );
}

export function extractRoomCode(value) {
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

async function fetchRoom(path) {
  try {
    const response = await requestJson(path);
    if (!response.ok) {
      return { ok: false, message: extractErrorMessage(response.error, 'Room request failed.') };
    }
    return { ok: true, room: response.data };
  } catch (error) {
    return { ok: false, message: getNetworkMessage(error) };
  }
}

async function mutateRoom(path, method, payload, sessionToken) {
  try {
    const response = await requestJson(path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return { ok: false, message: extractErrorMessage(response.error, 'Room request failed.') };
    }
    return { ok: true, room: response.data };
  } catch (error) {
    return { ok: false, message: getNetworkMessage(error) };
  }
}

function normalizeRoomCode(value) {
  return value.trim().toUpperCase();
}
