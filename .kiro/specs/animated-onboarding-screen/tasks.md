# Implementation Plan: Animated Onboarding Screen

## Overview

This implementation plan breaks down the animated onboarding screen feature into discrete coding tasks. The feature includes a typewriter animation that cycles through four screens with solid color backgrounds, an animated dot indicator, and a fixed authentication card at the bottom. The implementation uses React Native's built-in Animated API for smooth, performant animations.

## Tasks

- [ ] 1. Create project structure and constants
  - Create `app/src/screens/onboarding/` directory
  - Create `app/src/screens/onboarding/constants.js` with screen configurations and animation timings
  - Define `ONBOARDING_SCREENS` array with 4 screens (text and solid backgroundColor for each)
  - Define `ANIMATION_CONFIG` object with typewriterSpeed (80ms), pauseAfterScreen (1500ms), colorTransitionDuration (800ms)
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4_

- [ ] 2. Implement AnimatedDot component
  - [ ] 2.1 Create AnimatedDot component with position animation
    - Create `app/src/screens/onboarding/AnimatedDot.jsx`
    - Accept `position` (Animated.Value) and `visible` (boolean) props
    - Render "●" character with white color, 48px font size
    - Use absolute positioning with animated `translateX` transform
    - Use `useNativeDriver: true` for transform animation
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [ ]* 2.2 Write unit tests for AnimatedDot
    - Test that dot renders when visible is true
    - Test that dot is hidden when visible is false
    - Test that position prop affects translateX transform
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 3. Implement TypewriterText component
  - [ ] 3.1 Create TypewriterText component with character-by-character animation
    - Create `app/src/screens/onboarding/TypewriterText.jsx`
    - Accept `text`, `onComplete`, and `speed` props
    - Use `useState` for `displayedText` and `currentIndex`
    - Use `Animated.Value` for dot position
    - Implement `setInterval` to reveal characters one by one
    - Calculate dot position based on text width (approximate with character count * 28)
    - Hide AnimatedDot when text includes "●" character
    - Call `onComplete` callback when all characters are displayed
    - Clean up interval on unmount
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3_
  
  - [ ] 3.2 Add timeout fallback for animation completion
    - Implement timeout that forces completion if animation doesn't finish within expected time
    - Calculate timeout as `text.length * speed + 500ms`
    - Log warning to console if timeout is triggered
    - Clean up timeout on unmount
    - _Requirements: 1.1, 1.2_
  
  - [ ]* 3.3 Write unit tests for TypewriterText
    - Test that text is revealed character by character
    - Test that onComplete is called when animation finishes
    - Test that AnimatedDot is hidden when text includes "●"
    - Test timeout fallback triggers if animation stalls
    - Test cleanup on unmount
    - _Requirements: 1.1, 1.2, 1.4, 2.1, 2.2, 2.3_

