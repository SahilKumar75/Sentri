import { useEffect, useRef } from 'react';
import { Animated, Text, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { theme } from '../design/tokens';

/**
 * Toast notification component
 * @param {Object} props
 * @param {boolean} props.visible - Toast visibility
 * @param {string} props.message - Toast message
 * @param {string} props.type - Toast type: 'success', 'error', 'info', 'warning'
 * @param {number} props.duration - Auto-hide duration in ms (0 = no auto-hide)
 * @param {Function} props.onHide - Hide callback
 */
export function Toast({
  visible,
  message,
  type = 'info',
  duration = 3000,
  onHide,
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-20)).current;

  useEffect(() => {
    if (visible) {
      // Show animation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Auto-hide
      if (duration > 0 && onHide) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible, duration]);

  const hideToast = () => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: -20,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onHide) {
        onHide();
      }
    });
  };

  if (!visible && opacity._value === 0) {
    return null;
  }

  const iconName = {
    success: 'checkmark-circle',
    error: 'close-circle',
    warning: 'warning',
    info: 'information-circle',
  }[type];

  return (
    <Animated.View
      style={[
        styles.container,
        styles[`container_${type}`],
        {
          opacity,
          transform: [{ translateY }],
        },
      ]}
    >
      <Ionicons
        name={iconName}
        size={22}
        color="#FFFFFF"
        style={styles.icon}
      />
      <Text style={styles.message} numberOfLines={2}>
        {message}
      </Text>
    </Animated.View>
  );
}

/**
 * Toast container component to position toasts at the top of the screen
 */
export function ToastContainer({ children }) {
  return <View style={styles.toastContainer}>{children}</View>;
}

const styles = StyleSheet.create({
  toastContainer: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 9999,
    pointerEvents: 'box-none',
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: theme.radius.md,
    ...theme.shadow.strong,
    marginBottom: 8,
  },
  container_success: {
    backgroundColor: '#4CAF50',
  },
  container_error: {
    backgroundColor: '#F44336',
  },
  container_warning: {
    backgroundColor: '#FF9800',
  },
  container_info: {
    backgroundColor: theme.colors.accent,
  },
  icon: {
    marginRight: 12,
  },
  message: {
    flex: 1,
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 20,
  },
});
