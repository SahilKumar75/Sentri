import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import AnimatedDot from './AnimatedDot';

/**
 * TypewriterText Component
 * 
 * Renders text character by character with a typewriter animation effect.
 * Includes an animated dot that moves with the text and disappears when the text includes "●".
 * 
 * @param {Object} props
 * @param {string} props.text - The text to display with typewriter animation
 * @param {Function} props.onComplete - Callback invoked when animation completes
 * @param {number} props.speed - Milliseconds per character (default: 80)
 */
const TypewriterText = ({ text, onComplete, speed = 80 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const dotPosition = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);

  // Check if dot should be visible (hide when text includes "●")
  const isDotVisible = !displayedText.includes('●') && currentIndex < text.length;

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    dotPosition.setValue(0);

    // Start typewriter animation
    intervalRef.current = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        if (prevIndex < text.length) {
          const nextIndex = prevIndex + 1;
          const nextText = text.substring(0, nextIndex);
          setDisplayedText(nextText);

          // Animate dot position (approximate: 28px per character)
          Animated.timing(dotPosition, {
            toValue: nextIndex * 28,
            duration: speed,
            useNativeDriver: true,
          }).start();

          return nextIndex;
        } else {
          // Animation complete
          clearInterval(intervalRef.current);
          if (onComplete) {
            onComplete();
          }
          return prevIndex;
        }
      });
    }, speed);

    // Timeout fallback: force completion if animation doesn't finish
    const timeoutDuration = text.length * speed + 500;
    timeoutRef.current = setTimeout(() => {
      if (currentIndex < text.length) {
        console.warn('TypewriterText animation timeout, forcing completion');
        setDisplayedText(text);
        setCurrentIndex(text.length);
        clearInterval(intervalRef.current);
        if (onComplete) {
          onComplete();
        }
      }
    }, timeoutDuration);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [text, speed, onComplete]);

  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        <AnimatedDot position={dotPosition} visible={isDotVisible} />
        <Text style={styles.text}>{displayedText}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  textContainer: {
    position: 'relative',
  },
  text: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 56,
    textAlign: 'left',
  },
});

export default TypewriterText;
