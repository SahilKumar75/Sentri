/**
 * Reset Onboarding Script
 * 
 * This script clears the onboarding flag from AsyncStorage,
 * allowing you to see the onboarding screen again for testing.
 * 
 * Usage:
 * 1. Add this to your App.jsx temporarily:
 *    import './reset-onboarding';
 * 2. Reload the app
 * 3. Remove the import
 * 
 * Or use this in your console/dev tools:
 * AsyncStorage.removeItem('@sentri:hasSeenOnboarding')
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.removeItem('@sentri:hasSeenOnboarding')
  .then(() => console.log('✅ Onboarding flag cleared! Reload the app to see onboarding again.'))
  .catch((error) => console.error('❌ Error clearing onboarding flag:', error));
