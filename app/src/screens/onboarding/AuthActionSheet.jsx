import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Image,
  Keyboard,
  Modal,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const { height: WINDOW_HEIGHT } = Dimensions.get('window');
const SHEET_MAX_HEIGHT = WINDOW_HEIGHT * 0.90;
const SHEET_MIN_HEIGHT = WINDOW_HEIGHT * 0.56;
const SNAP_COLLAPSED = SHEET_MAX_HEIGHT - SHEET_MIN_HEIGHT;
const SHEET_TOP_OFFSET = 48;

const COUNTRIES = [
  { flag: '🇦🇫', name: 'Afghanistan', code: '+93' },
  { flag: '🇦🇽', name: 'Åland Islands', code: '+358' },
  { flag: '🇦🇱', name: 'Albania', code: '+355' },
  { flag: '🇩🇿', name: 'Algeria', code: '+213' },
  { flag: '🇦🇸', name: 'American Samoa', code: '+1' },
  { flag: '🇦🇩', name: 'Andorra', code: '+376' },
  { flag: '🇦🇴', name: 'Angola', code: '+244' },
  { flag: '🇦🇮', name: 'Anguilla', code: '+1' },
  { flag: '🇦🇺', name: 'Australia', code: '+61' },
  { flag: '🇧🇷', name: 'Brazil', code: '+55' },
  { flag: '🇨🇦', name: 'Canada', code: '+1' },
  { flag: '🇨🇳', name: 'China', code: '+86' },
  { flag: '🇫🇷', name: 'France', code: '+33' },
  { flag: '🇩🇪', name: 'Germany', code: '+49' },
  { flag: '🇮🇳', name: 'India', code: '+91' },
  { flag: '🇮🇹', name: 'Italy', code: '+39' },
  { flag: '🇯🇵', name: 'Japan', code: '+81' },
  { flag: '🇲🇽', name: 'Mexico', code: '+52' },
  { flag: '🇷🇺', name: 'Russia', code: '+7' },
  { flag: '🇰🇷', name: 'South Korea', code: '+82' },
  { flag: '🇪🇸', name: 'Spain', code: '+34' },
  { flag: '🇬🇧', name: 'United Kingdom', code: '+44' },
  { flag: '🇺🇸', name: 'United States', code: '+1' },
];

