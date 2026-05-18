# Requirements Document

## Introduction

This document specifies the requirements for an animated onboarding screen for Sentri, a student companion app for Army Institute of Technology. The onboarding screen features a typewriter animation that cycles through multiple screens automatically, with each screen displaying text and a solid color background that transitions as the animation progresses. A fixed authentication card remains visible at the bottom throughout the animation.

## Glossary

- **Onboarding_Screen**: The initial screen shown to new users before authentication
- **Typewriter_Animation**: Character-by-character text reveal animation
- **Animated_Dot**: A visual indicator (●) that appears before text and moves as text is typed
- **Background**: A solid color that fills the screen background
- **Authentication_Card**: A fixed UI card at the bottom containing authentication options
- **Screen_Transition**: The automatic progression from one onboarding screen to the next
- **Animation_Loop**: The continuous cycle through all onboarding screens

## Requirements

### Requirement 1: Typewriter Animation

**User Story:** As a new user, I want to see text appear character by character, so that the onboarding feels dynamic and engaging.

#### Acceptance Criteria

1. WHEN the Onboarding_Screen loads, THE Typewriter_Animation SHALL display text character by character from left to right
2. THE Typewriter_Animation SHALL reveal each character at a consistent interval
3. WHEN a screen's text animation completes, THE Onboarding_Screen SHALL wait briefly before transitioning to the next screen
4. THE Typewriter_Animation SHALL support special characters including dots (●) and spaces

### Requirement 2: Animated Dot Behavior

**User Story:** As a new user, I want to see a dot that moves with the text, so that the animation feels cohesive and intentional.

#### Acceptance Criteria

1. WHEN the Onboarding_Screen loads, THE Animated_Dot SHALL appear at the starting position before text begins
2. WHILE the Typewriter_Animation is active, THE Animated_Dot SHALL move to the right as each character appears
3. WHEN the text includes the dot character (●), THE Animated_Dot SHALL become part of the displayed text
4. THE Animated_Dot SHALL maintain consistent visual styling throughout the animation

### Requirement 3: Screen Content Sequence

**User Story:** As a new user, I want to see multiple onboarding messages, so that I understand what Sentri offers.

#### Acceptance Criteria

1. THE Onboarding_Screen SHALL display exactly four screens in sequence
2. THE Onboarding_Screen SHALL display "Sentri●" as the first screen text
3. THE Onboarding_Screen SHALL display "Your student companion●" as the second screen text
4. THE Onboarding_Screen SHALL display "Timetables made easy●" as the third screen text
5. THE Onboarding_Screen SHALL display "Let's begin●" as the fourth screen text

### Requirement 4: Background Color Transitions

**User Story:** As a new user, I want to see the background color change smoothly, so that each screen feels distinct and visually appealing.

#### Acceptance Criteria

1. WHEN the first screen loads, THE Background SHALL display a blue color
2. WHEN the first screen animation completes, THE Background SHALL transition to a teal color for the second screen
3. WHEN the second screen animation completes, THE Background SHALL transition to a cream color for the third screen
4. WHEN the third screen animation completes, THE Background SHALL transition to a dark green color for the fourth screen
5. THE Background SHALL transition smoothly between colors without abrupt changes

### Requirement 5: Animation Loop

**User Story:** As a new user, I want the animation to repeat continuously, so that I can watch it multiple times while deciding whether to sign up.

#### Acceptance Criteria

1. WHEN the fourth screen animation completes, THE Onboarding_Screen SHALL return to the first screen
2. THE Animation_Loop SHALL continue indefinitely until the user interacts with the Authentication_Card
3. WHEN returning to the first screen, THE Onboarding_Screen SHALL reset the Typewriter_Animation and Background to their initial states

### Requirement 6: Authentication Card Display

**User Story:** As a new user, I want to see authentication options at all times, so that I can sign up or log in whenever I'm ready.

#### Acceptance Criteria

1. THE Authentication_Card SHALL remain visible at the bottom of the screen throughout the Animation_Loop
2. THE Authentication_Card SHALL display a "Continue with Apple" button with white styling
3. THE Authentication_Card SHALL display a "Continue with Google" button with dark styling and a Google icon
4. THE Authentication_Card SHALL display a "Sign up with email" button with dark styling and an envelope icon
5. THE Authentication_Card SHALL display a "Log in" text link
6. THE Authentication_Card SHALL not move or animate during screen transitions

### Requirement 7: Automatic Screen Progression

**User Story:** As a new user, I want the screens to change automatically, so that I don't have to manually swipe through them.

#### Acceptance Criteria

1. THE Screen_Transition SHALL occur automatically without user interaction
2. THE Onboarding_Screen SHALL not respond to swipe gestures for manual screen navigation
3. WHEN a screen's Typewriter_Animation completes, THE Screen_Transition SHALL begin after a brief pause

### Requirement 8: Cross-Platform Compatibility

**User Story:** As a developer, I want the onboarding screen to work on both iOS and Android, so that all users have a consistent experience.

#### Acceptance Criteria

1. THE Onboarding_Screen SHALL render correctly on iOS devices
2. THE Onboarding_Screen SHALL render correctly on Android devices
3. THE Typewriter_Animation SHALL perform at the same speed on both platforms
4. THE Background SHALL display correctly on both platforms

### Requirement 9: Integration with Existing Authentication

**User Story:** As a developer, I want the onboarding screen to integrate with the existing auth flow, so that users can seamlessly transition to sign up or login.

#### Acceptance Criteria

1. WHEN a user taps "Continue with Apple", THE Onboarding_Screen SHALL trigger the Apple authentication flow
2. WHEN a user taps "Continue with Google", THE Onboarding_Screen SHALL trigger the Google authentication flow
3. WHEN a user taps "Sign up with email", THE Onboarding_Screen SHALL navigate to the existing AuthScreen in signup mode
4. WHEN a user taps "Log in", THE Onboarding_Screen SHALL navigate to the existing AuthScreen in login mode
5. WHEN any authentication option is selected, THE Animation_Loop SHALL stop

### Requirement 10: Design System Consistency

**User Story:** As a developer, I want the onboarding screen to use the existing design tokens, so that it matches the rest of the app's visual style.

#### Acceptance Criteria

1. THE Onboarding_Screen SHALL use color values from the existing theme.colors object
2. THE Authentication_Card SHALL use spacing values from the existing theme.spacing object
3. THE Authentication_Card SHALL use border radius values from the existing theme.radius object
4. THE Authentication_Card SHALL use shadow values from the existing theme.shadow object
5. THE Onboarding_Screen SHALL use typography values from the existing theme.typography object
