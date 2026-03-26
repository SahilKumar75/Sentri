import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { theme } from '../design/tokens';
import type { UserProfile } from '../types/auth';

type AccountSheetProps = {
  visible: boolean;
  profile: UserProfile | null;
  viewMode: 'account' | 'settings';
  onClose: () => void;
  onLogout: () => void;
};

export default function AccountSheet({
  visible,
  profile,
  viewMode,
  onClose,
  onLogout,
}: AccountSheetProps) {
  if (!profile) {
    return null;
  }

  const displayName = `${profile.firstName} ${profile.lastName}`.trim();
  const primaryContact = profile.phone || profile.email || 'Not set';

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Account</Text>
              <Text style={styles.title}>{viewMode === 'settings' ? 'Settings' : displayName}</Text>
            </View>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>Done</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>Primary contact</Text>
              <Text style={styles.heroValue}>{primaryContact}</Text>
              <Text style={styles.heroBody}>
                {profile.phone
                  ? profile.verifiedPhone
                    ? 'Phone number verified with OTP.'
                    : 'Phone number still needs verification.'
                  : 'Email-based account active.'}
              </Text>
              <View style={styles.heroTags}>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagText}>{profile.verifiedPhone ? 'Verified' : 'Needs review'}</Text>
                </View>
                <View style={styles.heroTag}>
                  <Text style={styles.heroTagText}>{profile.phone ? 'Phone login' : 'Email login'}</Text>
                </View>
              </View>
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Profile details</Text>
              <DetailRow label="First name" value={profile.firstName} />
              <DetailRow label="Last name" value={profile.lastName} />
              <DetailRow label="Date of birth" value={profile.dob} />
              <DetailRow label="Phone" value={profile.phone || 'Not added'} />
              <DetailRow label="Email" value={profile.email || 'Not added'} />
            </View>

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Access</Text>
              <DetailRow label="Login method" value={profile.phone ? 'Phone or email + password' : 'Email + password'} />
              <DetailRow label="Password" value={profile.password ? maskPassword(profile.password) : 'Stored securely on backend'} />
              <DetailRow
                label="Phone verification"
                value={profile.phone ? (profile.verifiedPhone ? 'Verified' : 'Pending') : 'Not added'}
              />
              <DetailRow
                label="Last login"
                value={profile.lastLoginAt ? formatDateTime(profile.lastLoginAt) : 'This device session is current'}
              />
              <DetailRow label="Account created" value={profile.createdAt ? formatDateTime(profile.createdAt) : 'Unknown'} />
            </View>

            {viewMode === 'settings' ? (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Settings</Text>
                <DetailRow label="Notifications" value="Weekly timetable reminder every Saturday" />
                <DetailRow label="Storage" value="Myspace captures linked to this account" />
                <DetailRow label="Privacy" value="Account data visible only to you" />
                <DetailRow label="Login preference" value="Phone or email with password" />
              </View>
            ) : (
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Settings snapshot</Text>
                <DetailRow label="Notifications" value="Weekly timetable reminder on Saturday" />
                <DetailRow label="Storage" value="Myspace captures stay linked to this account" />
                <DetailRow label="Privacy" value="Account data is visible only to you" />
              </View>
            )}

            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>Sentri flow</Text>
              <DetailRow label="Home" value="Timetable, current class, next class, and weekly refresh" />
              <DetailRow label="Myspace" value="Search, save, and resurface screenshots, links, and notes" />
              <DetailRow label="Calorie" value="Body-goal setup, daily target, meals, burns, and cheat days" />
              <DetailRow label="Hangout" value="Create room, share link, join room, and meeting controls" />
            </View>

            <Pressable onPress={onLogout} style={styles.logoutButton}>
              <Text style={styles.logoutButtonText}>Logout</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

function maskPassword(password: string) {
  return password ? '•'.repeat(Math.max(password.length, 8)) : 'Not set';
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.chrome.horizontalPadding,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  closeButton: {
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  closeText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: theme.chrome.horizontalPadding,
    paddingBottom: 28,
    gap: 14,
  },
  heroCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
    ...theme.shadow.soft,
  },
  heroLabel: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroValue: {
    marginTop: 8,
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  heroBody: {
    marginTop: 6,
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  heroTags: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  heroTag: {
    borderRadius: 999,
    backgroundColor: theme.colors.accentSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  heroTagText: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
  },
  sectionCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 18,
    paddingVertical: 14,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 6,
  },
  detailRow: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  },
  detailLabel: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  detailValue: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  logoutButton: {
    marginTop: 6,
    borderRadius: 18,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  logoutButtonText: {
    color: '#FFF9F5',
    fontSize: 15,
    fontWeight: '800',
  },
});
