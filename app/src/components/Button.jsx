import { Pressable, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { theme } from '../design/tokens';

/**
 * Button component with multiple variants and states
 * @param {Object} props
 * @param {string} props.label - Button text
 * @param {Function} props.onPress - Press handler
 * @param {string} props.variant - Button style: 'primary', 'secondary', 'outline', 'ghost'
 * @param {string} props.size - Button size: 'sm', 'md', 'lg'
 * @param {boolean} props.disabled - Disabled state
 * @param {boolean} props.loading - Loading state with spinner
 * @param {boolean} props.fullWidth - Full width button
 */
export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        styles[`button_${variant}`],
        styles[`button_${size}`],
        fullWidth && styles.buttonFullWidth,
        isDisabled && styles.buttonDisabled,
        pressed && !isDisabled && styles.buttonPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: isDisabled }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? '#FFFFFF' : theme.colors.accent}
        />
      ) : (
        <Text
          style={[
            styles.buttonText,
            styles[`buttonText_${variant}`],
            styles[`buttonText_${size}`],
            isDisabled && styles.buttonTextDisabled,
          ]}
        >
          {label}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.radius.md,
    borderWidth: 1,
  },
  button_primary: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  button_secondary: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.line,
  },
  button_outline: {
    backgroundColor: 'transparent',
    borderColor: theme.colors.accent,
  },
  button_ghost: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
  },
  button_sm: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 44,
  },
  button_md: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  button_lg: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 52,
  },
  buttonFullWidth: {
    width: '100%',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontWeight: '700',
  },
  buttonText_primary: {
    color: '#FFFFFF',
  },
  buttonText_secondary: {
    color: theme.colors.text,
  },
  buttonText_outline: {
    color: theme.colors.accent,
  },
  buttonText_ghost: {
    color: theme.colors.accent,
  },
  buttonText_sm: {
    fontSize: 13,
  },
  buttonText_md: {
    fontSize: 15,
  },
  buttonText_lg: {
    fontSize: 17,
  },
  buttonTextDisabled: {
    opacity: 1,
  },
});
