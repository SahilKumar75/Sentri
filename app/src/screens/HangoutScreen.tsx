import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AvatarButton } from '../components/sentri-ui';
import { theme } from '../design/tokens';
import { getStoredJson, setStoredJson } from '../lib/device-store';
import {
  buildSeedActivity,
  buildSeedChat,
  buildSeedParticipants,
  defaultMeetingSettings,
  type MeetingActivityItem,
  type MeetingChatMessage,
  type MeetingPanel,
  type MeetingParticipant,
  type MeetingSettings,
} from '../lib/hangout-meeting';
import {
  createRoom,
  extractRoomCode,
  getRoom,
  joinRoom,
  listRooms,
  type HangoutRoom,
} from '../lib/hangout-api';

type HangoutScreenProps = {
  onOpenDrawer: () => void;
  avatarLabel: string;
  sessionToken: string | null;
  userName: string;
  incomingRoomCode: string | null;
  onConsumeIncomingRoomCode: () => void;
  onMeetingModeChange: (visible: boolean) => void;
};

type Friend = {
  name: string;
  status: 'online' | 'offline';
  note: string;
};

const friends: Friend[] = [
  { name: 'Ananya', status: 'online', note: 'Ready for revision' },
  { name: 'Isha', status: 'online', note: 'Can join in 2 min' },
  { name: 'Mehul', status: 'online', note: 'Waiting for link' },
  { name: 'Rohan', status: 'offline', note: 'Back after class' },
  { name: 'Pranav', status: 'offline', note: 'At the gym' },
];

