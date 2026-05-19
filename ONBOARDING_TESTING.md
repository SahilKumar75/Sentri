# How to Test Onboarding Screen

The onboarding screen shows only on the first app launch. Here's how to see it again for testing:

## Method 1: Use the DEV Flag (Recommended)

1. Open `app/App.jsx`
2. Find this line near the top:
   ```javascript
   const DEV_RESET_ONBOARDING = false;
   ```
3. Change it to:
   ```javascript
   const DEV_RESET_ONBOARDING = true;
   ```
4. Save the file (the app will reload automatically)
5. You'll see the onboarding screen again!
6. **Important**: Change it back to `false` after testing

## Method 2: Delete and Reinstall

### iOS Simulator:
```bash
# Delete the app from simulator, then run:
cd app
npm start
# Press 'i' to open in iOS simulator
```

### Android Emulator:
```bash
# Delete the app from emulator, then run:
cd app
npm start
# Press 'a' to open in Android emulator
```

### Physical Device:
- Uninstall the Expo Go app
- Reinstall Expo Go from App Store/Play Store
- Scan the QR code again

## Method 3: Clear App Data (Physical Device)

### iOS:
1. Long press the Expo Go app
2. Remove App
3. Reinstall from App Store

### Android:
1. Settings → Apps → Expo Go
2. Storage → Clear Data
3. Reopen Expo Go and scan QR code

## What You Should See

When onboarding works correctly:

1. **First screen**: Blue background with "Sentri●" typing out
2. **Second screen**: Teal background with "Your student companion●"
3. **Third screen**: Cream background with "Timetables made easy●"
4. **Fourth screen**: Green background with "Let's begin●"
5. Then it loops back to the first screen
6. At the bottom, there's a fixed card with signup/login buttons
7. Clicking any button stops the animation and proceeds to auth

## Troubleshooting

**Problem**: Onboarding doesn't show even after reset
- Make sure you set `DEV_RESET_ONBOARDING = true`
- Check the console for the message: "🔄 Onboarding reset!"
- Make sure you're not logged in (logout first if needed)

**Problem**: Onboarding starts from wrong screen
- This is now fixed - it should always start from screen 0 ("Sentri●")

**Problem**: Animation doesn't play
- Check for errors in the console
- Make sure all onboarding files are present in `app/src/screens/onboarding/`

**Problem**: App shows blank screen
- Check if `authInitializing` is stuck on `true`
- Look for errors in the console
