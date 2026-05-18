/**
 * Onboarding Screen Constants
 * 
 * This file contains the configuration for the animated onboarding screens,
 * including screen content, colors, and animation timing parameters.
 */

/**
 * ONBOARDING_SCREENS
 * 
 * Array of screen configurations for the onboarding animation sequence.
 * Each screen contains:
 * - id: Unique identifier for the screen (0-3)
 * - text: The text content to display with typewriter animation
 * - backgroundColor: Solid color for the screen background (hex format)
 * 
 * The screens cycle in order: 0 → 1 → 2 → 3 → 0 (loop)
 */
export const ONBOARDING_SCREENS = [
  {
    id: 0,
    text: 'Sentri●',
    backgroundColor: '#1A73E8', // Blue
  },
  {
    id: 1,
    text: 'Your student companion●',
    backgroundColor: '#00BFA5', // Teal
  },
  {
    id: 2,
    text: 'Timetables made easy●',
    backgroundColor: '#FFF8E1', // Cream
  },
  {
    id: 3,
    text: "Let's begin●",
    backgroundColor: '#2E7D32', // Dark Green
  },
];

/**
 * ANIMATION_CONFIG
 * 
 * Configuration object for animation timing parameters.
 * 
 * - typewriterSpeed: Milliseconds per character for typewriter animation (80ms)
 * - pauseAfterScreen: Milliseconds to pause after animation completes before transitioning (1500ms)
 * - colorTransitionDuration: Milliseconds for smooth color transition between screens (800ms)
 */
export const ANIMATION_CONFIG = {
  typewriterSpeed: 80,
  pauseAfterScreen: 1500,
  colorTransitionDuration: 800,
};
