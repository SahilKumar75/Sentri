import { StatusBar } from 'expo-status-bar';
import { startTransition, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Linking, SafeAreaView, StyleSheet, View } from 'react-native';

import { CapsuleTabBar, DrawerSheet } from './src/components/sentri-ui';
import { theme } from './src/design/tokens';
import {
  clearStoredSessionToken,
  clearStoredSessionUser,
  getStoredActiveTab,
  getStoredSessionToken,
  getStoredSessionUser,
  storeActiveTab,
  storeSessionToken,
  storeSessionUser,
} from './src/lib/auth-storage';
import * as authApi from './src/lib/api';
import { useMountedTabs } from './src/lib/use-mounted-tabs';
import AccountSheet from './src/screens/AccountSheet';
import AuthScreen from './src/screens/AuthScreen';
import CalorieScreen from './src/screens/CalorieScreen';
import HangoutScreen from './src/screens/HangoutScreen';
import HomeScreen from './src/screens/HomeScreen';
import MyspaceScreen from './src/screens/MyspaceScreen';
import SentriSheet from './src/screens/SentriSheet';

const ALL_TABS = ['home', 'myspace', 'calorie', 'hangout'];

// DEV: Set to true to bypass authentication
const DEV_BYPASS_AUTH = true;

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState(null);
  const [pendingSignup, setPendingSignup] = useState(null);
  const [authMode, setAuthMode] = useState('signup');
  const [authStatusMessage, setAuthStatusMessage] = useState(null);
  const [accountView, setAccountView] = useState('account');
  const [sessionToken, setSessionToken] = useState(null);
  const [authInitializing, setAuthInitializing] = useState(true);
  const [incomingHangoutCode, setIncomingHangoutCode] = useState(null);
  const [hangoutMeetingMode, setHangoutMeetingMode] = useState(false);
  const [sentriSheetOpen, setSentriSheetOpen] = useState(false);
  const mountedTabs = useMountedTabs(activeTab);

  const userName = authenticatedUser
    ? `${authenticatedUser.firstName} ${authenticatedUser.lastName}`.trim()
    : 'Guest';
  const userSubtitle = authenticatedUser?.phone || authenticatedUser?.email || 'Not signed in';
  const avatarLabel = authenticatedUser
    ? `${authenticatedUser.firstName.charAt(0)}${authenticatedUser.lastName.charAt(0)}`.toUpperCase()
    : 'SK';

  const screenProps = useMemo(
    () => ({ onOpenDrawer: () => setDrawerOpen(true), avatarLabel }),
    [avatarLabel]
  );

  useEffect(() => {
    if (DEV_BYPASS_AUTH) {
      // DEV: Bypass authentication with mock user
      setAuthenticatedUser({
        firstName: 'Dev',
        lastName: 'User',
        phone: '+91 98765 43210',
        email: 'dev@sentri.app',
      });
      setSessionToken('dev-mock-token');
      setAuthInitializing(false);
    } else {
      void restoreSavedSession();
    }
  }, []);

  useEffect(() => {
    void restoreActiveTab();
  }, []);

  useEffect(() => {
    void storeActiveTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    const consumeUrl = (url) => {
      if (!url) {
        return;
      }

      const match = url.match(/sentri:\/\/hangout\/([A-Z0-9-]+)/i);
      if (!match?.[1]) {
        return;
      }

      setIncomingHangoutCode(match[1].toUpperCase());
      setActiveTab('hangout');
    };

    void Linking.getInitialURL().then(consumeUrl);
    const subscription = Linking.addEventListener('url', ({ url }) => consumeUrl(url));
    return () => subscription.remove();
  }, []);

  const restoreSavedSession = async () => {
    const storedToken = await getStoredSessionToken();
    if (!storedToken) {
      setAuthInitializing(false);
      return;
    }

    const storedUser = await getStoredSessionUser();
    if (storedUser) {
      setSessionToken(storedToken);
      setAuthenticatedUser(storedUser);
      setAuthStatusMessage('Restoring your last session.');
      setAuthInitializing(false);
    }

    const result = await authApi.restoreSession(storedToken);
    if (result.ok && result.user) {
      setSessionToken(storedToken);
      setAuthenticatedUser(result.user);
      await storeSessionUser(result.user);
      setAuthStatusMessage(result.message);
    } else {
      await clearStoredSessionToken();
      await clearStoredSessionUser();
      setSessionToken(null);
      setAuthenticatedUser(null);
      setAuthMode('login');
      setAuthStatusMessage(result.message);
    }

    setAuthInitializing(false);
  };

  const restoreActiveTab = async () => {
    const storedTab = await getStoredActiveTab();
    if (storedTab === 'home' || storedTab === 'myspace' || storedTab === 'calorie' || storedTab === 'hangout') {
      setActiveTab(storedTab);
    }
  };

  const handleSignup = async ({ profile, contactMethod }) => {
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
      await storeSessionUser(result.user);
      setSessionToken(result.sessionToken);
      setAuthenticatedUser(result.user);
      setPendingSignup(null);
    }

    return result;
  };

  const handleVerifyOtp = async (otp) => {
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
      await storeSessionUser(result.user);
      setSessionToken(result.sessionToken);
      setAuthenticatedUser(result.user);
      setPendingSignup(null);
      setAuthMode('login');
    }

    return result;
  };

  const handleLogin = async ({ identifier, password }) => {
    const result = await authApi.login({ identifier, password });
    setAuthStatusMessage(result.message);

    if (result.ok && result.sessionToken && result.user) {
      await storeSessionToken(result.sessionToken);
      await storeSessionUser(result.user);
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
    await clearStoredSessionUser();
    setSessionToken(null);
    setAuthenticatedUser(null);
    setPendingSignup(null);
    setDrawerOpen(false);
    setAccountOpen(false);
    setSentriSheetOpen(false);
    setActiveTab('home');
    setHangoutMeetingMode(false);
    setAuthMode('login');
    setAuthStatusMessage('You are logged out. Login again to continue.');
  };

  const handleDrawerSelection = (item) => {
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

      <View style={styles.shell}>
        {ALL_TABS.filter((tab) => mountedTabs.includes(tab)).map((tab) => (
          <View
            key={tab}
            style={[
              styles.screenLayer,
              activeTab === tab ? styles.screenLayerVisible : styles.screenLayerHidden,
            ]}
            pointerEvents={activeTab === tab ? 'auto' : 'none'}
          >
            {renderActiveScreen(tab, screenProps, {
              sessionToken,
              userName,
              incomingHangoutCode,
              onConsumeHangoutCode: () => setIncomingHangoutCode(null),
              onMeetingModeChange: setHangoutMeetingMode,
            })}
          </View>
        ))}
      </View>

      {!hangoutMeetingMode ? (
        <CapsuleTabBar
          activeTab={activeTab}
          onTabChange={(tab) => {
            startTransition(() => setActiveTab(tab));
          }}
          onSentriPress={() => {
            setSentriSheetOpen(true);
          }}
          tone="light"
        />
      ) : null}

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

      <SentriSheet
        visible={sentriSheetOpen}
        userName={userName}
        onClose={() => setSentriSheetOpen(false)}
      />
    </SafeAreaView>
  );
}

function renderActiveScreen(activeTab, props, extras) {
  switch (activeTab) {
    case 'home':
      return <HomeScreen {...props} />;
    case 'myspace':
      return <MyspaceScreen {...props} />;
    case 'calorie':
      return <CalorieScreen {...props} />;
    case 'hangout':
      return (
        <HangoutScreen
          {...props}
          sessionToken={extras.sessionToken}
          userName={extras.userName}
          incomingRoomCode={extras.incomingHangoutCode}
          onConsumeIncomingRoomCode={extras.onConsumeHangoutCode}
          onMeetingModeChange={extras.onMeetingModeChange}
        />
      );
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
  screenLayer: {
    ...StyleSheet.absoluteFillObject,
  },
  screenLayerVisible: {
    opacity: 1,
  },
  screenLayerHidden: {
    opacity: 0,
  },
});
