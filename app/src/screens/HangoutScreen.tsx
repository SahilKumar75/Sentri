import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native';
import { theme as sharedTheme } from '../design/tokens';

type HangoutScreenState = 'ready' | 'loading' | 'error' | 'empty' | 'success';

type Friend = {
  name: string;
  status: 'online' | 'offline';
  note: string;
};

type RoomPreview = {
  name: string;
  time: string;
  audience: string;
  tone: 'orange' | 'blue' | 'green';
};

const theme = {
  background: sharedTheme.colors.background,
  surface: sharedTheme.colors.surface,
  surfaceMuted: sharedTheme.colors.surfaceAlt,
  foreground: sharedTheme.colors.text,
  secondary: sharedTheme.colors.textSoft,
  accent: sharedTheme.colors.accent,
  accentDeep: sharedTheme.colors.accentStrong,
  line: sharedTheme.colors.line,
  green: sharedTheme.colors.green,
  greenSoft: sharedTheme.colors.greenSoft,
  blue: sharedTheme.colors.blue,
  blueSoft: sharedTheme.colors.blueSoft,
  shadow: 'rgba(34, 18, 9, 0.08)',
};

const friends: Friend[] = [
  { name: 'Ananya', status: 'online', note: 'Available now' },
  { name: 'Rohan', status: 'offline', note: 'Back at 7 PM' },
  { name: 'Isha', status: 'online', note: 'Can join a room' },
  { name: 'Pranav', status: 'offline', note: 'In class' },
  { name: 'Mehul', status: 'online', note: 'Study room ready' },
];

const rooms: RoomPreview[] = [
  { name: 'DBMS Revision Room', time: 'Today, 8:30 PM', audience: '5 invited', tone: 'orange' },
  { name: 'Friday Movie Room', time: 'Friday, 9:00 PM', audience: '12 invited', tone: 'blue' },
  { name: 'Gym Accountability', time: 'Daily check-in', audience: '3 invited', tone: 'green' },
];

