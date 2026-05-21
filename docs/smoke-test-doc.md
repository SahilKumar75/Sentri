# 🧪 Expo App Smoke-Test Documentation

This document provides a verification guide for contributors to ensure basic app stability before opening a Pull Request (PR). This project uses **JavaScript/JSX** (not TypeScript).

---

## 🚀 Scope
The goal of this checklist is to verify:
1. The app starts without crashing.
2. The web export process functions correctly.
3. Key navigation paths are operational.

---

## 🛠 Pre-Submission Checklist

Please perform these steps locally before submitting your PR:

### 1. Startup Verification
* Run `npx expo start` in your terminal.
* Ensure the Metro Bundler initializes without critical errors or crashes.
* Open the app on an emulator or physical device to confirm it loads the splash screen and landing page.

### 2. Navigation & Key Screens
* **Home Screen**: Verify that all JSX components render correctly without layout breaks.
* **Navigation Flow**: Navigate through the main tabs or stack screens (e.g., Home to Settings) to ensure transitions work.
* **UI Interaction**: Confirm that buttons and inputs are responsive.

### 3. Web Export Test
* Verify the app can be built for the web platform by running:
  ```bash
  npx expo export --platform web
  ```

  ### ✅ Smoke-Test Checklist
- [ ] **Startup**: App loads successfully without crashing.
- [ ] **Web Build**: `npx expo export --platform web` passed.
- [ ] **Navigation**: Verified key screen transitions.
- [ ] **JSX Quality**: Confirmed no TypeScript was used in the changes.

**Environment Tested:**
- OS: [e.g., macOS / Windows]
- Device: [e.g., iPhone 14 / Pixel 7 / Chrome Browser]

**Evidence:**
[Attach Screenshots or Recordings here]