import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../design/tokens';
export function AvatarButton({ label = 'SK', onPress, tone = 'light', }) {
    return (<Pressable onPress={onPress} style={[styles.avatarButton, tone === 'dark' ? styles.avatarButtonDark : styles.avatarButtonLight]} accessibilityRole="button" accessibilityLabel="Open profile and settings">
      <Text style={[styles.avatarText, tone === 'dark' && styles.avatarTextDark]}>{label}</Text>
    </Pressable>);
}
export function DrawerSheet({ visible, onClose, userName, userSubtitle, onSelectItem, }) {
    const menuItems = [
        { key: 'account', label: 'Account', icon: 'person-outline' },
        { key: 'settings', label: 'Settings', icon: 'settings-outline' },
        { key: 'logout', label: 'Logout', icon: 'log-out-outline' },
    ];
    return (<Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.drawerBackdrop}>
        <Pressable style={styles.drawerScrim} onPress={onClose}/>
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

          <View style={styles.drawerSummary}>
            <View style={styles.drawerStat}>
              <Text style={styles.drawerStatValue}>4</Text>
              <Text style={styles.drawerStatLabel}>Core pages</Text>
            </View>
            <View style={styles.drawerStat}>
              <Text style={styles.drawerStatValue}>1</Text>
              <Text style={styles.drawerStatLabel}>Student app</Text>
            </View>
          </View>

          <View style={styles.drawerSection}>
            {menuItems.map((item) => (<Pressable key={item.label} style={styles.drawerItem} onPress={() => {
                onClose();
                onSelectItem(item.key);
            }}>
                <View style={styles.drawerItemLeft}>
                  <Ionicons name={item.icon} size={18} color={theme.colors.textSoft}/>
                  <Text style={styles.drawerItemText}>{item.label}</Text>
                </View>
                <Ionicons name="chevron-forward" size={16} color={theme.colors.textMuted}/>
              </Pressable>))}
          </View>
        </SafeAreaView>
      </View>
    </Modal>);
}
export function CapsuleTabBar({ activeTab, onTabChange, onSentriPress, tone = 'light', }) {
    const dark = tone === 'dark';
    return (<View style={styles.tabWrap} pointerEvents="box-none">
      <View style={styles.tabBarContainer} pointerEvents="box-none">
        <BlurView
          intensity={80}
          tint={dark ? 'dark' : 'light'}
          experimentalBlurMethod="dimezisBlurView"
          style={[StyleSheet.absoluteFill, styles.tabBarBg, dark ? styles.tabBarBgDark : styles.tabBarBgLight]}
        />
        <View style={styles.tabBarContent} pointerEvents="box-none">
          <TabItem label="Home" icon="home" active={activeTab === 'home'} dark={dark} onPress={() => onTabChange('home')}/>
          <TabItem label="Myspace" icon="grid" active={activeTab === 'myspace'} dark={dark} onPress={() => onTabChange('myspace')}/>
          <Pressable onPress={onSentriPress} style={styles.sentriButton} accessibilityRole="button" accessibilityLabel="Open Sentri assistant">
            <View style={styles.sentriInner}>
              <Ionicons name="sparkles" size={18} color="#FFF9F5"/>
            </View>
            <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[styles.sentriLabel, dark && styles.sentriLabelDark]}>
              Sentri
            </Text>
          </Pressable>
          <TabItem label="Calorie" icon="barbell" active={activeTab === 'calorie'} dark={dark} onPress={() => onTabChange('calorie')}/>
          <TabItem label="Hangout" icon="people" active={activeTab === 'hangout'} dark={dark} onPress={() => onTabChange('hangout')}/>
        </View>
      </View>
    </View>);
}
export function SurfaceCard({ children, tone = 'default', radius = 'lg', padded = true }) {
    return (<View style={[
            styles.surfaceCard,
            radius === 'md' ? styles.surfaceCardMd : styles.surfaceCardLg,
            padded && styles.surfaceCardPadded,
            tone === 'alt' && styles.surfaceCardAlt,
            tone === 'accent' && styles.surfaceCardAccent,
            tone === 'dark' && styles.surfaceCardDark,
        ]}>
      {children}
    </View>);
}
export function SectionHeader({ title, meta, right }) {
    return (<View style={styles.sharedSectionHeader}>
      <View style={styles.sharedSectionHeaderCopy}>
        <Text style={styles.sharedSectionTitle}>{title}</Text>
        {meta ? <Text style={styles.sharedSectionMeta}>{meta}</Text> : null}
      </View>
      {right}
    </View>);
}
export function SheetHeader({ eyebrow, title, actionLabel = 'Done', onActionPress }) {
    return (<View style={styles.sheetHeader}>
      <View>
        <Text style={styles.sheetHeaderEyebrow}>{eyebrow}</Text>
        <Text style={styles.sheetHeaderTitle}>{title}</Text>
      </View>
      <Pressable onPress={onActionPress} style={styles.sheetHeaderButton}>
        <Text style={styles.sheetHeaderButtonText}>{actionLabel}</Text>
      </Pressable>
    </View>);
}
function TabItem({ label, icon, active, dark, onPress, }) {
    const idleColor = dark ? theme.colors.darkTextSoft : theme.colors.textMuted;
    const activeColor = active ? theme.colors.accent : idleColor;
    const iconName = resolveTabIcon(icon, active);
    return (<Pressable onPress={onPress} style={styles.tabItem} accessibilityRole="button" accessibilityLabel={label}>
      <View style={[styles.tabIconShell, active && styles.tabIconShellActive]}>
        <Ionicons name={iconName} size={26} color={activeColor}/>
      </View>
      <Text numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75} style={[styles.tabLabel, { color: active ? (dark ? '#FFFFFF' : theme.colors.text) : idleColor }]}>
        {label}
      </Text>
    </Pressable>);
}
function resolveTabIcon(icon, active) {
    if (active) {
        if (icon === 'home') {
            return 'home';
        }
        if (icon === 'grid') {
            return 'grid';
        }
        if (icon === 'barbell') {
            return 'barbell';
        }
        if (icon === 'people') {
            return 'people';
        }
    }
    if (icon === 'home') {
        return 'home-outline';
    }
    if (icon === 'grid') {
        return 'grid-outline';
    }
    if (icon === 'barbell') {
        return 'barbell-outline';
    }
    if (icon === 'people') {
        return 'people-outline';
    }
    return icon;
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
    drawerSummary: {
        marginTop: theme.spacing.md,
        flexDirection: 'row',
        gap: 10,
    },
    drawerStat: {
        flex: 1,
        borderRadius: 18,
        backgroundColor: theme.colors.surfaceAlt,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    drawerStatValue: {
        color: theme.colors.accentStrong,
        fontSize: 20,
        fontWeight: '800',
    },
    drawerStatLabel: {
        marginTop: 4,
        color: theme.colors.textSoft,
        fontSize: 12,
        fontWeight: '700',
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
    surfaceCard: {
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.line,
        ...theme.shadow.soft,
    },
    surfaceCardMd: {
        borderRadius: theme.radius.md,
    },
    surfaceCardLg: {
        borderRadius: theme.radius.lg,
    },
    surfaceCardPadded: {
        padding: 18,
    },
    surfaceCardAlt: {
        backgroundColor: theme.colors.surfaceAlt,
    },
    surfaceCardAccent: {
        backgroundColor: theme.colors.accentSoft,
        borderColor: theme.colors.accentSoft,
    },
    surfaceCardDark: {
        backgroundColor: theme.colors.darkSurface,
        borderColor: theme.colors.darkLine,
    },
    sharedSectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: theme.spacing.md,
    },
    sharedSectionHeaderCopy: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: theme.spacing.xs,
        flexWrap: 'wrap',
        flex: 1,
    },
    sharedSectionTitle: {
        color: theme.colors.text,
        fontSize: 19,
        fontWeight: '800',
    },
    sharedSectionMeta: {
        color: theme.colors.textSoft,
        fontSize: 13,
        fontWeight: '700',
    },
    sheetHeader: {
        paddingHorizontal: theme.chrome.horizontalPadding,
        paddingTop: 12,
        paddingBottom: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sheetHeaderEyebrow: {
        color: theme.colors.accentStrong,
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    sheetHeaderTitle: {
        marginTop: 6,
        color: theme.colors.text,
        fontSize: 28,
        fontWeight: '800',
    },
    sheetHeaderButton: {
        borderRadius: 16,
        backgroundColor: theme.colors.surfaceAlt,
        paddingHorizontal: 14,
        paddingVertical: 10,
        minHeight: 44,
        minWidth: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheetHeaderButtonText: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '700',
    },
    tabWrap: {
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: theme.chrome.floatingBarOffset,
    },
    tabBarContainer: {
        height: 82,
        borderRadius: 999,
        ...theme.shadow.strong,
    },
    tabBarBg: {
        borderRadius: 999,
        overflow: 'hidden',
        borderWidth: 1,
    },
    tabBarBgLight: {
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    tabBarBgDark: {
        backgroundColor: 'rgba(28, 28, 30, 0.45)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    tabBarContent: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingVertical: 8,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        paddingVertical: 3,
    },
    tabIconShell: {
        width: 42,
        height: 42,
        borderRadius: 21,
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
        width: 72,
        alignItems: 'center',
        gap: 4,
        transform: [{ translateY: -14 }],
    },
    sentriInner: {
        width: 58,
        height: 58,
        borderRadius: 22,
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
