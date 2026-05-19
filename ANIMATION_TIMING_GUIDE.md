# Animation Timing Customization Guide

## Quick Reference

All animation timings are controlled in one place:
**`app/src/screens/onboarding/constants.js`**

## Animation Settings

```javascript
export const ANIMATION_CONFIG = {
  typewriterSpeed: 80,           // Typing speed
  pauseAfterScreen: 1500,        // Pause between screens
  colorTransitionDuration: 800,  // Background color fade
  textFadeOutDuration: 400,      // Text fade out
};
```

## Adjustment Guide

### Make Typing Faster
```javascript
typewriterSpeed: 50,  // Very fast
typewriterSpeed: 60,  // Fast
typewriterSpeed: 80,  // Default (recommended)
typewriterSpeed: 100, // Slow
typewriterSpeed: 120, // Very slow
```

### Change Pause Between Screens
```javascript
pauseAfterScreen: 1000,  // Quick (1 second)
pauseAfterScreen: 1500,  // Default (1.5 seconds)
pauseAfterScreen: 2000,  // Longer (2 seconds)
pauseAfterScreen: 3000,  // Much longer (3 seconds)
```

### Adjust Background Color Transition
```javascript
colorTransitionDuration: 500,  // Quick fade
colorTransitionDuration: 800,  // Default (smooth)
colorTransitionDuration: 1200, // Slow fade
```

### Adjust Text Fade Out Speed
```javascript
textFadeOutDuration: 200,  // Quick fade
textFadeOutDuration: 400,  // Default
textFadeOutDuration: 600,  // Slow fade
```

## Recommended Presets

### Fast & Snappy
```javascript
export const ANIMATION_CONFIG = {
  typewriterSpeed: 50,
  pauseAfterScreen: 1000,
  colorTransitionDuration: 500,
  textFadeOutDuration: 300,
};
```

### Smooth & Elegant (Current)
```javascript
export const ANIMATION_CONFIG = {
  typewriterSpeed: 80,
  pauseAfterScreen: 1500,
  colorTransitionDuration: 800,
  textFadeOutDuration: 400,
};
```

### Slow & Dramatic
```javascript
export const ANIMATION_CONFIG = {
  typewriterSpeed: 100,
  pauseAfterScreen: 2500,
  colorTransitionDuration: 1200,
  textFadeOutDuration: 600,
};
```

## Text Position Adjustment

To move text up or down, edit `TypewriterText.jsx`:

```javascript
// In styles.container:
marginTop: -80,  // Higher on screen
marginTop: -60,  // Default (current)
marginTop: -40,  // Lower on screen
marginTop: 0,    // Centered
```

## Screen Content

To change text or colors, edit the `ONBOARDING_SCREENS` array in `constants.js`:

```javascript
{
  id: 0,
  text: 'Your text here●',
  backgroundColor: '#HEX_COLOR',
  textColor: '#HEX_COLOR',
  dotColor: '#HEX_COLOR',
}
```

**Note:** Always end text with `●` (bullet point) for proper animation

## Testing Your Changes

1. Edit `constants.js` with your desired values
2. Save the file
3. The app will reload automatically (if using Expo)
4. Watch the onboarding animation with new timings

**Tip:** Set `DEV_RESET_ONBOARDING = true` in `App.jsx` to see onboarding again after you've dismissed it.
