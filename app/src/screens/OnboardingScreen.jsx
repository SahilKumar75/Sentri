import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import ColoredBackground from './onboarding/ColoredBackground';
import TypewriterText from './onboarding/TypewriterText';
import AuthenticationCard from './onboarding/AuthenticationCard';
import { ONBOARDING_SCREENS, ANIMATION_CONFIG } from './onboarding/constants';

/**
 * OnboardingScreen Component
 * 
 * Main container for the animated onboarding experience.
 * Cycles through multiple screens with typewriter animation and color transitions.
 * 
 * @param {Object} props
 * @param {Function} props.onSignup - Callback when user selects a signup method
 * @param {Function} props.onLogin - Callback when user selects login
 */
const OnboardingScreen = ({ onSignup, onLogin }) => {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);
  const transitionTimeoutRef = useRef(null);

  const currentScreen = ONBOARDING_SCREENS[currentScreenIndex];

  // Handle animation completion
  const handleAnimationComplete = () => {
    if (!isAnimating) return;

    setIsAnimating(false);

    // Wait before transitioning to next screen
    transitionTimeoutRef.current = setTimeout(() => {
      setCurrentScreenIndex((prevIndex) => (prevIndex + 1) % ONBOARDING_SCREENS.length);
      setIsAnimating(true);
    }, ANIMATION_CONFIG.pauseAfterScreen);
  };

  // Handle authentication actions
  const handleAuthAction = (action, method) => {
    // Stop animation loop
    setIsAnimating(false);
    if (transitionTimeoutRef.current) {
      clearTimeout(transitionTimeoutRef.current);
    }

    // Invoke appropriate callback
    if (action === 'signup') {
      onSignup(method);
    } else if (action === 'login') {
      onLogin();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current);
      }
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Animated background color */}
      <ColoredBackground
        color={currentScreen.backgroundColor}
        transitionDuration={ANIMATION_CONFIG.colorTransitionDuration}
      />

      {/* Typewriter text animation */}
      {isAnimating && (
        <TypewriterText
          key={currentScreenIndex} // Force re-render on screen change
          text={currentScreen.text}
          onComplete={handleAnimationComplete}
          speed={ANIMATION_CONFIG.typewriterSpeed}
        />
      )}

      {/* Fixed authentication card */}
      <AuthenticationCard
        onApplePress={() => handleAuthAction('signup', 'apple')}
        onGooglePress={() => handleAuthAction('signup', 'google')}
        onEmailPress={() => handleAuthAction('signup', 'email')}
        onLoginPress={() => handleAuthAction('login')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OnboardingScreen;
