import React, { useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

/**
 * GradientBackground Component
 * 
 * Renders an animated gradient background that transitions smoothly between color schemes.
 * Uses expo-linear-gradient for gradient rendering with animated color transitions.
 * 
 * @param {Object} props
 * @param {[string, string]} props.colors - Array with start and end colors for the gradient
 * @param {number} props.transitionDuration - Duration in milliseconds for color transitions (default: 800)
 */
const GradientBackground = ({ colors, transitionDuration = 800 }) => {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const previousColors = useRef(colors);
  const [currentColors, setCurrentColors] = React.useState(colors);
  const [nextColors, setNextColors] = React.useState(colors);

  useEffect(() => {
    // Only animate if colors actually changed
    if (
      colors[0] !== previousColors.current[0] ||
      colors[1] !== previousColors.current[1]
    ) {
      // Set up the next gradient
      setNextColors(colors);

      // Fade out current gradient
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: transitionDuration / 2,
        useNativeDriver: true,
      }).start(() => {
        // Switch to new colors
        setCurrentColors(colors);
        previousColors.current = colors;

        // Fade in new gradient
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: transitionDuration / 2,
          useNativeDriver: true,
        }).start();
      });
    }
  }, [colors, transitionDuration, fadeAnim]);

  // Fallback to solid color if gradient fails
  try {
    return (
      <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={currentColors}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      </Animated.View>
    );
  } catch (error) {
    console.error('GradientBackground: Failed to render gradient, falling back to solid color', error);
    // Fallback to solid color using first color in array
    return (
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          { backgroundColor: colors[0], opacity: fadeAnim },
        ]}
      />
    );
  }
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default GradientBackground;
