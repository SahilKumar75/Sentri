import { View, Text, StyleSheet } from 'react-native';
import { theme } from '../design/tokens';

/**
 * Badge component for status indicators and labels
 * @param {Object} props
 * @param {string} props.label - Badge text
 * @param {string} props.variant - Badge style: 'default', 'success', 'warning', 'error', 'info'
 * @param {string} props.size - Badge size: 'sm', 'md', 'lg'
 * @param {boolean} props.dot - Show as dot indicator
 */
export function Badge({
  label,
  variant = 'default',
  size = 'md',
  dot = false,
}) {
  if (dot) {
    return (
      <View
        style={[
          styles.dot,
          styles[`dot_${variant}`],
          styles[`dot_${size}`],
        ]}
      />
    );
  }

  return (
    <View
      style={[
        styles.badge,
        styles[`badge_${variant}`],
        styles[`badge_${size}`],
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          styles[`badgeText_${variant}`],
          styles[`badgeText_${size}`],
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderWidth: 1,
  },
  badge_default: {
    backgroundColor: theme.colors.surfaceAlt,
    borderColor: theme.colors.line,
  },
  badge_success: {
    backgroundColor: '#E8F5E9',
    borderColor: '#4CAF50',
  },
  badge_warning: {
    backgroundColor: '#FFF3E0',
    borderColor: '#FF9800',
  },
  badge_error: {
    backgroundColor: '#FFEBEE',
    borderColor: '#F44336',
  },
  badge_info: {
    backgroundColor: theme.colors.accentSoft,
    borderColor: theme.colors.accent,
  },
  badge_sm: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  badge_md: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badge_lg: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontWeight: '700',
  },
  badgeText_default: {
    color: theme.colors.text,
  },
  badgeText_success: {
    color: '#2E7D32',
  },
  badgeText_warning: {
    color: '#E65100',
  },
  badgeText_error: {
    color: '#C62828',
  },
  badgeText_info: {
    color: theme.colors.accentStrong,
  },
  badgeText_sm: {
    fontSize: 11,
  },
  badgeText_md: {
    fontSize: 12,
  },
  badgeText_lg: {
    fontSize: 13,
  },
  dot: {
    borderRadius: 999,
  },
  dot_default: {
    backgroundColor: theme.colors.textMuted,
  },
  dot_success: {
    backgroundColor: '#4CAF50',
  },
  dot_warning: {
    backgroundColor: '#FF9800',
  },
  dot_error: {
    backgroundColor: '#F44336',
  },
  dot_info: {
    backgroundColor: theme.colors.accent,
  },
  dot_sm: {
    width: 6,
    height: 6,
  },
  dot_md: {
    width: 8,
    height: 8,
  },
  dot_lg: {
    width: 10,
    height: 10,
  },
});