- [ ] 4. Implement ColoredBackground component
  - [ ] 4.1 Create ColoredBackground component with smooth color transitions
    - Create `app/src/screens/onboarding/ColoredBackground.jsx`
    - Accept `color` and `transitionDuration` props
    - Use `Animated.View` with `StyleSheet.absoluteFill`
    - Animate backgroundColor using `Animated.timing` with easing
    - Use `useNativeDriver: false` (required for backgroundColor animation)
    - Apply smooth easing curve: `Easing.inOut(Easing.ease)`
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_
  
  - [ ]* 4.2 Write unit tests for ColoredBackground
    - Test that background color is applied correctly
    - Test that color transitions occur when color prop changes
    - Test that transitionDuration is respected
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 5. Checkpoint - Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Implement AuthenticationCard component
  - [ ] 6.1 Create AuthenticationCard component structure
    - Create `app/src/screens/onboarding/AuthenticationCard.jsx`
    - Accept `onApplePress`, `onGooglePress`, `onEmailPress`, `onLoginPress` props
    - Use absolute positioning at bottom of screen
    - Apply white background with `theme.shadow.strong`
    - Use `theme.radius.xl` for border radius (adjusted to 28px)
    - Apply horizontal padding of `theme.chrome.horizontalPadding` (20px)
    - Apply internal padding of `theme.spacing.xl` (24px)
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6, 10.2, 10.3, 10.4_
  
  - [ ] 6.2 Add authentication buttons to AuthenticationCard
    - Create "Continue with Apple" button with white background, black text, height 52px
    - Create "Continue with Google" button with dark background (#111111), white text, Google icon, height 52px
    - Create "Sign up with email" button with dark background (#111111), white text, envelope icon, height 52px
    - Create "Log in" text link with `theme.colors.accent` color, centered
    - Use `theme.radius.md` (18px) for button border radius
    - Use `theme.typography.body` (15px) for button text
    - Use font weight 700 for button text
    - Apply 12px gap between buttons (`theme.spacing.sm`)
    - Wire up onPress handlers to respective props
    - _Requirements: 6.2, 6.3, 6.4, 6.5, 10.2, 10.5_
  
  - [ ]* 6.3 Write unit tests for AuthenticationCard
    - Test that all buttons render correctly
    - Test that callbacks are invoked when buttons are pressed
    - Test button styling and layout
    - Test accessibility labels
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] 7. Implement OnboardingScreen container component
  - [ ] 7.1 Create OnboardingScreen component with state management
    - Create `app/src/screens/OnboardingScreen.jsx`
    - Accept `onSignup` and `onLogin` props
    - Use `useState` for `currentScreenIndex` (0-3) and `isAnimating` (boolean)
    - Import `ONBOARDING_SCREENS` and `ANIMATION_CONFIG` from constants
    - Render ColoredBackground with current screen's backgroundColor
    - Render TypewriterText with current screen's text
    - Render AuthenticationCard with callback props
    - _Requirements: 5.1, 5.2, 5.3, 6.1, 7.1, 7.2, 7.3_
  
  - [ ] 7.2 Implement screen progression logic
    - Implement `handleAnimationComplete` function that waits `pauseAfterScreen` ms, then advances to next screen
    - Use modulo operator to loop back to screen 0 after screen 3
    - Reset `isAnimating` state during pause, set to true when starting next screen
    - Pass `handleAnimationComplete` to TypewriterText as `onComplete` callback
    - _Requirements: 1.3, 5.1, 5.2, 5.3, 7.1, 7.2_
  
  - [ ] 7.3 Implement authentication action handlers
    - Implement `handleAuthAction` function that stops animation loop
    - Set `isAnimating` to false when any auth button is pressed
    - Clear any pending timeouts to prevent screen transitions
    - Invoke appropriate callback (onSignup or onLogin) based on button pressed
    - _Requirements: 6.1, 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ] 7.4 Add cleanup on unmount
    - Clear all intervals and timeouts in cleanup function
    - Cancel in-progress animations
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [ ]* 7.5 Write unit tests for OnboardingScreen
    - Test screen progression: 0 → 1 → 2 → 3 → 0
    - Test that animation stops when authentication action is triggered
    - Test that correct callbacks are passed to child components
    - Test cleanup on unmount
    - _Requirements: 5.1, 5.2, 5.3, 7.1, 7.2, 7.3, 9.5_

