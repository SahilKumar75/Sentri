import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AvatarButton } from '../components/sentri-ui';
import { theme } from '../design/tokens';

type HangoutScreenProps = {
  onOpenDrawer: () => void;
  avatarLabel: string;
};

type Friend = {
  name: string;
  status: 'online' | 'offline';
  note: string;
};

type Room = {
  name: string;
  time: string;
  invited: string;
};

const rooms: Room[] = [
  { name: 'DBMS Revision Room', time: 'Today • 8:30 PM', invited: '5 invited' },
  { name: 'Friday Movie Room', time: 'Friday • 9:00 PM', invited: '12 invited' },
  { name: 'Gym Accountability', time: 'Daily • 7:00 AM', invited: '3 invited' },
];

const friends: Friend[] = [
  { name: 'Ananya', status: 'online', note: 'Free now' },
  { name: 'Isha', status: 'online', note: 'Can join a room' },
  { name: 'Mehul', status: 'online', note: 'Study room ready' },
  { name: 'Rohan', status: 'offline', note: 'Back at 7 PM' },
  { name: 'Pranav', status: 'offline', note: 'In class' },
];

export default function HangoutScreen({ onOpenDrawer, avatarLabel }: HangoutScreenProps) {
  const [linkValue, setLinkValue] = useState('sentri.meet/DBMS-REV-84K');
  const [statusMessage, setStatusMessage] = useState('Room link ready to share.');

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <AvatarButton onPress={onOpenDrawer} label={avatarLabel} />
        <View style={styles.topCopy}>
          <Text style={styles.kicker}>Hangout</Text>
          <Text style={styles.title}>Rooms for calls, study, and watch parties.</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={[styles.actionButton, styles.actionButtonGhost]}
          onPress={() => setStatusMessage('Join flow staged. Paste the room link next.')}
        >
          <Text style={styles.actionGhostText}>Join room</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.actionButtonFilled]}
          onPress={() => {
            setLinkValue(`sentri.meet/ROOM-${Math.floor(100 + Math.random() * 900)}K`);
            setStatusMessage('New room created. Share the fresh link below.');
          }}
        >
          <Text style={styles.actionFilledText}>Create room</Text>
        </Pressable>
      </View>

      <View style={styles.statusBanner}>
        <Text style={styles.statusBannerText}>{statusMessage}</Text>
      </View>

      <View style={styles.linkCard}>
        <View style={styles.linkHeader}>
          <Text style={styles.linkLabel}>Generated link</Text>
          <View style={styles.linkStatus}>
            <Text style={styles.linkStatusText}>Ready to share</Text>
          </View>
        </View>
        <Text style={styles.linkValue}>{linkValue}</Text>
        <View style={styles.linkActions}>
          <InlineButton
            label="Copy link"
            icon="copy-outline"
            onPress={() => setStatusMessage(`Copied ${linkValue}`)}
          />
          <InlineButton
            label="Share"
            icon="share-social-outline"
            onPress={() => setStatusMessage(`Share sheet prepared for ${linkValue}`)}
          />
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rooms</Text>
          <Text style={styles.sectionMeta}>Quick access</Text>
        </View>
        {rooms.map((room) => (
          <View key={room.name} style={styles.roomCard}>
            <View style={styles.roomBadge}>
              <Text style={styles.roomBadgeText}>S</Text>
            </View>
            <View style={styles.roomCopy}>
              <Text style={styles.roomTitle}>{room.name}</Text>
              <Text style={styles.roomMeta}>{room.time}</Text>
            </View>
            <View style={styles.roomRight}>
              <Text style={styles.roomInvited}>{room.invited}</Text>
              <Text style={styles.roomLinkLabel}>Link ready</Text>
            </View>
          </View>
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
              style={styles.inviteButton}
              onPress={() => setStatusMessage(`Invite queued for ${friend.name}`)}
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
  actionRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
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
  actionButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  actionButtonGhost: {
    backgroundColor: theme.colors.surface,
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
    color: '#FFF9F5',
    fontSize: 15,
    fontWeight: '800',
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
    alignItems: 'center',
  },
  linkLabel: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  linkStatus: {
    borderRadius: 999,
    backgroundColor: theme.colors.greenSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  linkStatusText: {
    color: theme.colors.green,
    fontSize: 12,
    fontWeight: '800',
  },
  linkValue: {
    marginTop: 12,
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
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
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
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
    backgroundColor: theme.colors.green,
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
