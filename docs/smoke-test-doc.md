# 🧪 Expo App Smoke-Test Documentation

This document provides a verification guide for contributors to ensure basic app stability before opening a Pull Request (PR). This project uses **JavaScript/JSX** (not TypeScript).

---

## 🚀 Scope
The goal of this checklist is to verify:
1. The app starts without crashing.
2. The web export process functions correctly[cite: 1].
3. Key navigation paths are operational[cite: 1].

---

## 🛠 Pre-Submission Checklist

Please perform these steps locally before submitting your PR:

### 1. Startup Verification[cite: 1]
* Run `npx expo start` in your terminal[cite: 1].
* Ensure the Metro Bundler initializes without critical errors or crashes[cite: 1].
* Open the app on an emulator or physical device to confirm it loads the splash screen and landing page[cite: 1].

### 2. Navigation & Key Screens[cite: 1]
* **Home Screen**: Verify that all JSX components render correctly without layout breaks[cite: 1].
* **Navigation Flow**: Navigate through the main tabs or stack screens (e.g., Home to Settings) to ensure transitions work[cite: 1].
* **UI Interaction**: Confirm that buttons and inputs are responsive[cite: 1].

### 3. Web Export Test[cite: 1]
* Verify the app can be built for the web platform by running[cite: 1]:
  ```bash
  npx expo export --platform web

  ### ✅ Smoke-Test Checklist
- [ ] **Startup**: App loads successfully without crashing[cite: 1].
- [ ] **Web Build**: `npx expo export --platform web` passed[cite: 1].
- [ ] **Navigation**: Verified key screen transitions[cite: 1].
- [ ] **JSX Quality**: Confirmed no TypeScript was used in the changes[cite: 1].

**Environment Tested:**
- OS: [e.g., macOS / Windows]
- Device: [e.g., iPhone 14 / Pixel 7 / Chrome Browser]

**Evidence:**
[Attach Screenshots or Recordings here]