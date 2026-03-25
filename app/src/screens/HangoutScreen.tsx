import { Ionicons } from '@expo/vector-icons';
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AvatarButton } from '../components/sentri-ui';
import { theme } from '../design/tokens';
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
};

type Friend = {
  name: string;
  status: 'online' | 'offline';
  note: string;
};

const friends: Friend[] = [
  { name: 'Ananya', status: 'online', note: 'Free now' },
  { name: 'Isha', status: 'online', note: 'Can join a room' },
  { name: 'Mehul', status: 'online', note: 'Study room ready' },
  { name: 'Rohan', status: 'offline', note: 'Back at 7 PM' },
  { name: 'Pranav', status: 'offline', note: 'In class' },
];

export default function HangoutScreen({
  onOpenDrawer,
  avatarLabel,
  sessionToken,
  userName,
  incomingRoomCode,
  onConsumeIncomingRoomCode,
}: HangoutScreenProps) {
  const [rooms, setRooms] = useState<HangoutRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<HangoutRoom | null>(null);
  const [roomName, setRoomName] = useState('DBMS Revision Room');
  const [roomType, setRoomType] = useState('Study');
  const [joinInput, setJoinInput] = useState('');
  const [statusMessage, setStatusMessage] = useState('Create a room or paste a link to join one.');
  const [loading, setLoading] = useState(false);

  const shareText = useMemo(() => {
    if (!activeRoom) {
      return '';
    }
    return [
      `Join my Sentri room: ${activeRoom.roomName}`,
      `Code: ${activeRoom.roomCode}`,
      `Link: ${activeRoom.joinLink}`,
    ].join('\n');
  }, [activeRoom]);

  useEffect(() => {
    void refreshRooms();
  }, []);

  useEffect(() => {
    if (!incomingRoomCode) {
      return;
    }

    void handleJoinByCode(incomingRoomCode, true);
  }, [incomingRoomCode]);

  const refreshRooms = async () => {
    const result = await listRooms();
    if (result.ok) {
      setRooms(result.rooms);
    } else {
      setStatusMessage(result.message);
    }
  };

  const handleCreateRoom = async () => {
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
    setStatusMessage(`Room ${result.room.roomCode} is live and ready to share.`);
    await refreshRooms();
  };

  const handleJoinByCode = async (rawValue?: string, fromIncomingLink = false) => {
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
    setStatusMessage(`Joined ${result.room.roomName}.`);
    await refreshRooms();
    if (fromIncomingLink) {
      onConsumeIncomingRoomCode();
    }
  };

  const handleOpenRoom = async (roomCode: string) => {
    setLoading(true);
    const result = await getRoom(roomCode);
    setLoading(false);

    if (!result.ok) {
      setStatusMessage(result.message);
      return;
    }

    setActiveRoom(result.room);
    setJoinInput(result.room.roomCode);
    setStatusMessage(`${result.room.roomName} is ready.`);
  };

  const handleShareRoom = async (friendName?: string) => {
    if (!activeRoom) {
      setStatusMessage('Create or join a room before sharing it.');
      return;
    }

    const message = friendName
      ? `${shareText}\nInviting ${friendName} from Sentri.`
      : shareText;

    await Share.share({
      title: activeRoom.roomName,
      message,
    });
    setStatusMessage(friendName ? `Share sheet opened for ${friendName}.` : 'Share sheet opened.');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <AvatarButton onPress={onOpenDrawer} label={avatarLabel} />
        <View style={styles.topCopy}>
          <Text style={styles.kicker}>Hangout</Text>
          <Text style={styles.title}>Create, share, and join real Sentri rooms.</Text>
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
              <Text style={styles.linkLabel}>Active room</Text>
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
          <View style={styles.linkActions}>
            <InlineButton
              label="Share link"
              icon="share-social"
              onPress={() => void handleShareRoom()}
            />
            <InlineButton
              label="Refresh room"
              icon="refresh"
              onPress={() => void handleOpenRoom(activeRoom.roomCode)}
            />
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

function InlineButton({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.inlineButton} onPress={onPress}>
      <Ionicons name={icon} size={16} color={theme.colors.text} />
      <Text style={styles.inlineButtonText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
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
    marginTop: 14,
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
  linkActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inlineButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    marginTop: 22,
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
});
