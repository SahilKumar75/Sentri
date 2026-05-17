import { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet } from 'react-native';
import { theme } from '../design/tokens';

/**
 * Skeleton loader component with shimmer animation
 * @param {Object} props
 * @param {number} props.width - Width of skeleton (can be string like '100%')
 * @param {number} props.height - Height of skeleton
 * @param {string} props.borderRadius - Border radius (sm, md, lg, pill)
 * @param {Object} props.style - Additional styles
 */
export function SkeletonLoader({
  width = '100%',
  height = 20,
  borderRadius = 'md',
  style,
}) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const shimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    shimmer.start();

    return () => shimmer.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const radiusMap = {
    sm: theme.radius.sm,
    md: theme.radius.md,
    lg: theme.radius.lg,
    pill: theme.radius.pill,
  };

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width,
          height,
          borderRadius: radiusMap[borderRadius] || theme.radius.md,
          opacity,
        },
        style,
      ]}
      accessibilityLabel="Loading content"
      accessibilityRole="progressbar"
    />
  );
}

/**
 * Skeleton card for loading card layouts
 */
export function SkeletonCard({ padded = true }) {
  return (
    <View 
      style={[styles.skeletonCard, padded && styles.skeletonCardPadded]}
      accessibilityLabel="Loading card"
    >
      <SkeletonLoader width="60%" height={24} borderRadius="md" />
      <SkeletonLoader width="100%" height={16} borderRadius="md" style={{ marginTop: 12 }} />
      <SkeletonLoader width="100%" height={16} borderRadius="md" style={{ marginTop: 8 }} />
      <SkeletonLoader width="80%" height={16} borderRadius="md" style={{ marginTop: 8 }} />
      <View style={styles.skeletonFooter}>
        <SkeletonLoader width={80} height={14} borderRadius="pill" />
        <SkeletonLoader width={60} height={14} borderRadius="pill" />
      </View>
    </View>
  );
}

/**
 * Skeleton list for loading list items
 */
export function SkeletonList({ count = 3 }) {
  return (
    <View accessibilityLabel={`Loading ${count} items`}>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.skeletonListItem}>
          <SkeletonLoader width={48} height={48} borderRadius="md" />
          <View style={styles.skeletonListContent}>
            <SkeletonLoader width="70%" height={18} borderRadius="md" />
            <SkeletonLoader width="50%" height={14} borderRadius="md" style={{ marginTop: 8 }} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.surfaceAlt,
  },
  skeletonCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  skeletonCardPadded: {
    padding: 18,
  },
  skeletonFooter: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  skeletonListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.line,
  },
  skeletonListContent: {
    flex: 1,
  },
});
