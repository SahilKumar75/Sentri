import React from 'react';
import { StyleSheet, Animated, Text } from 'react-native';

/**
 * AnimatedDot Component
 * 
 * Visual indicator that moves with the typewriter animation.
 * Displays a white dot (●) that animates horizontally as text is typed.
 * 
 * @param {Object} props
 * @param {Animated.Value} props.position - Animated value controlling horizontal position
 * @param {boolean} props.visible - Whether the dot should be visible
 */
const AnimatedDot = ({ position, visible }) => {
  if (!visible) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateX: position }],
        },
      ]}
    >
      <Text style={styles.dot}>●</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
  },
  dot: {
    fontSize: 48,
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default AnimatedDot;
