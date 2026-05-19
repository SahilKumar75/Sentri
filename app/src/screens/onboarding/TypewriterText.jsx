import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AnimatedDot from './AnimatedDot';

/**
 * TypewriterText Component
 * 
 * Renders text character by character with a typewriter animation effect.
 * Includes an animated dot that moves with the text and disappears when the text includes "●".
 * Features smooth fade-out transition when animation completes.
 * 
 * @param {Object} props
 * @param {string} props.text - The text to display with typewriter animation
 * @param {string} props.textColor - Color for the text (default: white)
 * @param {string} props.dotColor - Color for the animated dot (default: white)
 * @param {Function} props.onComplete - Callback invoked when animation completes
 * @param {number} props.speed - Milliseconds per character (default: 80)
 * @param {number} props.fadeOutDuration - Duration of fade out animation in ms (default: 400)
 */
const TypewriterText = ({ text, textColor = '#FFFFFF', dotColor = '#FFFFFF', onComplete, speed = 80, fadeOutDuration = 400 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const dotPosition = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current; // For fade out effect
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
    fadeAnim.setValue(1); // Reset fade animation

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
        // Animation complete - start fade out
        clearInterval(intervalRef.current);
        
        // Call onComplete BEFORE fade starts so background can transition with text
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
        
        // Fade out animation
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: fadeOutDuration,
          useNativeDriver: true,
        }).start();
      }
    }, speed);

    // Timeout fallback: force completion if animation doesn't finish
    const timeoutDuration = text.length * speed + fadeOutDuration + 1000;
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
  }, [text, speed, dotPosition, fadeAnim, fadeOutDuration]);

  return (
    <Animated.View style={[
      styles.container, 
      { 
        paddingTop: Math.max(insets.top, 20),
        opacity: fadeAnim, // Apply fade animation
      }
    ]}>
      <View style={styles.textContainer}>
        <AnimatedDot position={dotPosition} visible={isDotVisible} color={dotColor} />
        <Text style={[styles.text, { color: textColor }]}>{displayedText}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: -250, // Move text higher to avoid card overlap
  },
  textContainer: {
    position: 'relative',
  },
  text: {
    fontSize: 45,
    fontWeight: '700',
    lineHeight: 56,
    textAlign: 'center', // Center align for multi-line text
  },
});

export default TypewriterText;
