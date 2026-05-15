import { useState } from 'react';
import { View, TextInput, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../design/tokens';

/**
 * Input component with label, error state, and optional icon
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.value - Input value
 * @param {Function} props.onChangeText - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {string} props.error - Error message
 * @param {boolean} props.secure - Secure text entry (password)
 * @param {string} props.icon - Ionicons icon name
 * @param {string} props.keyboardType - Keyboard type
 * @param {boolean} props.multiline - Multiline input
 * @param {number} props.numberOfLines - Number of lines for multiline
 */
export function Input({
  label,
  value,
  onChangeText,
  placeholder,
  error,
  secure = false,
  icon,
  keyboardType = 'default',
  multiline = false,
  numberOfLines = 1,
  ...rest
}) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = !!error;
  const isSecure = secure && !showPassword;

  return (
    <View style={styles.container}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      
      <View
        style={[
          styles.inputWrapper,
          isFocused && styles.inputWrapperFocused,
          hasError && styles.inputWrapperError,
          multiline && styles.inputWrapperMultiline,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={20}
            color={hasError ? theme.colors.error : theme.colors.textSoft}
            style={styles.icon}
          />
        ) : null}
        
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          multiline={multiline}
          numberOfLines={numberOfLines}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[
            styles.input,
            multiline && styles.inputMultiline,
          ]}
          {...rest}
        />
        
        {secure ? (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
          >
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={theme.colors.textSoft}
            />
          </Pressable>
        ) : null}
      </View>
      
      {hasError ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: theme.spacing.md,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    minHeight: 48,
  },
  inputWrapperFocused: {
    borderColor: theme.colors.accent,
    borderWidth: 2,
  },
  inputWrapperError: {
    borderColor: theme.colors.error,
  },
  inputWrapperMultiline: {
    minHeight: 96,
    alignItems: 'flex-start',
    paddingVertical: 12,
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    paddingVertical: 12,
  },
  inputMultiline: {
    textAlignVertical: 'top',
  },
  eyeButton: {
    padding: 4,
    marginLeft: 8,
  },
  errorText: {
    fontSize: 13,
    color: theme.colors.error,
    marginTop: 6,
    marginLeft: 4,
  },
});
