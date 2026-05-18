import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { theme } from '../../design/tokens';

/**
 * AuthenticationCard Component
 * 
 * Fixed card at the bottom of the onboarding screen with authentication options.
 * Displays buttons for Apple, Google, email signup, and a login link.
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
          style={styles.appleButton}
          onPress={onApplePress}
          accessibilityRole="button"
          accessibilityLabel="Continue with Apple"
        >
          <Text style={styles.appleButtonText}>🍎 Continue with Apple</Text>
        </Pressable>

        {/* Continue with Google Button */}
        <Pressable
          style={styles.darkButton}
          onPress={onGooglePress}
          accessibilityRole="button"
          accessibilityLabel="Continue with Google"
        >
          <Text style={styles.darkButtonText}>G Continue with Google</Text>
        </Pressable>

        {/* Sign up with email Button */}
        <Pressable
          style={styles.darkButton}
          onPress={onEmailPress}
          accessibilityRole="button"
          accessibilityLabel="Sign up with email"
        >
          <Text style={styles.darkButtonText}>✉️ Sign up with email</Text>
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
    paddingHorizontal: theme.chrome.horizontalPadding, // 20px
    paddingBottom: theme.spacing.md, // 16px
  },
  card: {
    backgroundColor: theme.colors.surface, // White
    borderRadius: 28, // Adjusted from theme.radius.xl (30px) to 28px
    padding: theme.spacing.xl, // 24px
    gap: theme.spacing.sm, // 12px
    ...theme.shadow.strong,
  },
  appleButton: {
    height: 52,
    borderRadius: theme.radius.md, // 18px
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: theme.colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appleButtonText: {
    fontSize: theme.typography.body, // 15px
    fontWeight: '700',
    color: theme.colors.text, // Black
  },
  darkButton: {
    height: 52,
    borderRadius: theme.radius.md, // 18px
    backgroundColor: theme.colors.surfaceStrong, // #111111
    alignItems: 'center',
    justifyContent: 'center',
  },
  darkButtonText: {
    fontSize: theme.typography.body, // 15px
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginLink: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xs, // 8px
  },
  loginLinkText: {
    fontSize: theme.typography.footnote, // 12px
    fontWeight: '700',
    color: theme.colors.accent,
  },
});

export default AuthenticationCard;
