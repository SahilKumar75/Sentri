import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../design/tokens';
import { Button } from './Button';

/**
 * Empty state component for when there's no content to display
 * @param {Object} props
 * @param {string} props.icon - Ionicons icon name
 * @param {string} props.title - Empty state title
 * @param {string} props.description - Empty state description
 * @param {string} props.actionLabel - Action button label
 * @param {Function} props.onActionPress - Action button press handler
 */
export function EmptyState({
  icon = 'file-tray-outline',
  title = 'Nothing here yet',
  description,
  actionLabel,
  onActionPress,
}) {
  return (
    <View style={styles.container}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={64} color={theme.colors.textMuted} />
      </View>
      
      <Text style={styles.title}>{title}</Text>
      
      {description ? (
        <Text style={styles.description}>{description}</Text>
      ) : null}
      
      {actionLabel && onActionPress ? (
        <View style={styles.actionContainer}>
          <Button
            label={actionLabel}
            onPress={onActionPress}
            variant="primary"
            size="md"
          />
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
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: 15,
    color: theme.colors.textSoft,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 320,
  },
  actionContainer: {
    marginTop: theme.spacing.lg,
    minWidth: 200,
  },
});
