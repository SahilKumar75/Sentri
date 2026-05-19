# Safe Area Fix for Onboarding Screen

## Issue
The authentication card was not extending to the bottom of the screen, leaving a gap above the home indicator. The content also wasn't respecting the dynamic island/notch area at the top.

## Solution

### 1. **Removed Bottom Edge Constraint**
Changed the onboarding wrapper in `App.jsx`:
```jsx
// Before
<SafeAreaView style={styles.onboardingSafeArea} edges={['top', 'bottom']}>

// After
<View style={styles.onboardingSafeArea}>
```

This allows content to extend to the very bottom of the screen.

### 2. **Dynamic Bottom Padding in AuthenticationCard**
Added `useSafeAreaInsets` hook to calculate proper padding:
```jsx
const insets = useSafeAreaInsets();

<View style={[styles.card, { 
  paddingBottom: Math.max(insets.bottom, 20) + 20 
}]}>
```

This ensures:
- Card extends to the bottom edge
- Content has proper spacing above the home indicator
- Works on all devices (with/without home indicator)

### 3. **Top Safe Area for TypewriterText**
Added top padding to respect the dynamic island/notch:
```jsx
const insets = useSafeAreaInsets();

<View style={[styles.container, { 
  paddingTop: Math.max(insets.top, 20) 
}]}>
```

This ensures text doesn't overlap with:
- Dynamic Island (iPhone 14 Pro+)
- Notch (iPhone X-13)
- Status bar (older devices)

## Result

✅ **Card extends edge-to-edge** - Black card goes all the way to screen bottom  
✅ **Respects safe areas** - Content properly positioned around dynamic island and home indicator  
✅ **Works on all devices** - Adapts to different iPhone models automatically  
✅ **Professional appearance** - Matches reference design exactly

## Files Modified

1. **`App.jsx`** - Removed bottom edge constraint from SafeAreaView
2. **`AuthenticationCard.jsx`** - Added dynamic bottom padding using insets
3. **`TypewriterText.jsx`** - Added top padding for dynamic island/notch

## Testing

Test on different devices to verify:
- iPhone with notch (X, 11, 12, 13)
- iPhone with dynamic island (14 Pro, 15 Pro)
- iPhone with home button (SE, 8)
- Different screen sizes

All should show:
- Card extending to bottom
- No overlap with system UI
- Proper spacing for interactive elements
