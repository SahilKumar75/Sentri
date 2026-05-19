# Onboarding Screen

The onboarding screen provides an animated introduction to Sentri with a typewriter effect and color transitions.

## How It Works

1. **First Launch**: When a user opens the app for the first time, they see the onboarding animation
2. **Animation Sequence**: The screen cycles through 4 screens with typewriter text and color transitions
3. **Persistent State**: After completing onboarding (by clicking signup/login), the flag is saved to AsyncStorage
4. **Subsequent Launches**: The onboarding is skipped and users go directly to auth/main screen

## Components

- `OnboardingScreen.jsx` - Main container that manages the animation loop
- `TypewriterText.jsx` - Animated text component with typewriter effect
- `ColoredBackground.jsx` - Animated background color transitions
- `AuthenticationCard.jsx` - Fixed bottom card with signup/login options
- `AnimatedDot.jsx` - Animated dot that follows the typewriter cursor
- `constants.js` - Configuration for screens and animation timing

## Testing Onboarding

To see the onboarding screen again after it's been dismissed:

### Method 1: Using Expo Dev Tools Console
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.removeItem('@sentri:hasSeenOnboarding');
```

### Method 2: Clear App Data
- **iOS Simulator**: Reset the simulator or delete the app
- **Android Emulator**: Clear app data in Settings
- **Physical Device**: Uninstall and reinstall the app

### Method 3: Temporary Import (Development Only)
1. Uncomment this line in `App.jsx`:
   ```javascript
   // import './reset-onboarding';
   ```
2. Reload the app
3. Comment it out again

## Customization

Edit `constants.js` to customize:
- Screen text and colors
- Animation speed
- Pause duration between screens
- Number of screens

## State Management

The onboarding state is managed in `App.jsx`:
- `showOnboarding` - Boolean state that determines if onboarding should be shown
- `@sentri:hasSeenOnboarding` - AsyncStorage key that persists the flag
- `checkOnboardingStatus()` - Checks AsyncStorage on app launch
- `handleOnboardingComplete()` - Saves the flag when user proceeds to auth
