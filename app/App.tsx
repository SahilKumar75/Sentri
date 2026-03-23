import { StatusBar } from 'expo-status-bar';
import { useMemo, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

import { CapsuleTabBar, DrawerSheet } from './src/components/sentri-ui';
import { theme, type TabKey } from './src/design/tokens';
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
  const [registeredUser, setRegisteredUser] = useState<UserProfile | null>(null);
  const [authenticatedUser, setAuthenticatedUser] = useState<UserProfile | null>(null);
  const [pendingSignup, setPendingSignup] = useState<PendingSignup | null>(null);
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [authStatusMessage, setAuthStatusMessage] = useState<string | null>(null);
  const [accountView, setAccountView] = useState<'account' | 'settings'>('account');

  const darkChrome = authenticatedUser !== null && activeTab === 'calorie';
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

  const handleSignup = ({
    profile,
    contactMethod,
  }: {
    profile: UserProfile;
    contactMethod: ContactMethod;
  }) => {
    const normalizedProfile: UserProfile = {
      ...profile,
      firstName: profile.firstName.trim(),
      lastName: profile.lastName.trim(),
      dob: profile.dob.trim(),
      phone: profile.phone?.trim(),
      email: profile.email?.trim().toLowerCase(),
      password: profile.password,
      verifiedPhone: false,
    };

    if (!normalizedProfile.firstName || !normalizedProfile.lastName || !normalizedProfile.dob || !normalizedProfile.password) {
      return { ok: false, message: 'Please fill first name, last name, DOB, and password.' };
    }

    if (contactMethod === 'phone') {
      if (!normalizedProfile.phone) {
        return { ok: false, message: 'Enter your phone number to continue with OTP.' };
      }

      const otpCode = `${Math.floor(1000 + Math.random() * 9000)}`;
      setPendingSignup({
        profile: normalizedProfile,
        contactMethod,
        otpCode,
      });
      setAuthMode('otp');
      setAuthStatusMessage(`OTP sent to ${normalizedProfile.phone}.`);
      return { ok: true, message: `OTP sent to ${normalizedProfile.phone}.` };
    }

    if (!normalizedProfile.email) {
      return { ok: false, message: 'Enter your email to create the account.' };
    }

    setRegisteredUser(normalizedProfile);
    setAuthenticatedUser(normalizedProfile);
    setPendingSignup(null);
    setAuthStatusMessage(`Welcome, ${normalizedProfile.firstName}. Your account is ready.`);
    return { ok: true, message: `Welcome, ${normalizedProfile.firstName}. Your account is ready.` };
  };

  const handleVerifyOtp = (otp: string) => {
    if (!pendingSignup) {
      return { ok: false, message: 'No phone verification is waiting right now.' };
    }

    if (otp.trim() !== pendingSignup.otpCode) {
      return { ok: false, message: 'The OTP did not match. Try the code again.' };
    }

    const verifiedProfile = {
      ...pendingSignup.profile,
      verifiedPhone: true,
    };

    setRegisteredUser(verifiedProfile);
    setAuthenticatedUser(verifiedProfile);
    setPendingSignup(null);
    setAuthMode('login');
    setAuthStatusMessage(`Phone verified for ${verifiedProfile.firstName}.`);
    return { ok: true, message: `Phone verified for ${verifiedProfile.firstName}.` };
  };

  const handleLogin = ({ identifier, password }: { identifier: string; password: string }) => {
    if (!registeredUser) {
      return { ok: false, message: 'No account exists yet. Please sign up first.' };
    }

    const normalizedIdentifier = identifier.trim().toLowerCase();
    const phoneMatch =
      normalizePhone(registeredUser.phone || '') !== '' &&
      normalizePhone(registeredUser.phone || '') === normalizePhone(identifier);
    const emailMatch = (registeredUser.email || '').toLowerCase() === normalizedIdentifier;

    if (!(phoneMatch || emailMatch)) {
      return { ok: false, message: 'That phone number or email is not registered yet.' };
    }

    if (registeredUser.password !== password) {
      return { ok: false, message: 'Password mismatch. Please try again.' };
    }

    setAuthenticatedUser(registeredUser);
    setAuthStatusMessage(`Welcome back, ${registeredUser.firstName}.`);
    return { ok: true, message: `Welcome back, ${registeredUser.firstName}.` };
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setDrawerOpen(false);
    setAccountOpen(false);
    setActiveTab('home');
    setAuthMode('login');
    setAuthStatusMessage('You are logged out. Login again to continue.');
  };

  const handleDrawerSelection = (item: 'account' | 'settings' | 'logout') => {
    if (item === 'logout') {
      handleLogout();
      return;
    }

    setAccountView(item);
    setAccountOpen(true);
  };

  if (!authenticatedUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" />
        <AuthScreen
          mode={authMode}
          registeredUser={registeredUser}
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
    <SafeAreaView style={[styles.safeArea, darkChrome && styles.safeAreaDark]}>
      <StatusBar style={darkChrome ? 'light' : 'dark'} />

      <View style={styles.shell}>{renderActiveScreen(activeTab, screenProps)}</View>

      <CapsuleTabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onSentriPress={() => {
          // Reserved for the future assistant surface.
        }}
        tone={darkChrome ? 'dark' : 'light'}
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
        onLogout={handleLogout}
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

function normalizePhone(input: string) {
  const digits = input.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  safeAreaDark: {
    backgroundColor: theme.colors.darkBackground,
  },
  shell: {
    flex: 1,
  },
});
