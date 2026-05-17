import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../design/tokens';

/**
 * Reusable search bar component with clear functionality
 * @param {Object} props
 * @param {string} props.value - Search input value
 * @param {Function} props.onChangeText - Change handler
 * @param {string} props.placeholder - Placeholder text
 * @param {Function} props.onClear - Clear button handler
 * @param {boolean} props.autoFocus - Auto focus on mount
 * @param {string} props.returnKeyType - Keyboard return key type
 */
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search...',
  onClear,
  autoFocus = false,
  returnKeyType = 'search',
}) {
  return (
    <View 
      style={styles.searchBar}
      accessibilityRole="search"
      accessibilityLabel={placeholder}
    >
      <Ionicons 
        name="search" 
        size={18} 
        color={theme.colors.textMuted}
        accessibilityHidden={true}
      />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={styles.searchInput}
        autoFocus={autoFocus}
        returnKeyType={returnKeyType}
        accessibilityLabel={`Search input, ${placeholder}`}
        accessibilityHint="Enter text to search"
      />
      {value ? (
        <Pressable 
          onPress={onClear}
          style={styles.clearButton}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          accessibilityHint="Clears the search input"
        >
          <Ionicons 
            name="close-circle" 
            size={18} 
            color={theme.colors.textMuted}
          />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 48, // Accessibility: minimum touch target
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
    minHeight: 24,
  },
  clearButton: {
    padding: 4,
    minWidth: 44, // Accessibility: minimum touch target
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
