import React from 'react';
import { StyleSheet, View, Text, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../design/tokens';

/**
 * AuthenticationCard Component
 * 
 * Fixed card at the bottom of the onboarding screen with authentication options.
 * Displays buttons for Apple, Google, email signup, and a login link.
 * Edge-to-edge design with rounded top corners only, extends to bottom of screen.
 * 
 * @param {Object} props
 * @param {Function} props.onApplePress - Callback when "Continue with Apple" is pressed
 * @param {Function} props.onGooglePress - Callback when "Continue with Google" is pressed
 * @param {Function} props.onEmailPress - Callback when "Sign up with email" is pressed
 * @param {Function} props.onLoginPress - Callback when "Log in" link is pressed
 */
const AuthenticationCard = ({
  onApplePress,
  onGooglePress,
  onEmailPress,
  onLoginPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={[styles.card, { paddingBottom: Math.max(insets.bottom, 12) + 8 }]}>
        {/* Continue with Google Button */}
        <Pressable
          style={({ pressed }) => [
            styles.darkButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onGooglePress}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          {/* Multicolor Google G logo */}
          <Image 
            source={require('../../../assets/google-logo.jpg-removebg-preview.png')} 
            style={styles.googleLogo}
            resizeMode="contain"
          />
          <Text style={styles.darkButtonText}>Continue with Google</Text>
        </Pressable>

        {/* Continue with Apple Button */}
        <Pressable
          style={({ pressed }) => [
            styles.appleButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onApplePress}
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
        >
          <Ionicons name="logo-apple" size={20} color="#000000" style={styles.icon} />
          <Text style={styles.appleButtonText}>Continue with Apple</Text>
        </Pressable>

        {/* Sign up Button */}
        <Pressable
          style={({ pressed }) => [
            styles.darkButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onEmailPress}
          accessibilityRole="button"
          accessibilityLabel="Sign up"
        >
          <Text style={styles.darkButtonText}>Sign up</Text>
        </Pressable>

        {/* Log in Link */}
        <Pressable
          onPress={onLoginPress}
          accessibilityRole="button"
          accessibilityLabel="Log in"
          style={styles.loginLink}
        >
          <Text style={styles.loginLinkText}>Log in</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  card: {
    backgroundColor: '#1E1E1E', // Dark gray card
    borderTopLeftRadius: 34, // Reduced by 15% (36 * 0.85 = 30.6)
    borderTopRightRadius: 34,
    paddingHorizontal: 17, // Reduced by 15% (20 * 0.85 = 17)
    paddingTop: 18, // Reduced top padding for less height
    // paddingBottom is dynamic based on safe area insets
    gap: 8, // Reduced gap between buttons
    alignItems: 'center', // Center buttons horizontally
  },
  appleButton: {
    height: 44, // Reduced by 15% (52 * 0.85 = 44.2)
    borderRadius: 14, // Reduced by 15% (12 * 0.85 = 10.2)
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Reduced width
    maxWidth: 340, // Maximum width constraint
  },
  appleButtonText: {
    fontSize: 16, // Reduced by 15% (16 * 0.85 = 13.6)
    fontWeight: '600',
    color: '#000000',
  },
  darkButton: {
    height: 44, // Reduced by 15% (52 * 0.85 = 44.2)
    borderRadius: 14, // Reduced by 15% (12 * 0.85 = 10.2)
    backgroundColor: '#2C2C2E', // Slightly lighter dark gray
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%', // Reduced width
    maxWidth: 340, // Maximum width constraint
  },
  darkButtonText: {
    fontSize: 16, // Reduced by 15% (16 * 0.85 = 13.6)
    fontWeight: '600',
    color: '#FFFFFF',
  },
  googleLogo: {
    width: 27, // Reduced by 15% (32 * 0.85 = 27.2)
    height: 27,
    marginRight: 8, // Reduced by 15% (10 * 0.85 = 8.5)
  },
  icon: {
    marginRight: 7, // Reduced by 15% (8 * 0.85 = 6.8)
  },
  buttonPressed: {
    opacity: 0.6,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 12, // Reduced by 15% (14 * 0.85 = 11.9)
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.16)', // Thin white border
    borderRadius: 14, // Reduced by 15% (12 * 0.85 = 10.2)
    marginTop: 0, // Removed margin to reduce height
    width: '100%', // Reduced width
    maxWidth: 340, // Maximum width constraint
  },
  loginLinkText: {
    fontSize: 16, // Reduced by 15% (15 * 0.85 = 12.75)
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AuthenticationCard;
