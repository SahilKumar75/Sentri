import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../../design/tokens';

/**
 * AuthenticationCard Component
 * 
 * Fixed card at the bottom of the onboarding screen with authentication options.
 * Displays buttons for Apple, Google, email signup, and a login link.
 * Edge-to-edge design with rounded top corners only.
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
  return (
    <View style={styles.container}>
      <View style={styles.card}>
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
          <Ionicons name="logo-google" size={20} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.darkButtonText}>Continue with Google</Text>
        </Pressable>

        {/* Sign up with email Button */}
        <Pressable
          style={({ pressed }) => [
            styles.darkButton,
            pressed && styles.buttonPressed,
          ]}
          onPress={onEmailPress}
          accessibilityRole="button"
          accessibilityLabel="Sign up with email"
        >
          <Ionicons name="mail" size={20} color="#FFFFFF" style={styles.icon} />
          <Text style={styles.darkButtonText}>Sign up with email</Text>
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
    backgroundColor: '#000000', // Black background like reference
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40, // Extra padding for safe area
    gap: 12,
  },
  appleButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
  },
  darkButton: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#1C1C1E', // Dark gray like reference
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  icon: {
    marginRight: 8,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginLinkText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default AuthenticationCard;
