import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { theme } from '../design/tokens';

/**
 * Loading spinner component with optional message
 * @param {Object} props
 * @param {string} props.message - Loading message
 * @param {string} props.size - Spinner size: 'small', 'large'
 * @param {string} props.color - Spinner color
 * @param {boolean} props.fullScreen - Full screen overlay
 */
export function LoadingSpinner({
  message,
  size = 'large',
  color = theme.colors.accent,
  fullScreen = false,
}) {
  const content = (
    <View style={[styles.container, fullScreen && styles.containerFullScreen]}>
      <ActivityIndicator size={size} color={color} />
      {message ? <Text style={styles.message}>{message}</Text> : null}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={styles.overlay}>
        {content}
      </View>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  containerFullScreen: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.lg,
    ...theme.shadow.soft,
  },
  message: {
    marginTop: theme.spacing.md,
    fontSize: 15,
    fontWeight: '600',
    color: theme.colors.text,
    textAlign: 'center',
  },
});
