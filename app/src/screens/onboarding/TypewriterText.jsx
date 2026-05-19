import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedDot from './AnimatedDot';

/**
 * TypewriterText Component
 * 
 * Renders text character by character with a typewriter animation effect.
 * Includes an animated dot that moves with the text and disappears when the text includes "●".
 * 
 * @param {Object} props
 * @param {string} props.text - The text to display with typewriter animation
 * @param {string} props.textColor - Color for the text (default: white)
 * @param {string} props.dotColor - Color for the animated dot (default: white)
 * @param {Function} props.onComplete - Callback invoked when animation completes
 * @param {number} props.speed - Milliseconds per character (default: 80)
 */
const TypewriterText = ({ text, textColor = '#FFFFFF', dotColor = '#FFFFFF', onComplete, speed = 80 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const dotPosition = useRef(new Animated.Value(0)).current;
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const insets = useSafeAreaInsets();

  // Keep onComplete ref updated
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Check if dot should be visible (hide when text includes "●")
  const isDotVisible = !displayedText.includes('●') && currentIndex < text.length;

  useEffect(() => {
    // Reset state when text changes
    setDisplayedText('');
    setCurrentIndex(0);
    dotPosition.setValue(0);

    let index = 0;

    // Start typewriter animation
    intervalRef.current = setInterval(() => {
      index += 1;
      
      if (index <= text.length) {
        const nextText = text.substring(0, index);
        setDisplayedText(nextText);
        setCurrentIndex(index);

        // Animate dot position (approximate: 28px per character)
        Animated.timing(dotPosition, {
          toValue: index * 28,
          duration: speed,
          useNativeDriver: true,
        }).start();
      } else {
        // Animation complete
        clearInterval(intervalRef.current);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    }, speed);

    // Timeout fallback: force completion if animation doesn't finish
    const timeoutDuration = text.length * speed + 1000;
    timeoutRef.current = setTimeout(() => {
      if (index < text.length) {
        console.warn('TypewriterText animation timeout, forcing completion');
        setDisplayedText(text);
        setCurrentIndex(text.length);
        clearInterval(intervalRef.current);
        if (onCompleteRef.current) {
          onCompleteRef.current();
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
  }, [text, speed, dotPosition]);

  return (
    <View style={[styles.container, { paddingTop: Math.max(insets.top, 20) }]}>
      <View style={styles.textContainer}>
        <AnimatedDot position={dotPosition} visible={isDotVisible} color={dotColor} />
        <Text style={[styles.text, { color: textColor }]}>{displayedText}</Text>
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
    lineHeight: 56,
    textAlign: 'left',
  },
});

export default TypewriterText;
