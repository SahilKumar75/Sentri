import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, View } from 'react-native';

import { CapsuleTabBar, DrawerSheet } from './src/components/sentri-ui';
import { theme, type TabKey } from './src/design/tokens';
import { clearStoredSessionToken, getStoredSessionToken, storeSessionToken } from './src/lib/auth-storage';
import * as authApi from './src/lib/api';
import AccountSheet from './src/screens/AccountSheet';
import AuthScreen from './src/screens/AuthScreen';
import CalorieScreen from './src/screens/CalorieScreen';
import HangoutScreen from './src/screens/HangoutScreen';
import HomeScreen from './src/screens/HomeScreen';
import MyspaceScreen from './src/screens/MyspaceScreen';
import type { ContactMethod, PendingSignup, UserProfile } from './src/types/auth';

type ScreenProps = {
  onOpenDrawer: () => void;
  avatarLabel: string;
};

type AuthMode = 'signup' | 'login' | 'otp';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(null);
  const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(null);
  const [accountView, setAccountView] = useState<'account' | 'settings'>('account');
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [authInitializing, setAuthInitializing] = useState(true);

  const userName = authenticatedUser
    ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}`.trim()
    : 'Guest';
  const userSubtitle = authenticatedUser?.phone || authenticatedUser?.email || 'Not signed in';
  const avatarLabel = authenticatedUser
    ? `${authenticatedUser.firstName.charAt(0)}${authenticatedUser.lastName.charAt(0)}`.toUpperCase()
    : 'SK';

  const screenProps = useMemo<ScreenProps>(
    () => ({ onOpenDrawer: () => setDrawerOpen(true), avatarLabel }),
    [avatarLabel]
  );

  useEffect(() => {
    void restoreSavedSession();
  }, []);

  const restoreSavedSession = async () => {
    const storedToken = await getStoredSessionToken();
    if (!storedToken) {
      setAuthInitializing(false);
      return;
    }

    const result = await authApi.restoreSession(storedToken);
    if (result.ok && result.user) {
      setSessionToken(storedToken);
      setAuthenticatedUser(result.user);
      setAuthStatusMessage(result.message);
    } else {
      await clearStoredSessionToken();
      setSessionToken(null);
      setAuthMode('login');
      setAuthStatusMessage(result.message);
    }

    setAuthInitializing(false);
  };

  const handleSignup = async ({
    profile,
    contactMethod,
  }: {
    profile: UserProfile;
    contactMethod: ContactMethod;
  }) => {
    const result = await authApi.signup({ profile, contactMethod });
    setAuthStatusMessage(result.message);

    if (!result.ok) {
      return result;
    }

    if (result.requiresOtp && result.pendingUserId) {
      setPendingSignup({
        pendingUserId: result.pendingUserId,
        contactMethod,
        phone: profile.phone?.trim(),
        otpCode: result.otpCode,
      });
      setAuthMode('otp');
      return result;
    }

    if (result.sessionToken && result.user) {
      await storeSessionToken(result.sessionToken);
      setSessionToken(result.sessionToken);
      setAuthenticatedUser(result.user);
      setPendingSignup(null);
    }

    return result;
  };

  const handleVerifyOtp = async (otp: string) => {
    if (!pendingSignup) {
      return { ok: false, message: 'No phone verification is waiting right now.' };
    }

    const result = await authApi.verifyOtp({
      pendingUserId: pendingSignup.pendingUserId,
      otpCode: otp,
    });
    setAuthStatusMessage(result.message);

    if (result.ok && result.sessionToken && result.user) {
      await storeSessionToken(result.sessionToken);
      setSessionToken(result.sessionToken);
      setAuthenticatedUser(result.user);
      setPendingSignup(null);
      setAuthMode('login');
    }

    return result;
  };

  const handleLogin = async ({ identifier, password }: { identifier: string; password: string }) => {
    const result = await authApi.login({ identifier, password });
    setAuthStatusMessage(result.message);

    if (result.ok && result.sessionToken && result.user) {
      await storeSessionToken(result.sessionToken);
      setSessionToken(result.sessionToken);
      setAuthenticatedUser(result.user);
      setPendingSignup(null);
    }

    return result;
  };

  const handleLogout = async () => {
    if (sessionToken) {
      await authApi.logout(sessionToken);
    }

    await clearStoredSessionToken();
    setSessionToken(null);
    setAuthenticatedUser(null);
    setPendingSignup(null);
    setDrawerOpen(false);
    setAccountOpen(false);
    setActiveTab('home');
    setAuthMode('login');
    setAuthStatusMessage('You are logged out. Login again to continue.');
  };

  const handleDrawerSelection = (item: 'account' | 'settings' | 'logout') => {
    if (item === 'logout') {
      void handleLogout();
      return;
    }

    setAccountView(item);
    setAccountOpen(true);
  };

  if (authInitializing) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <View style={styles.loadingShell}>
          <ActivityIndicator size="large" color={theme.colors.accent} />
        </View>
      </SafeAreaView>
    );
  }

  if (!authenticatedUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <AuthScreen
          mode={authMode}
          pendingSignup={pendingSignup}
          statusMessage={authStatusMessage}
          onModeChange={(mode) => {
            setAuthMode(mode);
            setPendingSignup(null);
          }}
          onSignup={handleSignup}
          onVerifyOtp={handleVerifyOtp}
          onLogin={handleLogin}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />

      <View style={styles.shell}>{renderActiveScreen(activeTab, screenProps)}</View>

      <CapsuleTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSentriPress={() => {
          // Reserved for the future assistant surface.
        }}
        tone="light"
      />

      <DrawerSheet
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        userName={userName}
        userSubtitle={userSubtitle}
        onSelectItem={handleDrawerSelection}
      />

      <AccountSheet
        visible={accountOpen}
        profile={authenticatedUser}
        viewMode={accountView}
        onClose={() => setAccountOpen(false)}
        onLogout={() => {
          void handleLogout();
        }}
      />
    </SafeAreaView>
  );
}

function renderActiveScreen(activeTab: TabKey, props: ScreenProps) {
  switch (activeTab) {
    case 'home':
      return <HomeScreen {...props} />;
    case 'myspace':
      return <MyspaceScreen {...props} />;
    case 'calorie':
      return <CalorieScreen {...props} />;
    case 'hangout':
      return <HangoutScreen {...props} />;
    default:
      return <HomeScreen {...props} />;
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingShell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shell: {
    flex: 1,
  },
});