export default function HangoutScreen() {
  const screenState: HangoutScreenState = 'ready';

  if (screenState !== 'ready') {
    return <HangoutStatePanel state={screenState} />;
  }

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Hangout</Text>
          <Text style={styles.title}>Meet up, share a link, and bring friends in fast.</Text>
          <Text style={styles.subtitle}>
            Room-first coordination for students. Start a room, invite friends, and keep the link easy to share.
          </Text>
        </View>

        <View style={styles.actionRow}>
          <ActionButton label="Join room" tone="ghost" />
          <ActionButton label="Create room" tone="filled" />
        </View>

        <Card style={styles.linkCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardKicker}>Generated link</Text>
            <Text style={styles.statusPill}>Ready to share</Text>
          </View>
          <Text style={styles.linkTitle}>sentri.meet/DBMS-REV-84K</Text>
          <Text style={styles.linkBody}>
            Copy or share this room link with your friends. It is built for quick join flows, not long setup.
          </Text>
          <View style={styles.linkActions}>
            <InlineAction label="Copy link" />
            <InlineAction label="Share" />
          </View>
        </Card>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rooms</Text>
          <Text style={styles.sectionMeta}>Room-first layout</Text>
        </View>
        <View style={styles.roomList}>
          {rooms.map((room) => (
            <RoomCard key={room.name} room={room} />
          ))}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Friends</Text>
          <Text style={styles.sectionMeta}>Invite and check availability</Text>
        </View>
        <View style={styles.friendList}>
          {friends.map((friend) => (
            <FriendRow key={friend.name} friend={friend} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function ActionButton({ label, tone }: { label: string; tone: 'filled' | 'ghost' }) {
  return (
    <Pressable
      style={[
        styles.actionButton,
        tone === 'filled' ? styles.actionButtonFilled : styles.actionButtonGhost,
      ]}
    >
      <Text style={[styles.actionButtonText, tone === 'filled' && styles.actionButtonTextFilled]}>
        {label}
      </Text>
    </Pressable>
  );
}

function InlineAction({ label }: { label: string }) {
  return (
    <Pressable style={styles.inlineAction}>
      <Text style={styles.inlineActionText}>{label}</Text>
    </Pressable>
  );
}

function RoomCard({ room }: { room: RoomPreview }) {
  const tint = roomToneMap[room.tone];

  return (
    <Card style={styles.roomCard}>
      <View style={styles.roomTopRow}>
        <View style={[styles.roomBadge, { backgroundColor: tint.badge }]}>
          <Text style={[styles.roomBadgeText, { color: tint.text }]}>S</Text>
        </View>
        <View style={styles.roomCopy}>
          <Text style={styles.roomName}>{room.name}</Text>
          <Text style={styles.roomTime}>{room.time}</Text>
        </View>
        <Text style={styles.roomAudience}>{room.audience}</Text>
      </View>
      <View style={styles.roomFooter}>
        <Text style={styles.roomFooterText}>Share link ready</Text>
        <Text style={[styles.roomFooterDot, { color: tint.text }]}>•</Text>
        <Text style={styles.roomFooterText}>Invite friends</Text>
      </View>
    </Card>
  );
}

function FriendRow({ friend }: { friend: Friend }) {
  return (
    <Card style={styles.friendCard}>
      <View style={styles.friendRow}>
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
        <Pressable style={styles.inviteButton}>
          <Text style={styles.inviteButtonText}>Invite</Text>
        </Pressable>
      </View>
    </Card>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: ViewStyle }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function HangoutStatePanel({ state }: { state: Exclude<HangoutScreenState, 'ready'> }) {
  const copy = {
    loading: {
      title: 'Preparing your rooms',
      body: 'Sentri is checking your latest links, invites, and friend availability.',
    },
    error: {
      title: 'Could not load Hangout',
      body: 'Try again after reconnecting before creating or joining a room.',
    },
    empty: {
      title: 'No rooms yet',
      body: 'Create a room or paste a link to start inviting your friends.',
    },
    success: {
      title: 'Room created',
      body: 'Your room link is ready to share and your friends can be invited now.',
    },
  } as const;

  const content = copy[state];

  return (
    <View style={styles.statePanel}>
      <Text style={styles.eyebrow}>Hangout</Text>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.body}</Text>
    </View>
  );
}

const roomToneMap = {
  orange: {
    badge: theme.surfaceMuted,
    text: theme.accentDeep,
  },
  blue: {
    badge: theme.blueSoft,
    text: theme.blue,
  },
  green: {
    badge: theme.greenSoft,
    text: theme.green,
  },
} as const;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
  },
  statePanel: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 8,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 32,
    gap: 16,
  },
  header: {
    gap: 8,
  },
  eyebrow: {
    color: theme.accentDeep,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.foreground,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  subtitle: {
    color: theme.secondary,
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 320,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    borderRadius: 22,
    minHeight: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionButtonFilled: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 6,
  },
  actionButtonGhost: {
    backgroundColor: theme.surface,
    borderColor: theme.line,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.foreground,
  },
  actionButtonTextFilled: {
    color: '#FFF8F3',
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 18,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 24,
    elevation: 7,
  },
  linkCard: {
    gap: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  cardKicker: {
    color: theme.secondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  statusPill: {
    backgroundColor: theme.greenSoft,
    color: theme.green,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
  },
  linkTitle: {
    color: theme.foreground,
    fontSize: 22,
    fontWeight: '800',
  },
  linkBody: {
    color: theme.secondary,
    fontSize: 14,
    lineHeight: 21,
  },
  linkActions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  inlineAction: {
    backgroundColor: theme.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inlineActionText: {
    color: theme.foreground,
    fontSize: 13,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  sectionTitle: {
    color: theme.foreground,
    fontSize: 19,
    fontWeight: '800',
  },
  sectionMeta: {
    color: theme.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  roomList: {
    gap: 12,
  },
  roomCard: {
    gap: 12,
  },
  roomTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roomBadge: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomBadgeText: {
    fontSize: 18,
    fontWeight: '900',
  },
  roomCopy: {
    flex: 1,
    gap: 4,
  },
  roomName: {
    color: theme.foreground,
    fontSize: 17,
    fontWeight: '800',
  },
  roomTime: {
    color: theme.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  roomAudience: {
    color: theme.accentDeep,
    fontSize: 13,
    fontWeight: '800',
  },
  roomFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  roomFooterText: {
    color: theme.secondary,
    fontSize: 13,
    fontWeight: '600',
  },
  roomFooterDot: {
    fontSize: 14,
    fontWeight: '900',
  },
  friendList: {
    gap: 10,
  },
  friendCard: {
    paddingVertical: 16,
  },
  friendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  friendLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusDot: {
    width: 11,
    height: 11,
    borderRadius: 999,
  },
  statusDotOnline: {
    backgroundColor: theme.green,
  },
  statusDotOffline: {
    backgroundColor: '#C7B8A7',
  },
  friendName: {
    color: theme.foreground,
    fontSize: 16,
    fontWeight: '800',
  },
  friendNote: {
    color: theme.secondary,
    fontSize: 13,
    marginTop: 3,
  },
  inviteButton: {
    backgroundColor: theme.accent,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  inviteButtonText: {
    color: '#FFF8F3',
    fontSize: 13,
    fontWeight: '800',
  },
});