const AuthActionSheet = ({
  visible,
  mode,
  onClose,
  onApplePress,
  onGooglePress,
  onEmailPress,
  onPhonePress,
}) => {
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [inputFocused, setInputFocused] = useState(false);
  const [authMethod, setAuthMethod] = useState('email');
  const [countryPickerOpen, setCountryPickerOpen] = useState(false);
  const countryPickerOpenRef = useRef(false);
  const [countryQuery, setCountryQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState({ name: 'India', code: '+91' });
  const emailInputRef = useRef(null);
  const phoneInputRef = useRef(null);
  const searchInputRef = useRef(null);
  const emailLabelAnim = useRef(new Animated.Value(0)).current;
  const countrySheetTranslateY = useRef(new Animated.Value(WINDOW_HEIGHT)).current;
  const authSheetTranslateY = useRef(new Animated.Value(0)).current;
  const lastTranslateY = useRef(SNAP_COLLAPSED);
  const keyboardVisibleRef = useRef(false);
  const closeAfterKeyboardHideRef = useRef(false);
  const closeTimeoutRef = useRef(null);

  const authSheetPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gestureState) => {
        if (countryPickerOpenRef.current) return false;
        return gestureState.dy > 10 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx);
      },
      onPanResponderGrant: () => {
        authSheetTranslateY.setOffset(0);
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          authSheetTranslateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 1.0) {
          Keyboard.dismiss();
          Animated.timing(authSheetTranslateY, {
            toValue: WINDOW_HEIGHT,
            duration: 250,
            useNativeDriver: true,
          }).start(() => {
            onClose();
          });
        } else {
          Animated.spring(authSheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 14,
          }).start();
        }
      },
    })
  ).current;

  const countrySheetPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponderCapture: (_, gestureState) => (
        Math.abs(gestureState.dy) > 5 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx)
      ),
      onPanResponderGrant: () => {
        countrySheetTranslateY.setOffset(lastTranslateY.current);
        countrySheetTranslateY.setValue(0);
      },
      onPanResponderMove: (_, gestureState) => {
        const newVal = gestureState.dy;
        if (lastTranslateY.current + newVal < 0) {
          countrySheetTranslateY.setValue(-lastTranslateY.current);
        } else {
          countrySheetTranslateY.setValue(newVal);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        countrySheetTranslateY.flattenOffset();
        const finalY = lastTranslateY.current + gestureState.dy;

        if (finalY > SNAP_COLLAPSED + 60 || gestureState.vy > 1.0) {
          closeCountryPicker();
          return;
        }

        if (finalY < SNAP_COLLAPSED - 40 || gestureState.vy < -0.5) {
          lastTranslateY.current = 0;
          Animated.spring(countrySheetTranslateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 120,
            friction: 16,
          }).start();
          return;
        }

        lastTranslateY.current = SNAP_COLLAPSED;
        Animated.spring(countrySheetTranslateY, {
          toValue: SNAP_COLLAPSED,
          useNativeDriver: true,
          tension: 120,
          friction: 16,
        }).start();
      },
    })
  ).current;

  const actionLabel = mode === 'login' ? 'Login' : 'Continue';
  const emailLabelFloated = inputFocused || email.length > 0;
  const filteredCountries = COUNTRIES.filter((country) => {
    const query = countryQuery.trim().toLowerCase();
    if (!query) return true;
    return (
      country.name.toLowerCase().includes(query) ||
      country.code.includes(query)
    );
  });

  const openCountryPicker = () => {
    dismissEmailInput();
    setCountryPickerOpen(true);
    countryPickerOpenRef.current = true;
    countrySheetTranslateY.setValue(WINDOW_HEIGHT);
    Animated.spring(countrySheetTranslateY, {
      toValue: SNAP_COLLAPSED,
      useNativeDriver: true,
      tension: 100,
      friction: 14,
    }).start(() => {
      lastTranslateY.current = SNAP_COLLAPSED;
    });
  };

  const closeCountryPicker = () => {
    Keyboard.dismiss();
    Animated.timing(countrySheetTranslateY, {
      toValue: WINDOW_HEIGHT,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setCountryPickerOpen(false);
      countryPickerOpenRef.current = false;
      lastTranslateY.current = SNAP_COLLAPSED;
    });
  };

  const expandSheet = () => {
    lastTranslateY.current = 0;
    Animated.spring(countrySheetTranslateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 120,
      friction: 16,
    }).start();
  };

  useEffect(() => {
    Animated.timing(emailLabelAnim, {
      toValue: emailLabelFloated ? 1 : 0,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }, [emailLabelAnim, emailLabelFloated]);

  useEffect(() => {
    const showSubscription = Keyboard.addListener('keyboardDidShow', () => {
      keyboardVisibleRef.current = true;
    });
    const hideSubscription = Keyboard.addListener('keyboardDidHide', () => {
      keyboardVisibleRef.current = false;
      emailInputRef.current?.blur();
      setInputFocused(false);

      if (closeAfterKeyboardHideRef.current) {
        closeAfterKeyboardHideRef.current = false;
        if (closeTimeoutRef.current) {
          clearTimeout(closeTimeoutRef.current);
          closeTimeoutRef.current = null;
        }
        onClose();
      }
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (visible) {
      authSheetTranslateY.setValue(0);
    } else {
      closeAfterKeyboardHideRef.current = false;
      emailInputRef.current?.blur();
      phoneInputRef.current?.blur();
      Keyboard.dismiss();
      setInputFocused(false);
      setAuthMethod('email');
      setCountryPickerOpen(false);
      countryPickerOpenRef.current = false;
      setCountryQuery('');
    }
  }, [visible]);

  const handleEmailPress = () => {
    dismissEmailInput();
    if (authMethod === 'phone') {
      onPhonePress({ country: selectedCountry, phoneNumber: phoneNumber.trim() });
    } else {
      onEmailPress(email.trim());
    }
  };

  const handleClose = () => {
    dismissEmailInput();
    setCountryPickerOpen(false);
    countryPickerOpenRef.current = false;

    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (keyboardVisibleRef.current) {
      closeAfterKeyboardHideRef.current = true;
      closeTimeoutRef.current = setTimeout(() => {
        closeAfterKeyboardHideRef.current = false;
        closeTimeoutRef.current = null;
        onClose();
      }, 700);
      return;
    }

    onClose();
  };

  const dismissEmailInput = () => {
    emailInputRef.current?.blur();
    phoneInputRef.current?.blur();
    searchInputRef.current?.blur();
    Keyboard.dismiss();
    setInputFocused(false);
  };

  const handleUsePhone = () => {
    dismissEmailInput();
    setAuthMethod('phone');
  };

  const handleUseEmail = () => {
    dismissEmailInput();
    setAuthMethod('email');
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry({ name: country.name, code: country.code });
    closeCountryPicker();
    setCountryQuery('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.scrim} onPress={handleClose} />
        <AnimatedPressable
          style={[styles.sheet, { transform: [{ translateY: authSheetTranslateY }] }]}
          onPress={dismissEmailInput}
          {...authSheetPanResponder.panHandlers}
        >
          <Pressable
            onPress={handleClose}
            accessibilityRole="button"
            accessibilityLabel="Close login or sign up sheet"
            style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}
          >
            <Ionicons name="close" size={28} color="#F5F5F7" />
          </Pressable>

          <Text style={styles.logoEmoji}>✨</Text>
          <Text style={styles.title}>Log in or sign up</Text>
          <Text style={styles.subtitle}>
            You'll get smarter responses and can upload files, images and more.
          </Text>

          {authMethod === 'phone' ? (
            <>
              <Pressable
                style={[styles.phoneCountryField, countryPickerOpen && styles.emailFieldFocused]}
                onPress={openCountryPicker}
              >
                <Text style={styles.phoneFieldLabel}>Country/Region</Text>
                <Text style={styles.phoneCountryText}>
                  {selectedCountry.name} ({selectedCountry.code})
                </Text>
              </Pressable>

              <TextInput
                ref={phoneInputRef}
                value={phoneNumber}
                onChangeText={setPhoneNumber}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Phone number"
                placeholderTextColor="#9A9AA0"
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                style={[styles.phoneNumberInput, inputFocused && styles.emailFieldFocused]}
              />
            </>
          ) : (
            <Pressable
              style={[styles.emailField, inputFocused && styles.emailFieldFocused]}
              onPress={() => emailInputRef.current?.focus()}
            >
              <Animated.Text
                pointerEvents="none"
                style={[
                  styles.emailLabel,
                  {
                    top: emailLabelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [16, 7],
                    }),
                    fontSize: emailLabelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [17, 14],
                    }),
                    lineHeight: emailLabelAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [21, 17],
                    }),
                  },
                ]}
              >
                Email
              </Animated.Text>
              <TextInput
                ref={emailInputRef}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.emailInput}
              />
            </Pressable>
          )}

          <Pressable
            onPress={handleEmailPress}
            accessibilityRole="button"
            accessibilityLabel={`${actionLabel} with email`}
            style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}
          >
            <Text style={styles.primaryButtonText}>{actionLabel}</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <SheetButton
            label="Continue with Google"
            onPress={() => {
              dismissEmailInput();
              onGooglePress();
            }}
            icon={
              <Image
                source={require('../../../assets/google-logo.jpg-removebg-preview.png')}
                style={styles.googleLogo}
                resizeMode="contain"
              />
            }
          />
          <SheetButton
            label="Continue with Apple"
            onPress={() => {
              dismissEmailInput();
              onApplePress();
            }}
            buttonStyle={styles.appleButton}
            textStyle={styles.appleButtonText}
            icon={<Ionicons name="logo-apple" size={22} color="#FFFFFF" style={styles.buttonIcon} />}
          />
          <SheetButton
            label={authMethod === 'phone' ? 'Continue with email' : 'Continue with phone'}
            onPress={authMethod === 'phone' ? handleUseEmail : handleUsePhone}
            icon={
              authMethod === 'phone'
                ? <Ionicons name="mail-outline" size={22} color="#FFFFFF" style={styles.buttonIcon} />
                : <Ionicons name="call-outline" size={22} color="#FFFFFF" style={styles.buttonIcon} />
            }
          />

          {countryPickerOpen ? (
            <View style={styles.countryOverlay} pointerEvents="box-none">
              <Pressable
                style={styles.countryDim}
                onPress={closeCountryPicker}
              />
              <Animated.View
                style={[
                  styles.countrySheet,
                  { transform: [{ translateY: countrySheetTranslateY }] },
                ]}
              >
                <BlurView
                  intensity={75}
                  tint="dark"
                  style={StyleSheet.absoluteFillObject}
                />
                <View style={styles.countryDragArea} {...countrySheetPanResponder.panHandlers}>
                  <View style={styles.grabber} />
                </View>
                <View style={styles.countryHeader}>
                  <Pressable
                    style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
                    onPress={closeCountryPicker}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <View style={styles.titleContainer}>
                    <Text style={styles.countryTitle}>Country/Region</Text>
                  </View>
                </View>

                <View style={styles.searchField}>
                  <Ionicons name="search" size={20} color="#8E8E93" />
                  <TextInput
                    ref={searchInputRef}
                    value={countryQuery}
                    onChangeText={setCountryQuery}
                    onFocus={expandSheet}
                    placeholder="Search countries"
                    placeholderTextColor="#8E8E93"
                    autoCorrect={false}
                    style={styles.searchInput}
                  />
                </View>

                <ScrollView
                  style={styles.countryList}
                  contentContainerStyle={styles.countryListContent}
                  keyboardShouldPersistTaps="handled"
                >
                  {filteredCountries.map((country, index) => (
                    <Pressable
                      key={`${country.name}-${country.code}`}
                      style={({ pressed }) => [styles.countryRow, pressed && styles.pressed]}
                      onPress={() => handleCountrySelect(country)}
                    >
                      <Text style={styles.countryFlag}>{country.flag}</Text>
                      <View style={[styles.countryTextContainer, index !== filteredCountries.length - 1 && styles.countryBorderBottom]}>
                        <Text style={styles.countryRowText}>
                          {country.name} ({country.code})
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </ScrollView>
              </Animated.View>
            </View>
          ) : null}
        </AnimatedPressable>
      </View>
    </Modal>
  );
};

function SheetButton({ label, onPress, icon, buttonStyle, textStyle }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.providerButton, buttonStyle, pressed && styles.pressed]}
    >
      {icon}
      <Text style={[styles.providerButtonText, textStyle]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.58)',
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    position: 'absolute',
    top: SHEET_TOP_OFFSET,
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: 430,
    alignSelf: 'center',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    backgroundColor: '#1D1D1F',
    paddingHorizontal: 25,
    paddingTop: 80,
    paddingBottom: 24,
  },
  closeButton: {
    position: 'absolute',
    top: 18,
    right: 17,
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C2C2E',
    borderWidth: 1,
    borderColor: '#44444A',
  },
  logoEmoji: {
    alignSelf: 'center',
    fontSize: 41,
    lineHeight: 48,
  },
  title: {
    marginTop: 17,
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '400',
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 13,
    color: '#C7C7CC',
    fontSize: 17,
    lineHeight: 25,
    textAlign: 'center',
  },
  emailField: {
    height: 55,
    marginTop: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#56565D',
    paddingHorizontal: 16,
  },
  emailFieldFocused: {
    borderColor: '#F5F5F7',
    borderWidth: 2,
  },
  emailLabel: {
    position: 'absolute',
    left: 16,
    color: '#9A9AA0',
  },
  emailInput: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 7,
    height: 24,
    margin: 0,
    padding: 0,
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 21,
  },
  phoneCountryField: {
    height: 55,
    marginTop: 42,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#56565D',
    paddingHorizontal: 16,
    paddingTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
  },
  phoneFieldLabel: {
    color: '#9A9AA0',
    fontSize: 14,
    lineHeight: 17,
  },
  phoneCountryText: {
    marginTop: 1,
    color: '#FFFFFF',
    fontSize: 17,
    lineHeight: 22,
  },
  phoneNumberInput: {
    height: 55,
    marginTop: 12,
    borderRadius: 21,
    borderWidth: 1.5,
    borderColor: '#56565D',
    paddingHorizontal: 16,
    color: '#FFFFFF',
    fontSize: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.015)',
  },
  primaryButton: {
    height: 52,
    marginTop: 22,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '700',
  },
  dividerRow: {
    marginTop: 34,
    marginBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#2B2B2F',
  },
  dividerText: {
    color: '#F4F4F6',
    fontSize: 15,
    fontWeight: '500',
  },
  providerButton: {
    height: 47,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: '#56565D',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginBottom: 12,
  },
  providerButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#56565D',
  },
  appleButtonText: {
    color: '#FFFFFF',
  },
  googleLogo: {
    width: 28,
    height: 28,
    marginRight: 12,
  },
  buttonIcon: {
    marginRight: 12,
  },
  countryOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    overflow: 'hidden',
  },
  countryDim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.38)',
  },
  countrySheet: {
    height: SHEET_MAX_HEIGHT,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.16)',
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingTop: 10,
    overflow: 'hidden',
    shadowColor: '#FFFFFF',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.12,
    shadowRadius: 28,
  },
  countryDragArea: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
    height: 28,
    justifyContent: 'center',
  },
  grabber: {
    alignSelf: 'center',
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: '#6C6C70',
  },
  countryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    height: 44,
  },
  cancelButton: {
    paddingHorizontal: 14,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    zIndex: 1,
  },
  cancelButtonText: {
    color: '#EBEBF5',
    fontSize: 15,
    fontWeight: '400',
  },
  titleContainer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  countryTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  searchField: {
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: '#FFFFFF',
    fontSize: 16,
    padding: 0,
  },
  countryList: {
    flex: 1,
  },
  countryListContent: {
    paddingBottom: 28,
  },
  countryRow: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
  },
  countryFlag: {
    width: 34,
    fontSize: 18,
  },
  countryTextContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
  },
  countryBorderBottom: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
  },
  countryRowText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  pressed: {
    opacity: 0.7,
  },
});

export default AuthActionSheet;
