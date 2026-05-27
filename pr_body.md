## What changed
- Added `expo-blur` for Liquid Glass effect on the Navigation Bar (`CapsuleTabBar`).
- Fixed 'Maximum update depth exceeded' infinite loop errors in `HangoutScreen.jsx` and `CalorieScreen.jsx` caused by conflicting `useEffect` hooks synchronizing `usePersistedState`.
- Added dev auth bypassing so that 'r' in terminal automatically keeps the user logged in using `dev-mock-token`.

## Why
Addresses liquid glass UI enhancements and fixes critical rendering infinite loops.
closes #122
closes #123

## How to test
- Run the app via `npx expo start` and verify liquid glass nav bar.
- Press `r` in terminal and ensure auth is persisted.
- Open Myspace, Hangout and Calorie screens and verify no infinite loops in Metro logs.

