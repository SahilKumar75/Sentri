# How to Change Animation Speed

## 📍 Location
Open this file: **`app/src/screens/onboarding/constants.js`**

## ⚙️ Settings to Adjust

Look for the `ANIMATION_CONFIG` section (around line 60):

```javascript
export const ANIMATION_CONFIG = {
  typewriterSpeed: 80,           // ← Change this
  pauseAfterScreen: 1500,        // ← Change this
  colorTransitionDuration: 800,  // ← Change this
  textFadeOutDuration: 400,      // ← Change this
};
```

## 🎯 What Each Setting Does

### 1. `typewriterSpeed` (Default: 80)
**Controls how fast the text types out**
- Lower number = Faster typing
- Higher number = Slower typing

**Examples:**
```javascript
typewriterSpeed: 50,   // Very fast typing
typewriterSpeed: 80,   // Normal speed (current)
typewriterSpeed: 120,  // Slow typing
```

### 2. `pauseAfterScreen` (Default: 1500)
**Controls how long to wait before moving to next screen**
- Number is in milliseconds (1000 = 1 second)

**Examples:**
```javascript
pauseAfterScreen: 1000,  // Quick transition (1 second)
pauseAfterScreen: 1500,  // Normal (1.5 seconds) - current
pauseAfterScreen: 2500,  // Longer pause (2.5 seconds)
```

### 3. `colorTransitionDuration` (Default: 800)
**Controls how fast the background color changes**
- Smooth fade between colors

**Examples:**
```javascript
colorTransitionDuration: 500,   // Quick color change
colorTransitionDuration: 800,   // Smooth (current)
colorTransitionDuration: 1200,  // Slow, dramatic fade
```

### 4. `textFadeOutDuration` (Default: 400)
**Controls how fast the text fades out**
- Happens before moving to next screen

**Examples:**
```javascript
textFadeOutDuration: 200,  // Quick fade
textFadeOutDuration: 400,  // Normal (current)
textFadeOutDuration: 600,  // Slow fade
```

## 🚀 Quick Presets

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
  typewriterSpeed: 120,
  pauseAfterScreen: 2500,
  colorTransitionDuration: 1200,
  textFadeOutDuration: 600,
};
```

## 📝 Steps to Change

1. Open `app/src/screens/onboarding/constants.js`
2. Find the `ANIMATION_CONFIG` section
3. Change the numbers
4. Save the file
5. The app will reload automatically
6. Watch your new animation!

## 🔄 Testing Your Changes

To see the onboarding again after you've dismissed it:

1. Open `app/App.jsx`
2. Find line ~36: `const DEV_RESET_ONBOARDING = false;`
3. Change to: `const DEV_RESET_ONBOARDING = true;`
4. Save and reload
5. Change back to `false` after testing

## 📱 Current Screens

1. **Sentri** - Blue background, white text
2. **Your student pal** - Dark teal background, golden text
3. **Personal AI assistant** - Cream background, blue text
4. **Timetable, virtual mind and hangout with friends** - White background, black text

Then loops back to screen 1.
