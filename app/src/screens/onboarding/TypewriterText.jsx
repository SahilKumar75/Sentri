import { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const TypewriterText = ({
  texts,
  text,
  textColor = '#FFFFFF',
  dotColor = '#FFFFFF',
  onComplete,
  onWordChange,   // NEW: fires with index each time a new word starts
  speed = 80,
  eraseSpeed = 40,
  pauseBeforeErase = 800,
  pauseBeforeNext = 0,
  fadeOutDuration = 400,
  loop = false,
  paused = false,
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const intervalRef = useRef(null);
  const timeoutRef = useRef(null);
  const onCompleteRef = useRef(onComplete);
  const onWordChangeRef = useRef(onWordChange);
  const insets = useSafeAreaInsets();

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  useEffect(() => { onWordChangeRef.current = onWordChange; }, [onWordChange]);

  const clearTimers = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
  };

  useEffect(() => {
    if (paused) {
      clearTimers();
      return undefined;
    }

    const wordList = texts?.length > 0 ? texts : text ? [text] : [];
    if (wordList.length === 0) return;

    let currentWordIndex = 0;
    let cancelled = false;

    fadeAnim.setValue(1);
    setDisplayedText('');

    const typeWord = (word, wordIndex) => {
      if (cancelled) return;
      let index = 0;
      setDisplayedText('');

      // Notify parent which word is now active
      if (onWordChangeRef.current) onWordChangeRef.current(wordIndex);

      intervalRef.current = setInterval(() => {
        if (cancelled) { clearInterval(intervalRef.current); return; }
        index += 1;
        if (index <= word.length) {
          setDisplayedText(word.substring(0, index));
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        } else {
          clearInterval(intervalRef.current);
          timeoutRef.current = setTimeout(() => {
            if (cancelled) return;
            eraseWord(word);
          }, pauseBeforeErase);
        }
      }, speed);
    };

    const eraseWord = (word) => {
      if (cancelled) return;
      let eraseIndex = word.length;

      intervalRef.current = setInterval(() => {
        if (cancelled) { clearInterval(intervalRef.current); return; }
        eraseIndex -= 1;
        if (eraseIndex >= 0) {
          setDisplayedText(word.substring(0, eraseIndex));
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
        } else {
          clearInterval(intervalRef.current);
          currentWordIndex += 1;
          const hasMore = loop ? true : currentWordIndex < wordList.length;

          if (hasMore) {
            const nextIndex = loop
              ? currentWordIndex % wordList.length
              : currentWordIndex;

            timeoutRef.current = setTimeout(() => {
              if (cancelled) return;
              typeWord(wordList[nextIndex], nextIndex);
            }, pauseBeforeNext);
          } else {
            if (onCompleteRef.current) onCompleteRef.current();
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: fadeOutDuration,
              useNativeDriver: true,
            }).start();
          }
        }
      }, eraseSpeed);
    };

    typeWord(wordList[0], 0);

    return () => {
      cancelled = true;
      clearTimers();
    };
  }, [texts, text, paused]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          paddingTop: Math.max(insets.top, 20),
          opacity: fadeAnim,
        },
      ]}
    >
      <View style={styles.textRow}>
        <Text style={[styles.text, { color: textColor }]}>
          {displayedText}
        </Text>
        {/* Dot always rendered, never conditionally mounted */}
        <Text style={[styles.dot, { color: dotColor }]}>●</Text>
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
    flexWrap: 'wrap',
    maxWidth: '100%',
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
