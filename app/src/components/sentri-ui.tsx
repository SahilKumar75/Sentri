import { Ionicons } from '@expo/vector-icons';
import { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  View,
  ViewStyle,
} from 'react-native';
import { theme, TabKey } from '../design/tokens';

type PillTone = 'neutral' | 'accent' | 'blue' | 'green' | 'soft' | 'strong';

type CapsuleTabBarProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onSentriPress: () => void;
};

export function Surface({
  children,
  style,
  tone = 'default',
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'default' | 'strong' | 'alt';
}) {
  const backgroundColor =
    tone === 'strong'
      ? theme.colors.surfaceStrong
      : tone === 'alt'
        ? theme.colors.surfaceAlt
        : theme.colors.surface;

  return <View style={[styles.surface, { backgroundColor }, style]}>{children}</View>;
}

export function SectionHeader({
  title,
  actionLabel,
  onActionPress,
}: {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      {actionLabel ? (
        <Pressable onPress={onActionPress} hitSlop={10}>
          <Text style={styles.sectionHeaderAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export function Pill({
  label,
  tone = 'neutral',
  selected = false,
}: {
  label: string;
  tone?: PillTone;
  selected?: boolean;
}) {
  const toneStyle =
    tone === 'accent'
      ? styles.pillAccent
      : tone === 'blue'
        ? styles.pillBlue
        : tone === 'green'
          ? styles.pillGreen
          : tone === 'soft'
            ? styles.pillSoft
            : tone === 'strong'
              ? styles.pillStrong
              : styles.pillNeutral;

  return (
    <View style={[styles.pill, toneStyle, selected && styles.pillSelected]}>
      <Text style={[styles.pillText, tone === 'strong' && styles.pillTextStrong]}>{label}</Text>
    </View>
  );
}

export function AvatarButton({
  label = 'SK',
  onPress,
}: {
  label?: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.avatarButton}>
      <Text style={styles.avatarText}>{label}</Text>
    </Pressable>
  );
}

export function SearchBar({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  return (
    <View style={styles.searchWrap}>
      <Ionicons name="search" size={18} color={theme.colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={styles.searchInput}
      />
    </View>
  );
}

export function FloatingAddButton({
  onPress,
  label = '+',
}: {
  onPress: () => void;
  label?: string;
}) {
  return (
    <Pressable onPress={onPress} style={styles.fab}>
      <Text style={styles.fabLabel}>{label}</Text>
    </Pressable>
  );
}

export function TimelineRow({
  title,
  subtitle,
  meta,
  rightLabel,
  selected = false,
  onPress,
  onLongPress,
}: {
  title: string;
  subtitle: string;
  meta?: string;
  rightLabel?: string;
  selected?: boolean;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={[styles.timelineRow, selected && styles.timelineRowSelected]}
    >
      <View style={styles.timelineRail}>
        <View style={[styles.timelineDot, selected && styles.timelineDotSelected]} />
        <View style={styles.timelineLine} />
      </View>
      <View style={styles.timelineContent}>
        <Text style={styles.timelineTitle}>{title}</Text>
        <Text style={styles.timelineSubtitle}>{subtitle}</Text>
        {meta ? <Text style={styles.timelineMeta}>{meta}</Text> : null}
      </View>
      {rightLabel ? <Text style={styles.timelineRightLabel}>{rightLabel}</Text> : null}
    </Pressable>
  );
}

export function CalendarDayCell({
  day,
  date,
  items,
  selected = false,
  onPress,
}: {
  day: string;
  date: string;
  items: string[];
  selected?: boolean;
  onPress?: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.calendarCell, selected && styles.calendarCellSelected]}>
      <Text style={styles.calendarDay}>{day}</Text>
      <Text style={styles.calendarDate}>{date}</Text>
      <View style={styles.calendarItems}>
        {items.slice(0, 2).map((item) => (
          <Text key={item} numberOfLines={1} style={styles.calendarItem}>
            {item}
          </Text>
        ))}
      </View>
    </Pressable>
  );
}

export function DrawerSheet({
  visible,
  onClose,
  userName,
}: {
  visible: boolean;
  onClose: () => void;
  userName: string;
}) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.drawerBackdrop}>
        <Pressable style={styles.drawerScrim} onPress={onClose} />
        <SafeAreaView style={styles.drawerPanel}>
          <View style={styles.drawerProfileRow}>
            <View style={styles.drawerAvatar}>
              <Text style={styles.drawerAvatarText}>{userName.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.drawerProfileMeta}>
              <Text style={styles.drawerName}>{userName}</Text>
              <Text style={styles.drawerEmail}>ait.student@sentri.app</Text>
            </View>
          </View>

          <View style={styles.drawerList}>
            {['Account', 'Settings', 'Notifications', 'Storage & Imports', 'Logout'].map((item) => (
              <Pressable key={item} style={styles.drawerItem}>
                <Text style={styles.drawerItemText}>{item}</Text>
                <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.45)" />
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

export function CapsuleTabBar({
  activeTab,
  onTabChange,
  onSentriPress,
}: CapsuleTabBarProps) {
  return (
    <View style={styles.tabWrap}>
      <View style={styles.tabBar}>
        <TabItem
          label="Home"
          icon="home-outline"
          active={activeTab === 'home'}
          onPress={() => onTabChange('home')}
        />
        <TabItem
          label="Myspace"
          icon="albums-outline"
          active={activeTab === 'myspace'}
          onPress={() => onTabChange('myspace')}
        />
        <Pressable onPress={onSentriPress} style={styles.sentriButton} accessibilityRole="button">
          <View style={styles.sentriInner}>
            <Ionicons name="sparkles" size={22} color={theme.colors.surface} />
          </View>
          <Text style={styles.sentriLabel}>Sentri</Text>
        </Pressable>
        <TabItem
          label="Calorie"
          icon="fitness-outline"
          active={activeTab === 'calorie'}
          onPress={() => onTabChange('calorie')}
        />
        <TabItem
          label="Hangout"
          icon="people-outline"
          active={activeTab === 'hangout'}
          onPress={() => onTabChange('hangout')}
        />
      </View>
    </View>
  );
}

function TabItem({
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
    <Pressable onPress={onPress} style={styles.tabItem}>
      <Ionicons
        name={icon}
        size={20}
        color={active ? theme.colors.accent : theme.colors.textMuted}
      />
      <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>{label}</Text>
    </Pressable>
  );
}

export function DetailCard({
  title,
  body,
  meta,
}: {
  title: string;
  body: string;
  meta?: string;
}) {
  return (
    <Surface tone="alt" style={styles.detailCard}>
      <Text style={styles.detailEyebrow}>Pressed detail</Text>
      <Text style={styles.detailTitle}>{title}</Text>
      <Text style={styles.detailBody}>{body}</Text>
      {meta ? <Text style={styles.detailMeta}>{meta}</Text> : null}
    </Surface>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: theme.spacing.md,
    ...theme.shadow.soft,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  sectionHeaderTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.title,
    fontWeight: '800',
  },
  sectionHeaderAction: {
    color: theme.colors.accentStrong,
    fontSize: theme.typography.body,
    fontWeight: '700',
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  pillText: {
    color: theme.colors.text,
    fontSize: theme.typography.footnote,
    fontWeight: '700',
  },
  pillTextStrong: {
    color: theme.colors.surface,
  },
  pillNeutral: { backgroundColor: theme.colors.surfaceAlt },
  pillAccent: { backgroundColor: theme.colors.accentSoft, borderColor: 'rgba(234,106,58,0.08)' },
  pillBlue: { backgroundColor: theme.colors.blueSoft },
  pillGreen: { backgroundColor: theme.colors.greenSoft },
  pillSoft: { backgroundColor: theme.colors.surface },
  pillStrong: { backgroundColor: theme.colors.surfaceStrong },
  pillSelected: {
    borderColor: theme.colors.accent,
  },
  avatarButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surfaceStrong,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatarText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.pill,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: theme.typography.body,
  },
  fab: {
    width: 58,
    height: 58,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    ...theme.shadow.strong,
  },
  fabLabel: {
    color: theme.colors.surface,
    fontSize: 32,
    fontWeight: '400',
    marginTop: -2,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  timelineRowSelected: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.accentSoft,
  },
  timelineRail: {
    alignItems: 'center',
    width: 18,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.line,
    marginTop: 4,
  },
  timelineDotSelected: {
    backgroundColor: theme.colors.accent,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: theme.colors.line,
    marginTop: 6,
  },
  timelineContent: {
    flex: 1,
    gap: 2,
  },
  timelineTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.headline,
    fontWeight: '800',
  },
  timelineSubtitle: {
    color: theme.colors.textSoft,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  timelineMeta: {
    color: theme.colors.textMuted,
    fontSize: theme.typography.footnote,
  },
  timelineRightLabel: {
    color: theme.colors.accentStrong,
    fontSize: theme.typography.footnote,
    fontWeight: '800',
  },
  calendarCell: {
    flex: 1,
    minHeight: 80,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 8,
    backgroundColor: theme.colors.surface,
    gap: 4,
  },
  calendarCellSelected: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  calendarDay: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
  },
  calendarDate: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  calendarItems: {
    gap: 2,
  },
  calendarItem: {
    color: theme.colors.textSoft,
    fontSize: 10,
    fontWeight: '600',
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20,14,10,0.24)',
    flexDirection: 'row',
  },
  drawerScrim: {
    flex: 1,
  },
  drawerPanel: {
    width: 292,
    backgroundColor: theme.colors.drawer,
    padding: theme.spacing.lg,
    borderTopRightRadius: 30,
    borderBottomRightRadius: 30,
  },
  drawerProfileRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.drawerLine,
  },
  drawerAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarText: {
    color: theme.colors.surface,
    fontSize: 18,
    fontWeight: '800',
  },
  drawerProfileMeta: {
    gap: 3,
  },
  drawerName: {
    color: theme.colors.surface,
    fontSize: 20,
    fontWeight: '800',
  },
  drawerEmail: {
    color: 'rgba(255,255,255,0.55)',
    fontSize: 13,
  },
  drawerList: {
    marginTop: theme.spacing.lg,
    gap: 10,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: theme.radius.md,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: theme.colors.drawerLine,
  },
  drawerItemText: {
    color: theme.colors.surface,
    fontSize: 15,
    fontWeight: '700',
  },
  tabWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: 14,
    alignItems: 'center',
  },
  tabBar: {
    width: '100%',
    minHeight: 76,
    borderRadius: 28,
    backgroundColor: 'rgba(255,252,248,0.92)',
    borderWidth: 1,
    borderColor: theme.colors.line,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
    ...theme.shadow.strong,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
  },
  tabLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  tabLabelActive: {
    color: theme.colors.text,
  },
  sentriButton: {
    width: 68,
    alignItems: 'center',
    gap: 3,
    transform: [{ translateY: -18 }],
  },
  sentriInner: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.accent,
    ...theme.shadow.strong,
  },
  sentriLabel: {
    fontSize: 11,
    color: theme.colors.textMuted,
    fontWeight: '700',
  },
  detailCard: {
    gap: 8,
  },
  detailEyebrow: {
    color: theme.colors.accentStrong,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  detailTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  detailBody: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  detailMeta: {
    color: theme.colors.textMuted,
    fontSize: 12,
  },
});

