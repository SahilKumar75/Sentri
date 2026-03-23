import { Ionicons } from '@expo/vector-icons';
import { Modal, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { theme, type TabKey } from '../design/tokens';

type CapsuleTabBarProps = {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  onSentriPress: () => void;
  tone?: 'light' | 'dark';
};

export function AvatarButton({
  label = 'SK',
  onPress,
  tone = 'light',
}: {
  label?: string;
  onPress: () => void;
  tone?: 'light' | 'dark';
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.avatarButton, tone === 'dark' ? styles.avatarButtonDark : styles.avatarButtonLight]}
      accessibilityRole="button"
      accessibilityLabel="Open profile and settings"
    >
      <Text style={[styles.avatarText, tone === 'dark' && styles.avatarTextDark]}>{label}</Text>
    </Pressable>
  );
}

export function DrawerSheet({
  visible,
  onClose,
  userName,
  userSubtitle,
  onSelectItem,
}: {
  visible: boolean;
  onClose: () => void;
  userName: string;
  userSubtitle: string;
  onSelectItem: (item: 'account' | 'settings' | 'logout') => void;
}) {
  const menuItems = [
    { key: 'account' as const, label: 'Account', icon: 'person-outline' as const },
    { key: 'settings' as const, label: 'Settings', icon: 'settings-outline' as const },
    { key: 'logout' as const, label: 'Logout', icon: 'log-out-outline' as const },
  ];

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.drawerBackdrop}>
        <Pressable style={styles.drawerScrim} onPress={onClose} />
        <SafeAreaView style={styles.drawerPanel}>
          <View style={styles.drawerHeader}>
            <View style={styles.drawerAvatar}>
              <Text style={styles.drawerAvatarText}>{userName.slice(0, 2).toUpperCase()}</Text>
            </View>
            <View style={styles.drawerMeta}>
              <Text style={styles.drawerName}>{userName}</Text>
              <Text style={styles.drawerEmail}>{userSubtitle}</Text>
            </View>
          </View>

          <View style={styles.drawerSection}>
            {menuItems.map((item) => (
              <Pressable
                key={item.label}
                style={styles.drawerItem}
                onPress={() => {
                  onClose();
                  onSelectItem(item.key);
                }}
              >
                <View style={styles.drawerItemLeft}>
                  <Ionicons name={item.icon} size={18} color={theme.colors.textSoft} />
                  <Text style={styles.drawerItemText}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted} />
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
  tone = 'light',
}: CapsuleTabBarProps) {
  const dark = tone === 'dark';

  return (
    <View style={styles.tabWrap} pointerEvents="box-none">
      <View style={[styles.tabBar, dark ? styles.tabBarDark : styles.tabBarLight]}>
        <TabItem
          label="Home"
          icon="home"
          active={activeTab === 'home'}
          dark={dark}
          onPress={() => onTabChange('home')}
        />
        <TabItem
          label="Myspace"
          icon="grid"
          active={activeTab === 'myspace'}
          dark={dark}
          onPress={() => onTabChange('myspace')}
        />
        <Pressable
          onPress={onSentriPress}
          style={styles.sentriButton}
          accessibilityRole="button"
          accessibilityLabel="Open Sentri assistant"
        >
          <View style={styles.sentriInner}>
            <Ionicons name="sparkles" size={18} color="#FFF9F5" />
          </View>
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
            style={[styles.sentriLabel, dark && styles.sentriLabelDark]}
          >
            Sentri
          </Text>
        </Pressable>
        <TabItem
          label="Calorie"
          icon="barbell"
          active={activeTab === 'calorie'}
          dark={dark}
          onPress={() => onTabChange('calorie')}
        />
        <TabItem
          label="Hangout"
          icon="people"
          active={activeTab === 'hangout'}
          dark={dark}
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
  dark,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  dark: boolean;
  onPress: () => void;
}) {
  const idleColor = dark ? theme.colors.darkTextSoft : theme.colors.textMuted;
  const activeColor = active ? theme.colors.accent : idleColor;

  return (
    <Pressable onPress={onPress} style={styles.tabItem} accessibilityRole="button" accessibilityLabel={label}>
      <View style={[styles.tabIconShell, active && styles.tabIconShellActive]}>
        <Ionicons name={icon} size={26} color={activeColor} />
      </View>
      <Text
        numberOfLines={1}
        adjustsFontSizeToFit
        minimumFontScale={0.75}
        style={[styles.tabLabel, { color: active ? (dark ? '#FFFFFF' : theme.colors.text) : idleColor }]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  avatarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  avatarButtonLight: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  avatarButtonDark: {
    backgroundColor: theme.colors.darkSurfaceAlt,
    borderColor: theme.colors.darkLine,
  },
  avatarText: {
    color: theme.colors.surface,
    fontSize: 14,
    fontWeight: '800',
  },
  avatarTextDark: {
    color: theme.colors.darkText,
  },
  drawerBackdrop: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'rgba(17, 13, 10, 0.18)',
  },
  drawerScrim: {
    flex: 1,
  },
  drawerPanel: {
    width: 306,
    backgroundColor: theme.colors.drawer,
    borderTopRightRadius: 28,
    borderBottomRightRadius: 28,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xl,
    borderRightWidth: 1,
    borderColor: theme.colors.drawerLine,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.drawerLine,
  },
  drawerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawerAvatarText: {
    color: theme.colors.accentStrong,
    fontSize: 18,
    fontWeight: '800',
  },
  drawerMeta: {
    gap: 3,
  },
  drawerName: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  drawerEmail: {
    color: theme.colors.textSoft,
    fontSize: 13,
  },
  drawerSection: {
    marginTop: theme.spacing.lg,
    gap: 6,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 18,
  },
  drawerItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  drawerItemText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '600',
  },
  tabWrap: {
    position: 'absolute',
    left: 14,
    right: 14,
    bottom: theme.chrome.floatingBarOffset,
  },
  tabBar: {
    height: 78,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  tabBarLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    borderColor: theme.colors.line,
    ...theme.shadow.strong,
  },
  tabBarDark: {
    backgroundColor: 'rgba(28, 28, 30, 0.94)',
    borderColor: theme.colors.darkLine,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  tabIconShell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabIconShellActive: {
    backgroundColor: theme.colors.accentSoft,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  sentriButton: {
    width: 68,
    alignItems: 'center',
    gap: 4,
    transform: [{ translateY: -14 }],
  },
  sentriInner: {
    width: 56,
    height: 56,
    borderRadius: 20,
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
  sentriLabelDark: {
    color: theme.colors.darkTextSoft,
  },
});
