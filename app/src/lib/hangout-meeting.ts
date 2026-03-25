import type { HangoutRoom } from './hangout-api';

export type MeetingLayout = 'spotlight' | 'grid';
export type MeetingPanel = 'none' | 'people' | 'chat' | 'details' | 'settings';

export type MeetingParticipant = {
  id: string;
  name: string;
  role: 'host' | 'guest';
  subtitle: string;
  muted: boolean;
  videoOn: boolean;
  handRaised: boolean;
  tileTone: string;
  connection: 'strong' | 'fair' | 'weak';
  speaking: boolean;
};

export type MeetingChatMessage = {
  id: string;
  author: string;
  text: string;
  timeLabel: string;
};

export type MeetingActivityItem = {
  id: string;
  title: string;
  detail: string;
  timeLabel: string;
};

export type MeetingSettings = {
  layout: MeetingLayout;
  noiseCancellation: boolean;
  lowLightMode: boolean;
  mirrorSelfView: boolean;
  captionsLanguage: 'English';
  audioOutput: 'Speaker' | 'Earpiece' | 'Bluetooth';
  videoQuality: 'Auto' | '720p';
};

const palette = ['#1A73E8', '#185ABC', '#5F6368', '#8AB4F8', '#3C4043'];

export const defaultMeetingSettings: MeetingSettings = {
  layout: 'spotlight',
  noiseCancellation: true,
  lowLightMode: false,
  mirrorSelfView: true,
  captionsLanguage: 'English',
  audioOutput: 'Speaker',
  videoQuality: 'Auto',
};

export function buildSeedParticipants(room: HangoutRoom, userName: string): MeetingParticipant[] {
  const names = [
    userName,
    room.ownerDisplayName,
    'Aditi',
    'Mehul',
    'Ananya',
    'Rohan',
  ].filter(Boolean);

  return names.slice(0, Math.max(room.participantCount, 4)).map((name, index) => ({
    id: `${room.roomCode}-${index}`,
    name,
    role: index === 0 ? 'host' : 'guest',
    subtitle: index === 0 ? 'You' : index === 1 ? 'Host' : 'Student',
    muted: index > 1,
    videoOn: index < 3,
    handRaised: index === 3,
    tileTone: palette[index % palette.length],
    connection: index < 2 ? 'strong' : index === 2 ? 'fair' : 'weak',
    speaking: index === 1,
  }));
}

export function buildSeedChat(room: HangoutRoom): MeetingChatMessage[] {
  return [
    {
      id: `${room.roomCode}-chat-1`,
      author: room.ownerDisplayName,
      text: `Welcome to ${room.roomName}. Use the room code if someone needs to join late.`,
      timeLabel: 'Now',
    },
    {
      id: `${room.roomCode}-chat-2`,
      author: 'Ananya',
      text: 'Can someone share the DBMS notes after this?',
      timeLabel: 'Now',
    },
  ];
}

export function buildSeedActivity(room: HangoutRoom): MeetingActivityItem[] {
  return [
    {
      id: `${room.roomCode}-activity-1`,
      title: 'Room created',
      detail: `${room.ownerDisplayName} opened ${room.roomName}`,
      timeLabel: 'Just now',
    },
    {
      id: `${room.roomCode}-activity-2`,
      title: 'Join link ready',
      detail: 'Share the room link or code with your friends',
      timeLabel: 'Just now',
    },
  ];
}