export default function HangoutScreen({
  onOpenDrawer,
  avatarLabel,
  sessionToken,
  userName,
  incomingRoomCode,
  onConsumeIncomingRoomCode,
  onMeetingModeChange,
}: HangoutScreenProps) {
  const [rooms, setRooms] = useState<HangoutRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<HangoutRoom | null>(null);
  const [roomName, setRoomName] = useState('DBMS Revision Room');
  const [roomType, setRoomType] = useState('Study');
  const [joinInput, setJoinInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('Create a room or paste a room link to join one.');
  const [loading, setLoading] = useState(false);

  const [meetingOpen, setMeetingOpen] = useState(false);
  const [meetingPanel, setMeetingPanel] = useState<MeetingPanel>('none');
  const [meetingParticipants, setMeetingParticipants] = useState<MeetingParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<MeetingChatMessage[]>([]);
  const [activityFeed, setActivityFeed] = useState<MeetingActivityItem[]>([]);
  const [meetingSettings, setMeetingSettings] = useState<MeetingSettings>(defaultMeetingSettings);
  const [chatDraft, setChatDraft] = useState('');
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [captionsOn, setCaptionsOn] = useState(false);
  const [shareScreenOn, setShareScreenOn] = useState(false);
  const [handRaised, setHandRaised] = useState(false);
  const [recordingOn, setRecordingOn] = useState(false);
  const [focusedParticipantId, setFocusedParticipantId] = useState<string | null>(null);
  const [reactionBurst, setReactionBurst] = useState<{ icon: string; label: string } | null>(null);

  useEffect(() => {
    onMeetingModeChange(meetingOpen);
    return () => onMeetingModeChange(false);
  }, [meetingOpen, onMeetingModeChange]);

  useEffect(() => {
    void refreshRooms();
  }, []);

  useEffect(() => {
    if (!incomingRoomCode) {
      return;
    }
    void handleJoinByCode(incomingRoomCode, true);
  }, [incomingRoomCode]);

  useEffect(() => {
    if (!reactionBurst) {
      return;
    }
    const timeout = setTimeout(() => setReactionBurst(null), 1800);
    return () => clearTimeout(timeout);
  }, [reactionBurst]);

  const activeRoomShareText = useMemo(() => {
    if (!activeRoom) {
      return '';
    }
    return [
      `Join my Sentri room: ${activeRoom.roomName}`,
      `Code: ${activeRoom.roomCode}`,
      `Link: ${activeRoom.joinLink}`,
    ].join('\n');
  }, [activeRoom]);

  const stageParticipant = useMemo(() => {
    if (!meetingParticipants.length) {
      return null;
    }
    if (shareScreenOn) {
      return meetingParticipants[0];
    }
    if (focusedParticipantId) {
      return meetingParticipants.find((participant) => participant.id === focusedParticipantId) ?? meetingParticipants[0];
    }
    return meetingParticipants.find((participant) => participant.speaking) ?? meetingParticipants[0];
  }, [focusedParticipantId, meetingParticipants, shareScreenOn]);

  const tileParticipants = useMemo(
    () =>
      meetingSettings.layout === 'grid'
        ? meetingParticipants
        : meetingParticipants.filter((participant) => participant.id !== stageParticipant?.id),
    [meetingParticipants, meetingSettings.layout, stageParticipant]
  );

  const visibleParticipantCount = useMemo(() => {
    if (meetingSettings.layout === 'grid') {
      return meetingParticipants.length;
    }
    return Math.max(meetingParticipants.length - 1, 0);
  }, [meetingParticipants.length, meetingSettings.layout]);

  const isHost = useMemo(() => {
    if (!activeRoom) {
      return true;
    }
    return activeRoom.ownerDisplayName.trim().toLowerCase() === userName.trim().toLowerCase();
  }, [activeRoom, userName]);

  const canShareScreen = isHost || meetingSettings.allowGuestScreenShare;

  useEffect(() => {
    void getStoredJson<{
      roomName: string;
      roomType: string;
      joinInput: string;
      activeRoom: HangoutRoom | null;
    } | null>('sentri.hangout.state', null).then((stored) => {
      if (!stored) {
        return;
      }
      setRoomName(stored.roomName);
      setRoomType(stored.roomType);
      setJoinInput(stored.joinInput);
      setActiveRoom(stored.activeRoom);
      if (stored.activeRoom) {
        seedMeetingRoom(stored.activeRoom);
      }
    });
  }, []);

  useEffect(() => {
    void setStoredJson('sentri.hangout.state', {
      roomName,
      roomType,
      joinInput,
      activeRoom,
    });
  }, [roomName, roomType, joinInput, activeRoom]);

  async function refreshRooms() {
    const result = await listRooms();
    if (result.ok) {
      setRooms(result.rooms);
      return;
    }
    setStatusMessage(result.message);
  }

  function seedMeetingRoom(room: HangoutRoom) {
    const participants = buildSeedParticipants(room, userName);
    setMeetingParticipants(participants);
    setChatMessages(buildSeedChat(room));
    setActivityFeed(buildSeedActivity(room));
    setMeetingSettings(defaultMeetingSettings);
    setChatDraft('');
    setMicOn(true);
    setCameraOn(true);
    setCaptionsOn(false);
    setShareScreenOn(false);
    setHandRaised(false);
    setRecordingOn(false);
    setFocusedParticipantId(participants[1]?.id ?? participants[0]?.id ?? null);
    setReactionBurst(null);
  }

  async function handleCreateRoom() {
    if (!sessionToken) {
      setStatusMessage('Login first so Sentri can create a room under your account.');
      return;
    }

    setLoading(true);
    const result = await createRoom(sessionToken, {
      roomName: roomName.trim() || 'Sentri Room',
      roomType,
    });
    setLoading(false);

    if (!result.ok) {
      setStatusMessage(result.message);
      return;
    }

    setActiveRoom(result.room);
    setJoinInput(result.room.joinLink);
    seedMeetingRoom(result.room);
    setStatusMessage(`Room ${result.room.roomCode} is live and ready to share.`);
    await refreshRooms();
  }

  async function handleJoinByCode(rawValue?: string, fromIncomingLink = false) {
    const code = extractRoomCode(rawValue ?? joinInput);
    if (!code) {
      setStatusMessage('Paste a Sentri room link or room code first.');
      if (fromIncomingLink) {
        onConsumeIncomingRoomCode();
      }
      return;
    }

    setLoading(true);
    const result = await joinRoom(code, userName);
    setLoading(false);

    if (!result.ok) {
      setStatusMessage(result.message);
      if (fromIncomingLink) {
        onConsumeIncomingRoomCode();
      }
      return;
    }

    setActiveRoom(result.room);
    setJoinInput(result.room.roomCode);
    seedMeetingRoom(result.room);
    setStatusMessage(`Joined ${result.room.roomName}.`);
    await refreshRooms();
    if (fromIncomingLink) {
      onConsumeIncomingRoomCode();
    }
  }

  async function handleOpenRoom(roomCode: string) {
    setLoading(true);
    const result = await getRoom(roomCode);
    setLoading(false);

    if (!result.ok) {
      setStatusMessage(result.message);
      return;
    }

    setActiveRoom(result.room);
    setJoinInput(result.room.roomCode);
    seedMeetingRoom(result.room);
    setStatusMessage(`${result.room.roomName} is ready.`);
  }

  async function handleShareRoom(friendName?: string) {
    if (!activeRoom) {
      setStatusMessage('Create or join a room before sharing it.');
      return;
    }

    const message = friendName
      ? `${activeRoomShareText}\nInviting ${friendName} from Sentri.`
      : activeRoomShareText;

    await Share.share({
      title: activeRoom.roomName,
      message,
    });
    setStatusMessage(friendName ? `Share sheet opened for ${friendName}.` : 'Share sheet opened.');
  }

  function handleEnterMeeting() {
    if (!activeRoom) {
      setStatusMessage('Open a room first.');
      return;
    }
    if (!meetingParticipants.length) {
      seedMeetingRoom(activeRoom);
    }
    setMeetingOpen(true);
    setStatusMessage(`Inside ${activeRoom.roomName}.`);
  }

  function handleLeaveMeeting() {
    setMeetingOpen(false);
    setMeetingPanel('none');
    setShareScreenOn(false);
    setRecordingOn(false);
    setFocusedParticipantId(meetingParticipants[1]?.id ?? meetingParticipants[0]?.id ?? null);
    setStatusMessage(activeRoom ? `Left ${activeRoom.roomName}. Room is still active.` : 'Left the meeting.');
  }

  function updateSelfParticipant(updater: (participant: MeetingParticipant) => MeetingParticipant) {
    setMeetingParticipants((current) =>
      current.map((participant, index) => (index === 0 ? updater(participant) : participant))
    );
  }

  function toggleMic() {
    setMicOn((current) => {
      const next = !current;
      updateSelfParticipant((participant) => ({ ...participant, muted: !next }));
      setStatusMessage(next ? 'Microphone is on.' : 'Microphone muted.');
      return next;
    });
  }

  function toggleCamera() {
    setCameraOn((current) => {
      const next = !current;
      updateSelfParticipant((participant) => ({ ...participant, videoOn: next }));
      setStatusMessage(next ? 'Camera is on.' : 'Camera turned off.');
      return next;
    });
  }

  function toggleShareScreen() {
    if (!canShareScreen) {
      setStatusMessage('The host has not enabled guest screen sharing for this room yet.');
      return;
    }
    setShareScreenOn((current) => {
      const next = !current;
      setStatusMessage(next ? 'You are presenting your screen.' : 'Screen sharing stopped.');
      return next;
    });
    setFocusedParticipantId(meetingParticipants[0]?.id ?? null);
  }

  function toggleHandRaised() {
    setHandRaised((current) => {
      const next = !current;
      updateSelfParticipant((participant) => ({ ...participant, handRaised: next }));
      setStatusMessage(next ? 'Hand raised.' : 'Hand lowered.');
      return next;
    });
  }

  function sendChatMessage() {
    if (!meetingSettings.allowChat) {
      setStatusMessage('The host has turned in-call chat off for this room.');
      return;
    }
    const text = chatDraft.trim();
    if (!text) {
      return;
    }
    setChatMessages((current) => [
      ...current,
      {
        id: `chat-${Date.now()}`,
        author: 'You',
        text,
        timeLabel: 'Now',
      },
    ]);
    setChatDraft('');
  }

  function toggleRecording() {
    setRecordingOn((current) => {
      const next = !current;
      setStatusMessage(next ? 'Recording started for the room.' : 'Recording stopped.');
      return next;
    });
  }

  function muteAllGuests() {
    setMeetingParticipants((current) =>
      current.map((participant, index) => (index === 0 ? participant : { ...participant, muted: true }))
    );
    setActivityFeed((current) => [
      {
        id: `mute-all-${Date.now()}`,
        title: 'Host action',
        detail: 'All guest microphones were muted',
        timeLabel: 'Now',
      },
      ...current,
    ]);
  }

  function lowerAllHands() {
    setMeetingParticipants((current) => current.map((participant) => ({ ...participant, handRaised: false })));
    setHandRaised(false);
    setActivityFeed((current) => [
      {
        id: `lower-hands-${Date.now()}`,
        title: 'Host action',
        detail: 'Raised hands were cleared',
        timeLabel: 'Now',
      },
      ...current,
    ]);
    setStatusMessage('Raised hands were cleared for everyone.');
  }

  function sendReaction(icon: string, label: string) {
    setReactionBurst({ icon, label });
    setActivityFeed((current) => [
      {
        id: `reaction-${Date.now()}`,
        title: 'Reaction sent',
        detail: `You sent ${label} in the room`,
        timeLabel: 'Now',
      },
      ...current,
    ]);
    setStatusMessage(`Reaction sent: ${label}.`);
  }

  function renderLobby() {
    return (
      <ScrollView style={styles.lobbyScreen} contentContainerStyle={styles.lobbyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <AvatarButton onPress={onOpenDrawer} label={avatarLabel} />
          <View style={styles.topCopy}>
            <Text style={styles.kicker}>Hangout</Text>
            <Text style={styles.title}>Create, share, and step into a Meet-style room.</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Create room</Text>
          <TextInput
            style={styles.input}
            value={roomName}
            onChangeText={setRoomName}
            placeholder="Room name"
            placeholderTextColor={theme.colors.textMuted}
          />
          <View style={styles.typeRow}>
            {['Study', 'Watch', 'Call'].map((type) => {
              const active = roomType === type;
              return (
                <Pressable
                  key={type}
                  onPress={() => setRoomType(type)}
                  style={[styles.typeChip, active && styles.typeChipActive]}
                >
                  <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{type}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.actionRow}>
            <Pressable
              style={[styles.actionButton, styles.actionButtonFilled, loading && styles.disabledButton]}
              onPress={() => void handleCreateRoom()}
              disabled={loading}
            >
              <Text style={styles.actionFilledText}>{loading ? 'Please wait' : 'Create room'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Join room</Text>
          <TextInput
            style={styles.input}
            value={joinInput}
            onChangeText={setJoinInput}
            placeholder="Paste room code or sentri://hangout/ABCD1234"
            placeholderTextColor={theme.colors.textMuted}
            autoCapitalize="characters"
            autoCorrect={false}
          />
          <Pressable
            style={[styles.actionButton, styles.actionButtonGhost, loading && styles.disabledButton]}
            onPress={() => void handleJoinByCode()}
            disabled={loading}
          >
            <Text style={styles.actionGhostText}>{loading ? 'Please wait' : 'Join room'}</Text>
          </Pressable>
        </View>

        <View style={styles.statusBanner}>
          <Text style={styles.statusBannerText}>{statusMessage}</Text>
        </View>

        {activeRoom ? (
          <View style={styles.linkCard}>
            <View style={styles.linkHeader}>
              <View>
                <Text style={styles.linkLabel}>Room ready</Text>
                <Text style={styles.linkValue}>{activeRoom.roomName}</Text>
              </View>
              <View style={styles.linkStatus}>
                <Text style={styles.linkStatusText}>{activeRoom.roomCode}</Text>
              </View>
            </View>
            <Text style={styles.roomMetaLine}>
              {activeRoom.roomType} • {activeRoom.ownerDisplayName} • {activeRoom.participantCount} in room
            </Text>
            <Text style={styles.joinLinkText}>{activeRoom.joinLink}</Text>
            <View style={styles.previewCard}>
              <View style={styles.previewVisual}>
                <Text style={styles.previewInitials}>{getInitials(userName)}</Text>
                <View style={styles.previewBadgeRow}>
                  <View style={styles.previewBadge}>
                    <Ionicons name={micOn ? 'mic' : 'mic-off'} size={14} color="#FFFFFF" />
                    <Text style={styles.previewBadgeText}>{micOn ? 'Mic ready' : 'Muted'}</Text>
                  </View>
                  <View style={styles.previewBadge}>
                    <Ionicons name={cameraOn ? 'videocam' : 'videocam-off'} size={14} color="#FFFFFF" />
                    <Text style={styles.previewBadgeText}>{cameraOn ? 'Camera on' : 'Camera off'}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.previewActions}>
                <Pressable style={styles.previewToggle} onPress={toggleMic}>
                  <Ionicons name={micOn ? 'mic' : 'mic-off'} size={16} color={theme.colors.text} />
                  <Text style={styles.previewToggleText}>{micOn ? 'Mute mic' : 'Unmute mic'}</Text>
                </Pressable>
                <Pressable style={styles.previewToggle} onPress={toggleCamera}>
                  <Ionicons name={cameraOn ? 'videocam' : 'videocam-off'} size={16} color={theme.colors.text} />
                  <Text style={styles.previewToggleText}>{cameraOn ? 'Turn camera off' : 'Turn camera on'}</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.lobbyCtaRow}>
              <Pressable style={[styles.actionButton, styles.actionButtonFilled]} onPress={handleEnterMeeting}>
                <Text style={styles.actionFilledText}>Join now</Text>
              </Pressable>
              <Pressable style={[styles.actionButton, styles.actionButtonGhost]} onPress={() => void handleShareRoom()}>
                <Text style={styles.actionGhostText}>Share</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Live rooms</Text>
            <Pressable onPress={() => void refreshRooms()}>
              <Text style={styles.sectionMeta}>Refresh</Text>
            </Pressable>
          </View>
          {rooms.map((room) => (
            <Pressable key={room.roomCode} style={styles.roomCard} onPress={() => void handleOpenRoom(room.roomCode)}>
              <View style={styles.roomBadge}>
                <Text style={styles.roomBadgeText}>{room.roomName.charAt(0).toUpperCase()}</Text>
              </View>
              <View style={styles.roomCopy}>
                <Text style={styles.roomTitle}>{room.roomName}</Text>
                <Text style={styles.roomMeta}>
                  {room.roomType} • {room.ownerDisplayName}
                </Text>
              </View>
              <View style={styles.roomRight}>
                <Text style={styles.roomInvited}>{room.participantCount} in room</Text>
                <Text style={styles.roomLinkLabel}>{room.roomCode}</Text>
              </View>
            </Pressable>
          ))}
          {rooms.length === 0 ? (
            <View style={styles.emptyRooms}>
              <Text style={styles.emptyRoomsTitle}>No rooms yet</Text>
              <Text style={styles.emptyRoomsBody}>
                Create the first study room or join one from a Sentri link.
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Friends</Text>
            <Text style={styles.sectionMeta}>Invite list</Text>
          </View>
          {friends.map((friend) => (
            <View key={friend.name} style={styles.friendRow}>
              <View style={styles.friendLeft}>
                <View
                  style={[
                    styles.statusDot,
                    friend.status === 'online' ? styles.statusDotOnline : styles.statusDotOffline,
                  ]}
                />
                <View>
                  <Text style={styles.friendName}>{friend.name}</Text>
                  <Text style={styles.friendNote}>{friend.note}</Text>
                </View>
              </View>
              <Pressable
                style={[styles.inviteButton, !activeRoom && styles.disabledButton]}
                onPress={() => void handleShareRoom(friend.name)}
                disabled={!activeRoom}
              >
                <Text style={styles.inviteButtonText}>Invite</Text>
              </Pressable>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  }

  function renderMeeting() {
    return (
      <View style={styles.meetingScreen}>
        <View style={styles.meetingHeader}>
          <Pressable style={styles.meetingHeaderButton} onPress={handleLeaveMeeting}>
            <Ionicons name="chevron-back" size={18} color={theme.colors.darkText} />
          </Pressable>
          <View style={styles.meetingHeaderCopy}>
            <Text style={styles.meetingTitle}>{activeRoom?.roomName ?? 'Sentri call'}</Text>
            <Text style={styles.meetingMeta}>
              {activeRoom?.roomCode ?? 'ROOM'} • {visibleParticipantCount} visible • {recordingOn ? 'Recording' : 'Live'}
            </Text>
          </View>
          <Pressable style={styles.meetingHeaderButton} onPress={() => setMeetingPanel('details')}>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.darkText} />
          </Pressable>
        </View>

        <View style={styles.meetingStage}>
          <View style={styles.stageCard}>
            <View style={styles.stageTopRow}>
              <View style={styles.stageChip}>
                <Text style={styles.stageChipText}>
                  {meetingSettings.layout === 'grid' ? 'Grid view' : shareScreenOn ? 'Presenting now' : 'Active speaker'}
                </Text>
              </View>
              {recordingOn ? (
                <View style={styles.recordingChip}>
                  <View style={styles.recordingDot} />
                  <Text style={styles.recordingText}>Recording</Text>
                </View>
              ) : null}
            </View>

            {shareScreenOn ? (
              <View style={styles.shareStage}>
                <Text style={styles.shareStageLabel}>Your screen</Text>
                <Text style={styles.shareStageTitle}>{activeRoom?.roomName ?? 'Shared notes'}</Text>
                <Text style={styles.shareStageBody}>
                  Share blackboard photos, notes, or the weekly timetable while everyone stays in the same room.
                </Text>
              </View>
            ) : (
              <View
                style={[
                  styles.spotlightTile,
                  { backgroundColor: stageParticipant?.tileTone ?? theme.colors.blue },
                ]}
              >
                <Text style={styles.spotlightInitials}>
                  {getInitials(stageParticipant?.name ?? userName)}
                </Text>
                <View style={styles.tileFooter}>
                  <View>
                    <Text style={styles.tileName}>{stageParticipant?.name ?? userName}</Text>
                    <Text style={styles.tileMeta}>{stageParticipant?.subtitle ?? 'You'}</Text>
                  </View>
                  <View style={styles.tileFooterIcons}>
                    {stageParticipant?.handRaised ? (
                      <Ionicons name="hand-left" size={15} color="#FFFFFF" />
                    ) : null}
                    <Ionicons
                      name={stageParticipant?.muted ? 'mic-off' : 'mic'}
                      size={15}
                      color="#FFFFFF"
                    />
                  </View>
                </View>
              </View>
            )}

            {captionsOn ? (
              <View style={styles.captionBubble}>
                <Text style={styles.captionLabel}>Live captions</Text>
                <Text style={styles.captionText}>Prof. Deshmukh: Let&apos;s revise normalization before we solve the next DBMS problem.</Text>
              </View>
            ) : null}

            {reactionBurst ? (
              <View style={styles.reactionBubble}>
                <Text style={styles.reactionEmoji}>{reactionBurst.icon}</Text>
                <Text style={styles.reactionLabel}>{reactionBurst.label}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.tileStrip}>
            {tileParticipants.map((participant) => (
              <Pressable
                key={participant.id}
                style={[
                  styles.participantTile,
                  participant.id === focusedParticipantId && styles.participantTileFocused,
                  { backgroundColor: participant.videoOn ? participant.tileTone : '#202124' },
                ]}
                onPress={() => setFocusedParticipantId(participant.id)}
              >
                <View style={styles.participantTopRow}>
                  <View style={styles.connectionPill}>
                    <Text style={styles.connectionText}>{participant.connection}</Text>
                  </View>
                  {participant.handRaised ? <Ionicons name="hand-left" size={14} color="#FFFFFF" /> : null}
                </View>
                <Text style={styles.participantInitials}>{getInitials(participant.name)}</Text>
                <View style={styles.tileFooter}>
                  <View>
                    <Text style={styles.tileName}>{participant.name}</Text>
                    <Text style={styles.tileMeta}>{participant.subtitle}</Text>
                  </View>
                  <Ionicons name={participant.muted ? 'mic-off' : 'mic'} size={15} color="#FFFFFF" />
                </View>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.reactionRow}>
          {[
            { icon: '👏', label: 'Clap' },
            { icon: '🔥', label: 'Fire' },
            { icon: '👍', label: 'Thumbs up' },
            { icon: '🙌', label: 'Celebrate' },
          ].map((reaction) => (
            <Pressable
              key={reaction.label}
              style={styles.reactionChip}
              onPress={() => sendReaction(reaction.icon, reaction.label)}
            >
              <Text style={styles.reactionChipEmoji}>{reaction.icon}</Text>
              <Text style={styles.reactionChipText}>{reaction.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.controlDock}>
          <View style={styles.quickSummaryRow}>
            <View style={styles.quickSummaryChip}>
              <Text style={styles.quickSummaryValue}>{micOn ? 'Mic on' : 'Muted'}</Text>
              <Text style={styles.quickSummaryLabel}>{micOn ? 'Audio ready' : 'You are muted'}</Text>
            </View>
            <View style={styles.quickSummaryChip}>
              <Text style={styles.quickSummaryValue}>{cameraOn ? 'Video on' : 'Video off'}</Text>
              <Text style={styles.quickSummaryLabel}>{cameraOn ? 'Visible to room' : 'Camera paused'}</Text>
            </View>
            <View style={styles.quickSummaryChip}>
              <Text style={styles.quickSummaryValue}>{meetingSettings.layout === 'grid' ? 'Grid' : 'Spotlight'}</Text>
              <Text style={styles.quickSummaryLabel}>{meetingSettings.audioOutput}</Text>
            </View>
          </View>

          <View style={styles.controlRow}>
            <MeetingControlButton
              label={micOn ? 'Mic on' : 'Mic off'}
              icon={micOn ? 'mic' : 'mic-off'}
              active={micOn}
              onPress={toggleMic}
            />
            <MeetingControlButton
              label={cameraOn ? 'Video on' : 'Video off'}
              icon={cameraOn ? 'videocam' : 'videocam-off'}
              active={cameraOn}
              onPress={toggleCamera}
            />
            <MeetingControlButton
              label={shareScreenOn ? 'Stop share' : 'Share'}
              icon={shareScreenOn ? 'stop-circle' : 'desktop'}
              active={shareScreenOn}
              onPress={toggleShareScreen}
            />
            <MeetingControlButton
              label={handRaised ? 'Hand up' : 'Raise'}
              icon="hand-left"
              active={handRaised}
              onPress={toggleHandRaised}
            />
          </View>

          <View style={styles.controlRow}>
            <MeetingControlButton
              label={captionsOn ? 'Captions on' : 'Captions'}
              icon="chatbubble-ellipses"
              active={captionsOn}
              onPress={() => setCaptionsOn((current) => !current)}
            />
            <MeetingControlButton
              label="People"
              icon="people"
              active={meetingPanel === 'people'}
              onPress={() => setMeetingPanel('people')}
            />
            <MeetingControlButton
              label="Chat"
              icon="chatbox"
              active={meetingPanel === 'chat'}
              onPress={() => setMeetingPanel('chat')}
            />
            <MeetingControlButton
              label="Settings"
              icon="settings"
              active={meetingPanel === 'settings'}
              onPress={() => setMeetingPanel('settings')}
            />
            <Pressable style={styles.endCallButton} onPress={handleLeaveMeeting}>
              <Ionicons name="call" size={18} color="#FFFFFF" style={styles.endCallIcon} />
              <Text style={styles.endCallText}>Leave</Text>
            </Pressable>
          </View>
        </View>

        <MeetingPanelSheet
          visible={meetingPanel !== 'none'}
          panel={meetingPanel}
          participants={meetingParticipants}
          messages={chatMessages}
          activityFeed={activityFeed}
          chatDraft={chatDraft}
          onChangeChatDraft={setChatDraft}
          onSendChat={sendChatMessage}
          settings={meetingSettings}
          onClose={() => setMeetingPanel('none')}
          onToggleRecording={toggleRecording}
          recordingOn={recordingOn}
          onShareRoom={() => void handleShareRoom()}
          onUpdateSettings={setMeetingSettings}
          isHost={isHost}
          onMuteAllGuests={muteAllGuests}
          onLowerAllHands={lowerAllHands}
        />
      </View>
    );
  }

  return meetingOpen ? renderMeeting() : renderLobby();
}

function MeetingControlButton({
  label,
  icon,
  active,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.controlButton, active && styles.controlButtonActive]} onPress={onPress}>
      <Ionicons name={icon} size={18} color="#FFFFFF" />
      <Text style={styles.controlButtonText}>{label}</Text>
    </Pressable>
  );
}

function MeetingPanelSheet({
  visible,
  panel,
  participants,
  messages,
  activityFeed,
  chatDraft,
  onChangeChatDraft,
  onSendChat,
  settings,
  onClose,
  onToggleRecording,
  recordingOn,
  onShareRoom,
  onUpdateSettings,
  isHost,
  onMuteAllGuests,
  onLowerAllHands,
}: {
  visible: boolean;
  panel: MeetingPanel;
  participants: MeetingParticipant[];
  messages: MeetingChatMessage[];
  activityFeed: MeetingActivityItem[];
  chatDraft: string;
  onChangeChatDraft: (value: string) => void;
  onSendChat: () => void;
  settings: MeetingSettings;
  onClose: () => void;
  onToggleRecording: () => void;
  recordingOn: boolean;
  onShareRoom: () => void;
  onUpdateSettings: (value: MeetingSettings) => void;
  isHost: boolean;
  onMuteAllGuests: () => void;
  onLowerAllHands: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.panelBackdrop}>
        <Pressable style={styles.panelScrim} onPress={onClose} />
        <View style={styles.panelSheet}>
          <View style={styles.panelHeader}>
            <Text style={styles.panelTitle}>{panelTitleMap[panel]}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={20} color={theme.colors.text} />
            </Pressable>
          </View>

          {panel === 'people' ? (
            <ScrollView style={styles.panelScroll} showsVerticalScrollIndicator={false}>
              {isHost ? (
                <View style={styles.hostToolsRow}>
                  <Pressable style={styles.hostToolButton} onPress={onMuteAllGuests}>
                    <Ionicons name="mic-off" size={15} color={theme.colors.accentStrong} />
                    <Text style={styles.hostToolText}>Mute all</Text>
                  </Pressable>
                  <Pressable style={styles.hostToolButton} onPress={onLowerAllHands}>
                    <Ionicons name="hand-left" size={15} color={theme.colors.accentStrong} />
                    <Text style={styles.hostToolText}>Lower hands</Text>
                  </Pressable>
                </View>
              ) : (
                <View style={styles.guestNotice}>
                  <Text style={styles.guestNoticeText}>Only the host can change room-wide controls.</Text>
                </View>
              )}
              {participants.map((participant) => (
                <View key={participant.id} style={styles.panelRow}>
                  <View style={[styles.panelAvatar, { backgroundColor: participant.tileTone }]}>
                    <Text style={styles.panelAvatarText}>{getInitials(participant.name)}</Text>
                  </View>
                  <View style={styles.panelCopy}>
                    <Text style={styles.panelName}>{participant.name}</Text>
                    <Text style={styles.panelSubtitle}>
                      {participant.subtitle} • {participant.connection}
                    </Text>
                  </View>
                  <View style={styles.panelIcons}>
                    {participant.handRaised ? (
                      <Ionicons name="hand-left" size={15} color={theme.colors.textSoft} />
                    ) : null}
                    <Ionicons
                      name={participant.muted ? 'mic-off' : 'mic'}
                      size={15}
                      color={theme.colors.textSoft}
                    />
                    <Ionicons
                      name={participant.videoOn ? 'videocam' : 'videocam-off'}
                      size={15}
                      color={theme.colors.textSoft}
                    />
                  </View>
                </View>
              ))}
            </ScrollView>
          ) : null}

          {panel === 'chat' ? (
            <View style={styles.chatSheet}>
              {!settings.allowChat ? (
                <View style={styles.guestNotice}>
                  <Text style={styles.guestNoticeText}>Chat is off for this room, so new messages are blocked.</Text>
                </View>
              ) : null}
              <ScrollView style={styles.panelScroll} showsVerticalScrollIndicator={false}>
                {messages.map((message) => (
                  <View key={message.id} style={styles.messageCard}>
                    <View style={styles.messageHeader}>
                      <Text style={styles.messageAuthor}>{message.author}</Text>
                      <Text style={styles.messageTime}>{message.timeLabel}</Text>
                    </View>
                    <Text style={styles.messageBody}>{message.text}</Text>
                  </View>
                ))}
              </ScrollView>
              <View style={styles.chatComposer}>
                <TextInput
                  style={[styles.chatInput, !settings.allowChat && styles.chatInputDisabled]}
                  value={chatDraft}
                  onChangeText={onChangeChatDraft}
                  placeholder={settings.allowChat ? 'Send a message' : 'Chat disabled by host'}
                  placeholderTextColor={theme.colors.textMuted}
                  editable={settings.allowChat}
                />
                <Pressable
                  style={[styles.chatSendButton, !settings.allowChat && styles.chatSendButtonDisabled]}
                  onPress={onSendChat}
                  disabled={!settings.allowChat}
                >
                  <Ionicons name="send" size={16} color="#FFFFFF" />
                </Pressable>
              </View>
            </View>
          ) : null}

          {panel === 'details' ? (
            <ScrollView style={styles.panelScroll} showsVerticalScrollIndicator={false}>
              <View style={styles.detailCard}>
                <Text style={styles.detailLabel}>Room info</Text>
                <Text style={styles.detailTitle}>Meet-style controls are live</Text>
                <Text style={styles.detailBody}>
                  Share the room, turn on captions, present your screen, and manage people from the same call surface.
                </Text>
              </View>
              <Pressable style={styles.detailAction} onPress={onShareRoom}>
                <Ionicons name="share-social" size={18} color={theme.colors.accentStrong} />
                <Text style={styles.detailActionText}>Share room link</Text>
              </Pressable>
              <Pressable style={styles.detailAction} onPress={onToggleRecording}>
                <Ionicons name="radio-button-on" size={18} color={theme.colors.accentStrong} />
                <Text style={styles.detailActionText}>{recordingOn ? 'Stop recording' : 'Start recording'}</Text>
              </Pressable>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Room policy</Text>
                <View style={styles.policyRow}>
                  <Text style={styles.policyLabel}>Host role</Text>
                  <Text style={styles.policyValue}>{isHost ? 'You are host' : 'Guest view'}</Text>
                </View>
                <View style={styles.policyRow}>
                  <Text style={styles.policyLabel}>In-call chat</Text>
                  <Text style={styles.policyValue}>{settings.allowChat ? 'On' : 'Off'}</Text>
                </View>
                <View style={styles.policyRow}>
                  <Text style={styles.policyLabel}>Guest screen share</Text>
                  <Text style={styles.policyValue}>{settings.allowGuestScreenShare ? 'Allowed' : 'Host only'}</Text>
                </View>
                <View style={styles.policyRow}>
                  <Text style={styles.policyLabel}>Waiting room</Text>
                  <Text style={styles.policyValue}>{settings.waitingRoomEnabled ? 'Enabled' : 'Disabled'}</Text>
                </View>
                <View style={styles.policyRow}>
                  <Text style={styles.policyLabel}>Audio output</Text>
                  <Text style={styles.policyValue}>{settings.audioOutput}</Text>
                </View>
                <View style={styles.policyRow}>
                  <Text style={styles.policyLabel}>Video quality</Text>
                  <Text style={styles.policyValue}>{settings.videoQuality}</Text>
                </View>
              </View>
              <View style={styles.detailSection}>
                <Text style={styles.detailSectionTitle}>Activity</Text>
                {activityFeed.map((item) => (
                  <View key={item.id} style={styles.activityRow}>
                    <View style={styles.activityDot} />
                    <View style={styles.activityCopy}>
                      <Text style={styles.activityTitle}>{item.title}</Text>
                      <Text style={styles.activityBody}>{item.detail}</Text>
                    </View>
                    <Text style={styles.activityTime}>{item.timeLabel}</Text>
                  </View>
                ))}
              </View>
            </ScrollView>
          ) : null}

          {panel === 'settings' ? (
            <ScrollView style={styles.panelScroll} showsVerticalScrollIndicator={false}>
              <SettingsRow
                label="Noise cancellation"
                value={settings.noiseCancellation}
                onValueChange={(value) => onUpdateSettings({ ...settings, noiseCancellation: value })}
              />
              <SettingsRow
                label="Low light mode"
                value={settings.lowLightMode}
                onValueChange={(value) => onUpdateSettings({ ...settings, lowLightMode: value })}
              />
              <SettingsRow
                label="Mirror self view"
                value={settings.mirrorSelfView}
                onValueChange={(value) => onUpdateSettings({ ...settings, mirrorSelfView: value })}
              />
              <SettingsRow
                label="Allow in-call chat"
                value={settings.allowChat}
                onValueChange={(value) => onUpdateSettings({ ...settings, allowChat: value })}
              />
              <SettingsRow
                label="Allow guest screen share"
                value={settings.allowGuestScreenShare}
                onValueChange={(value) => onUpdateSettings({ ...settings, allowGuestScreenShare: value })}
              />
              <SettingsRow
                label="Waiting room"
                value={settings.waitingRoomEnabled}
                onValueChange={(value) => onUpdateSettings({ ...settings, waitingRoomEnabled: value })}
              />

              <Text style={styles.settingsLabel}>Layout</Text>
              <View style={styles.settingsChipRow}>
                {(['spotlight', 'grid'] as const).map((layout) => {
                  const active = settings.layout === layout;
                  return (
                    <Pressable
                      key={layout}
                      style={[styles.settingsChip, active && styles.settingsChipActive]}
                      onPress={() => onUpdateSettings({ ...settings, layout })}
                    >
                      <Text style={[styles.settingsChipText, active && styles.settingsChipTextActive]}>
                        {layout === 'spotlight' ? 'Spotlight' : 'Grid'}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.settingsLabel}>Audio output</Text>
              <View style={styles.settingsChipRow}>
                {(['Speaker', 'Earpiece', 'Bluetooth'] as const).map((output) => {
                  const active = settings.audioOutput === output;
                  return (
                    <Pressable
                      key={output}
                      style={[styles.settingsChip, active && styles.settingsChipActive]}
                      onPress={() => onUpdateSettings({ ...settings, audioOutput: output })}
                    >
                      <Text style={[styles.settingsChipText, active && styles.settingsChipTextActive]}>{output}</Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.settingsLabel}>Video quality</Text>
              <View style={styles.settingsChipRow}>
                {(['Auto', '720p'] as const).map((quality) => {
                  const active = settings.videoQuality === quality;
                  return (
                    <Pressable
                      key={quality}
                      style={[styles.settingsChip, active && styles.settingsChipActive]}
                      onPress={() => onUpdateSettings({ ...settings, videoQuality: quality })}
                    >
                      <Text style={[styles.settingsChipText, active && styles.settingsChipTextActive]}>{quality}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

function SettingsRow({
  label,
  value,
  onValueChange,
}: {
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.settingsRow}>
      <Text style={styles.settingsText}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: '#DADCE0', true: theme.colors.accentSoft }}
        thumbColor={value ? theme.colors.accentStrong : '#FFFFFF'}
      />
    </View>
  );
}

const panelTitleMap: Record<MeetingPanel, string> = {
  none: '',
  people: 'People',
  chat: 'In-call chat',
  details: 'Meeting details',
  settings: 'Call settings',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((segment) => segment.charAt(0).toUpperCase())
    .join('');
}

const styles = StyleSheet.create({
  lobbyScreen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  lobbyContent: {
    paddingHorizontal: theme.chrome.horizontalPadding,
    paddingTop: theme.chrome.topPadding,
    paddingBottom: theme.chrome.screenBottomInset,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topCopy: {
    flex: 1,
    gap: 2,
  },
  kicker: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  card: {
    marginTop: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 16,
    ...theme.shadow.soft,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  input: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: 15,
  },
  typeRow: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
  },
  typeChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  typeChipActive: {
    backgroundColor: theme.colors.accent,
  },
  typeChipText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  typeChipTextActive: {
    color: '#FFFFFF',
  },
  actionRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionButtonGhost: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.line,
  },
  actionButtonFilled: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  actionGhostText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  actionFilledText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.55,
  },
  statusBanner: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusBannerText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  linkCard: {
    marginTop: 16,
    backgroundColor: theme.colors.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
    ...theme.shadow.soft,
  },
  linkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  linkLabel: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  linkStatus: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linkStatusText: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
  },
  linkValue: {
    marginTop: 8,
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  roomMetaLine: {
    marginTop: 12,
    color: theme.colors.textSoft,
    fontSize: 14,
  },
  joinLinkText: {
    marginTop: 10,
    color: theme.colors.accentStrong,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  lobbyCtaRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  previewCard: {
    marginTop: 16,
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceAlt,
    padding: 14,
    gap: 12,
  },
  previewVisual: {
    minHeight: 140,
    borderRadius: 18,
    backgroundColor: theme.colors.accentStrong,
    padding: 14,
    justifyContent: 'space-between',
  },
  previewInitials: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
  },
  previewBadgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  previewActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  previewToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  previewToggleText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  section: {
    marginTop: 22,
  },
  emptyRooms: {
    marginTop: 6,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  emptyRoomsTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  emptyRoomsBody: {
    marginTop: 6,
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionMeta: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 16,
    marginBottom: 10,
  },
  roomBadge: {
    width: 46,
    height: 46,
    borderRadius: 16,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomBadgeText: {
    color: theme.colors.accentStrong,
    fontSize: 20,
    fontWeight: '800',
  },
  roomCopy: {
    flex: 1,
    gap: 4,
  },
  roomTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  roomMeta: {
    color: theme.colors.textSoft,
    fontSize: 13,
  },
  roomRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  roomInvited: {
    color: theme.colors.accentStrong,
    fontSize: 13,
    fontWeight: '800',
  },
  roomLinkLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 10,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  statusDotOnline: {
    backgroundColor: theme.colors.accent,
  },
  statusDotOffline: {
    backgroundColor: theme.colors.textMuted,
  },
  friendName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  friendNote: {
    marginTop: 4,
    color: theme.colors.textSoft,
    fontSize: 13,
  },
  inviteButton: {
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inviteButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  meetingScreen: {
    flex: 1,
    backgroundColor: theme.colors.darkBackground,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
  },
  meetingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  meetingHeaderButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: theme.colors.darkSurfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  meetingHeaderCopy: {
    flex: 1,
  },
  meetingTitle: {
    color: theme.colors.darkText,
    fontSize: 19,
    fontWeight: '800',
  },
  meetingMeta: {
    marginTop: 4,
    color: theme.colors.darkTextSoft,
    fontSize: 12,
    fontWeight: '600',
  },
  meetingStage: {
    flex: 1,
    marginTop: 16,
  },
  stageCard: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: '#141518',
    padding: 16,
    borderWidth: 1,
    borderColor: theme.colors.darkLine,
  },
  stageTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stageChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  stageChipText: {
    color: theme.colors.darkText,
    fontSize: 12,
    fontWeight: '700',
  },
  recordingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(234, 67, 53, 0.18)',
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EA4335',
  },
  recordingText: {
    color: '#F28B82',
    fontSize: 12,
    fontWeight: '800',
  },
  shareStage: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(138, 180, 248, 0.30)',
    backgroundColor: '#0F223D',
    padding: 18,
    justifyContent: 'center',
  },
  shareStageLabel: {
    color: '#AECBFA',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  shareStageTitle: {
    marginTop: 14,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  shareStageBody: {
    marginTop: 12,
    color: '#DADCE0',
    fontSize: 15,
    lineHeight: 23,
  },
  spotlightTile: {
    flex: 1,
    borderRadius: 24,
    padding: 18,
    justifyContent: 'space-between',
  },
  spotlightInitials: {
    color: '#FFFFFF',
    fontSize: 56,
    fontWeight: '800',
  },
  tileFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  tileName: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  tileMeta: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.80)',
    fontSize: 12,
    fontWeight: '600',
  },
  tileFooterIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  captionBubble: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.68)',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  captionLabel: {
    color: '#AECBFA',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  captionText: {
    marginTop: 5,
    color: '#FFFFFF',
    fontSize: 13,
    lineHeight: 20,
  },
  reactionBubble: {
    position: 'absolute',
    right: 16,
    top: 62,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
  },
  reactionEmoji: {
    fontSize: 30,
  },
  reactionLabel: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  tileStrip: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  participantTile: {
    width: '48.4%',
    minHeight: 126,
    borderRadius: 22,
    padding: 14,
    justifyContent: 'space-between',
  },
  participantTileFocused: {
    borderWidth: 2,
    borderColor: '#AECBFA',
  },
  participantTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  connectionPill: {
    borderRadius: theme.radius.pill,
    backgroundColor: 'rgba(0,0,0,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  connectionText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  participantInitials: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  reactionRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reactionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: theme.radius.pill,
    backgroundColor: '#16181B',
    borderWidth: 1,
    borderColor: theme.colors.darkLine,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  reactionChipEmoji: {
    fontSize: 16,
  },
  reactionChipText: {
    color: theme.colors.darkText,
    fontSize: 12,
    fontWeight: '700',
  },
  controlDock: {
    marginTop: 14,
    borderRadius: 28,
    backgroundColor: '#16181B',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: theme.colors.darkLine,
  },
  quickSummaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  quickSummaryChip: {
    flex: 1,
    minHeight: 58,
    borderRadius: 18,
    backgroundColor: '#1E2024',
    borderWidth: 1,
    borderColor: theme.colors.darkLine,
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  quickSummaryValue: {
    color: theme.colors.darkText,
    fontSize: 13,
    fontWeight: '800',
  },
  quickSummaryLabel: {
    marginTop: 3,
    color: theme.colors.darkTextSoft,
    fontSize: 11,
    fontWeight: '600',
  },
  controlRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 8,
  },
  controlButton: {
    minWidth: 80,
    borderRadius: 22,
    backgroundColor: '#2A2D31',
    paddingHorizontal: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  controlButtonActive: {
    backgroundColor: theme.colors.accentStrong,
  },
  controlButtonText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  endCallButton: {
    minWidth: 88,
    borderRadius: 22,
    backgroundColor: '#EA4335',
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  endCallIcon: {
    transform: [{ rotate: '135deg' }],
  },
  endCallText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  panelBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(9, 9, 9, 0.42)',
  },
  panelScrim: {
    flex: 1,
  },
  panelSheet: {
    minHeight: 340,
    maxHeight: '74%',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 28,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  panelTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  panelScroll: {
    flexGrow: 0,
  },
  panelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  hostToolsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  hostToolButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 16,
    backgroundColor: theme.colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  hostToolText: {
    color: theme.colors.accentStrong,
    fontSize: 13,
    fontWeight: '700',
  },
  guestNotice: {
    marginBottom: 12,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  guestNoticeText: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  panelAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  panelAvatarText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  panelCopy: {
    flex: 1,
  },
  panelName: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  panelSubtitle: {
    marginTop: 4,
    color: theme.colors.textSoft,
    fontSize: 13,
  },
  panelIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatSheet: {
    gap: 16,
  },
  messageCard: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageAuthor: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  messageTime: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  messageBody: {
    marginTop: 6,
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  chatComposer: {
    marginTop: 12,
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
  },
  chatInput: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: theme.colors.text,
  },
  chatInputDisabled: {
    opacity: 0.55,
  },
  chatSendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatSendButtonDisabled: {
    opacity: 0.5,
  },
  detailCard: {
    borderRadius: 22,
    backgroundColor: theme.colors.accentSoft,
    padding: 18,
  },
  detailLabel: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailTitle: {
    marginTop: 8,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  detailBody: {
    marginTop: 10,
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 22,
  },
  detailAction: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  detailActionText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  detailSection: {
    marginTop: 20,
  },
  detailSectionTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
  },
  policyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  policyLabel: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  policyValue: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 10,
  },
  activityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.accent,
    marginTop: 6,
  },
  activityCopy: {
    flex: 1,
  },
  activityTitle: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  activityBody: {
    marginTop: 4,
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 20,
  },
  activityTime: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  settingsText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  settingsLabel: {
    marginTop: 18,
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  settingsChipRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  settingsChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  settingsChipActive: {
    backgroundColor: theme.colors.accent,
  },
  settingsChipText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  settingsChipTextActive: {
    color: '#FFFFFF',
  },
});
