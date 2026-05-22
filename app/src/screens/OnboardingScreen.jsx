import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ColoredBackground from './onboarding/ColoredBackground';
import TypewriterText from './onboarding/TypewriterText';
import AuthenticationCard from './onboarding/AuthenticationCard';
import AuthActionSheet from './onboarding/AuthActionSheet';
import { ONBOARDING_SCREENS, ANIMATION_CONFIG } from './onboarding/constants';

const ONBOARDING_TEXTS = ONBOARDING_SCREENS.map(s => s.text);


const OnboardingScreen = ({ onSignup, onLogin }) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [authSheetMode, setAuthSheetMode] = useState(null);
  const authSheetOpen = authSheetMode !== null;

  const handleWordChange = (index) => {
    // Called each time TypewriterText moves to the next word
    setCurrentScreenIndex(index % ONBOARDING_SCREENS.length);
  };

  const handleAuthAction = (action, method, extraData) => {
    if (action === 'signup') onSignup(method, extraData);
    else if (action === 'login') onLogin(extraData);
  };

  const openAuthSheet = (mode) => {
    setAuthSheetMode(mode);
  };

  const closeAuthSheet = () => {
    setAuthSheetMode(null);
  };

  const handleSheetSignup = (method) => {
    closeAuthSheet();
    handleAuthAction('signup', method);
  };

  const handleSheetEmail = (emailText) => {
    closeAuthSheet();
    if (authSheetMode === 'login') {
      handleAuthAction('login', 'email', emailText);
    } else {
      handleAuthAction('signup', 'email', emailText);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <ColoredBackground
        color={ONBOARDING_SCREENS[currentScreenIndex].backgroundColor}
        transitionDuration={ANIMATION_CONFIG.colorTransitionDuration}
      />

      {/* Single instance, never unmounts */}
      <TypewriterText
        texts={ONBOARDING_TEXTS}
        textColor={ONBOARDING_SCREENS[currentScreenIndex].textColor}
        dotColor={ONBOARDING_SCREENS[currentScreenIndex].dotColor}
        onWordChange={handleWordChange}
        speed={ANIMATION_CONFIG.typewriterSpeed}
        eraseSpeed={40}
        pauseBeforeErase={800}
        pauseBeforeNext={0}
        loop={true}
        paused={authSheetOpen}
      />

      <AuthenticationCard
        onApplePress={() => handleSheetSignup('apple')}
        onGooglePress={() => handleSheetSignup('google')}
        onEmailPress={() => openAuthSheet('signup')}
        onLoginPress={() => openAuthSheet('login')}
      />

      <AuthActionSheet
        visible={authSheetOpen}
        mode={authSheetMode}
        onClose={closeAuthSheet}
        onApplePress={() => handleSheetSignup('apple')}
        onGooglePress={() => handleSheetSignup('google')}
        onEmailPress={(emailText) => handleSheetEmail(emailText)}
        onPhonePress={() => handleSheetSignup('phone')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
});

export default OnboardingScreen;
