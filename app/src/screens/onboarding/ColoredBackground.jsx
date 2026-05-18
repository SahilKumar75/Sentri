import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated, Easing } from 'react-native';

/**
 * ColoredBackground Component
 * 
 * Renders an animated solid color background that transitions smoothly between screens.
 * Uses React Native's Animated API for smooth color transitions.
 * 
 * @param {Object} props
 * @param {string} props.color - Hex color value for the background
 * @param {number} props.transitionDuration - Duration of color transition in milliseconds (default: 800)
 */
const ColoredBackground = ({ color, transitionDuration = 800 }) => {
  const animatedColor = useRef(new Animated.Value(0)).current;
  const previousColor = useRef(color);
  const currentColor = useRef(color);

  useEffect(() => {
    if (color !== currentColor.current) {
      previousColor.current = currentColor.current;
      currentColor.current = color;

      // Animate to new color
      Animated.timing(animatedColor, {
        toValue: 1,
        duration: transitionDuration,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false, // backgroundColor animation requires useNativeDriver: false
      }).start(() => {
        // Reset animation value after transition completes
        animatedColor.setValue(0);
        previousColor.current = color;
      });
    }
  }, [color, transitionDuration, animatedColor]);

  // Interpolate between previous and current color
  const backgroundColor = animatedColor.interpolate({
    inputRange: [0, 1],
    outputRange: [previousColor.current, currentColor.current],
  });

  return <Animated.View style={[styles.container, { backgroundColor }]} />;
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default ColoredBackground;
