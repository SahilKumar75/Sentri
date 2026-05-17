import { Pressable, Text, View, StyleSheet } from 'react-native';
import { theme } from '../design/tokens';

/**
 * Filter chip component for filtering content
 * @param {Object} props
 * @param {string} props.label - Chip label
 * @param {boolean} props.active - Active state
 * @param {Function} props.onPress - Press handler
 * @param {number} props.count - Optional count badge
 */
export function FilterChip({
  label,
  active = false,
  onPress,
  count,
}) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.filterChip,
        active && styles.filterChipActive,
        pressed && styles.filterChipPressed,
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Filter by ${label}${count ? `, ${count} items` : ''}`}
      accessibilityState={{ selected: active }}
      accessibilityHint={active ? 'Double tap to remove filter' : 'Double tap to apply filter'}
    >
      <Text
        style={[
          styles.filterChipText,
          active && styles.filterChipTextActive,
        ]}
      >
        {label}
      </Text>
      {count !== undefined && count > 0 ? (
        <View 
          style={[
            styles.filterCount,
            active && styles.filterCountActive,
          ]}
          accessibilityLabel={`${count} items`}
        >
          <Text 
            style={[
              styles.filterCountText,
              active && styles.filterCountTextActive,
            ]}
          >
            {count}
          </Text>
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
    minHeight: 44, // Accessibility: minimum touch target
  },
  filterChipActive: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  filterChipPressed: {
    opacity: 0.7,
  },
  filterChipText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  filterCount: {
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterCountText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '800',
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },
});
