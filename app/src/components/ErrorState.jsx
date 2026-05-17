import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../design/tokens';
import { Button } from './Button';

/**
 * Error state component for displaying errors with recovery options
 * @param {Object} props
 * @param {string} props.title - Error title
 * @param {string} props.message - Error message
 * @param {string} props.actionLabel - Primary action button label
 * @param {Function} props.onActionPress - Primary action handler
 * @param {string} props.secondaryLabel - Secondary action button label
 * @param {Function} props.onSecondaryPress - Secondary action handler
 * @param {string} props.type - Error type: 'error', 'warning', 'network'
 */
export function ErrorState({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  actionLabel = 'Try again',
  onActionPress,
  secondaryLabel,
  onSecondaryPress,
  type = 'error',
}) {
  const iconMap = {
    error: 'alert-circle-outline',
    warning: 'warning-outline',
    network: 'cloud-offline-outline',
  };

  const colorMap = {
    error: '#F44336',
    warning: '#FF9800',
    network: theme.colors.textMuted,
  };

  return (
    <View 
      style={styles.container}
      accessibilityRole="alert"
      accessibilityLabel={`Error: ${title}`}
      accessibilityHint={message}
    >
      <View 
        style={[
          styles.iconContainer,
          { backgroundColor: `${colorMap[type]}15` },
        ]}
      >
        <Ionicons 
          name={iconMap[type]} 
          size={48} 
          color={colorMap[type]}
          accessibilityHidden={true}
        />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      <Text style={styles.message}>{message}</Text>
      
      {onActionPress ? (
        <View style={styles.actionContainer}>
          <Button
            label={actionLabel}
            onPress={onActionPress}
            variant="primary"
            size="md"
            fullWidth
          />
          {secondaryLabel && onSecondaryPress ? (
            <Button
              label={secondaryLabel}
              onPress={onSecondaryPress}
              variant="ghost"
              size="md"
              fullWidth
            />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  message: {
    fontSize: 15,
    color: theme.colors.textSoft,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
    marginBottom: theme.spacing.lg,
  },
  actionContainer: {
    width: '100%',
    maxWidth: 280,
    gap: theme.spacing.sm,
  },
});