- [ ] 8. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Integrate OnboardingScreen with App.jsx
  - [ ] 9.1 Add onboarding state management to App.jsx
    - Add `showOnboarding` state (default: true)
    - Add `useEffect` to check AsyncStorage for `@sentri:hasSeenOnboarding` key
    - If key exists and is 'true', set `showOnboarding` to false
    - Create `handleOnboardingComplete` function that sets AsyncStorage key and updates state
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ] 9.2 Update authentication flow in App.jsx
    - Import OnboardingScreen component
    - Modify unauthenticated user flow to check `showOnboarding` state
    - If `showOnboarding` is true, render OnboardingScreen instead of AuthScreen
    - Pass `onSignup` callback that handles email signup (sets authMode to 'signup', calls handleOnboardingComplete)
    - Pass `onLogin` callback that handles login (sets authMode to 'login', calls handleOnboardingComplete)
    - For Apple/Google signup, call handleOnboardingComplete and trigger respective auth flows
    - Ensure AuthScreen is rendered when `showOnboarding` is false
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_
  
  - [ ]* 9.3 Write integration tests for App.jsx onboarding flow
    - Test that OnboardingScreen is shown when user is not authenticated and hasn't seen onboarding
    - Test that AuthScreen is shown after user selects authentication method
    - Test that authenticated users bypass OnboardingScreen
    - Test that returning users (hasSeenOnboarding = true) skip OnboardingScreen
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 10. Add accessibility improvements
  - [ ] 10.1 Add accessibility labels and hints
    - Add `accessibilityLabel` to all buttons in AuthenticationCard
    - Add `accessibilityHint` to describe button actions
    - Add `accessibilityRole="button"` to all pressable elements
    - Add `accessibilityLabel` to OnboardingScreen describing current screen content
    - _Requirements: 6.2, 6.3, 6.4, 6.5_
  
  - [ ] 10.2 Test with screen readers
    - Test VoiceOver (iOS) announces screen content correctly
    - Test TalkBack (Android) announces screen content correctly
    - Verify focus order is logical (top to bottom)
    - _Requirements: 6.2, 6.3, 6.4, 6.5_

- [ ] 11. Final checkpoint and polish
  - [ ] 11.1 Test on physical devices
    - Test animation smoothness on iOS device
    - Test animation smoothness on Android device
    - Verify solid color transitions are smooth and visually appealing
    - Verify typewriter animation speed feels natural
    - Verify animated dot moves in sync with text
    - Verify authentication card remains fixed during animations
    - _Requirements: 1.1, 1.2, 2.2, 4.5, 6.6, 8.1, 8.2, 8.3_
  
  - [ ] 11.2 Performance testing and optimization
    - Monitor frame rate during animation (target: 60fps)
    - Check memory usage during animation loop (should remain stable)
    - Verify no memory leaks after multiple animation cycles
    - Optimize if performance issues are detected
    - _Requirements: 8.1, 8.2, 8.3, 8.4_
  
  - [ ] 11.3 Final integration verification
    - Verify tapping "Continue with Apple" triggers Apple auth flow (if implemented)
    - Verify tapping "Continue with Google" triggers Google auth flow (if implemented)
    - Verify tapping "Sign up with email" navigates to AuthScreen in signup mode
    - Verify tapping "Log in" navigates to AuthScreen in login mode
    - Verify animation loops continuously until user interaction
    - _Requirements: 9.1, 9.2, 9.3, 9.4, 9.5_

- [ ] 12. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- The design uses **solid color backgrounds** (not gradients) that transition smoothly between screens
- `expo-linear-gradient` is already installed but not needed for this implementation
- Apple and Google authentication require additional packages (`expo-apple-authentication`, `@react-native-google-signin/google-signin`) which are not yet installed - these can be added later or handled as separate tasks
- All animations use React Native's built-in Animated API for optimal performance
- Color transitions use `useNativeDriver: false` (required for backgroundColor animation)
- Transform animations use `useNativeDriver: true` for better performance
- Design tokens from `theme` object are used throughout for consistency

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1", "4.1", "6.1"] },
    { "id": 2, "tasks": ["2.2", "3.1", "4.2", "6.2"] },
    { "id": 3, "tasks": ["3.2", "6.3"] },
    { "id": 4, "tasks": ["3.3", "7.1"] },
    { "id": 5, "tasks": ["7.2", "7.3", "7.4"] },
    { "id": 6, "tasks": ["7.5", "9.1"] },
    { "id": 7, "tasks": ["9.2"] },
    { "id": 8, "tasks": ["9.3", "10.1"] },
    { "id": 9, "tasks": ["10.2", "11.1"] },
    { "id": 10, "tasks": ["11.2", "11.3"] }
  ]
}
```
