import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

/**
 * TypewriterText Component
 * 
 * Simple typewriter effect: text appears character by character with dot at the end
 * Dot stays with text, no complex animations that move off screen
 */
const TypewriterText = ({ text, textColor = '#FFFFFF', dotColor = '#FFFFFF', onComplete, speed = 80, fadeOutDuration = 400 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Check if we should show the dot (hide when text includes "●")
  const shouldShowDot = !displayedText.includes('●');

  useEffect(() => {
    // Reset
    setDisplayedText('');
    fadeAnim.setValue(1);

    let index = 0;

    // Start typewriter animation
    intervalRef.current = setInterval(() => {
      index += 1;
      
      if (index <= text.length) {
        const nextText = text.substring(0, index);
        setDisplayedText(nextText);

        // Haptic feedback on each character
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      } else {
        // Typing complete
        clearInterval(intervalRef.current);
        
        // Brief pause, then call onComplete and fade out
        setTimeout(() => {
          if (onCompleteRef.current) {
            onCompleteRef.current();
          }
          
          // Fade out
          Animated.timing(fadeAnim, {
            toValue: 0,
            duration: fadeOutDuration,
            useNativeDriver: true,
          }).start();
        }, 300);
      }
    }, speed);

    // Timeout fallback
    const timeoutDuration = text.length * speed + fadeOutDuration + 2000;
    timeoutRef.current = setTimeout(() => {
      if (index < text.length) {
        console.warn('TypewriterText animation timeout, forcing completion');
        clearInterval(intervalRef.current);
        if (onCompleteRef.current) {
          onCompleteRef.current();
        }
      }
    }, timeoutDuration);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [text, speed, fadeAnim, fadeOutDuration]);

  return (
    <Animated.View style={[
      styles.container, 
      { 
        paddingTop: Math.max(insets.top, 20),
        opacity: fadeAnim,
      }
    ]}>
      <View style={styles.textRow}>
        <Text style={[styles.text, { color: textColor }]}>
          {displayedText}
        </Text>
        {shouldShowDot && (
          <Text style={[styles.dot, { color: dotColor }]}>●</Text>
        )}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    marginTop: -210,
  },
  textRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap', // Allow text to wrap if too long
    maxWidth: '100%', // Stay within screen bounds
  },
  text: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 48,
    textAlign: 'center',
  },
  dot: {
    fontSize: 40,
    fontWeight: '700',
    lineHeight: 48,
    marginLeft: 4,
  },
});

export default TypewriterText;
