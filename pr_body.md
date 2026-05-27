## What changed
- Deleted `AuthScreen` entirely.
- Refactored `App.jsx` to use `OnboardingScreen` as the single entry point for all unauthenticated users.
- Added a `dev-login` flow that bypasses password requirements for fast testing, falling back to `SignupWizardScreen` if the email is unregistered.
- Updated Spring Security configuration to whitelist the new `/api/v1/auth/dev-login` endpoint.
- Mocked Apple/Google login flows to instantly log dev users into the homescreen.

## Why
closes #121

## How to test
- Run the backend with `mvn spring-boot:run`.
- Run the Expo app with `npx expo start`.
- Enter a registered email in the Onboarding screen and tap Log In to instantly enter the app without a password.
- Entering an unregistered email will route you to the Signup flow.
- Tapping Apple/Google will mock login and take you to the homescreen.

## Checklist
- [x] My branch follows the naming convention: `type/scope/description`
- [x] My PR title follows the convention: `type(scope): description`
- [x] I have linked an issue above (closes #N)
- [x] I have tested my changes locally
- [x] I have not introduced new lint errors
