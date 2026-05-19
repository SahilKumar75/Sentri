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
 * - textColor: Color for the typewriter text
 * - dotColor: Color for the animated dot
 * 
 * The screens cycle in order: 0 → 1 → 2 → 3 → 0 (loop)
 */
export const ONBOARDING_SCREENS = [
  {
    id: 0,
    text: 'Sentri●',
    backgroundColor: '#0066FF', // Bright Blue
    textColor: '#FFFFFF',
    dotColor: '#FFFFFF',
  },
  {
    id: 1,
    text: 'ChatGPT●',
    backgroundColor: '#00695C', // Dark Teal/Green
    textColor: '#FFD700', // Gold
    dotColor: '#FFD700',
  },
  {
    id: 2,
    text: "Let's brainstorm●",
    backgroundColor: '#FFF8E1', // Cream
    textColor: '#0066FF', // Blue
    dotColor: '#0066FF',
  },
  {
    id: 3,
    text: "Let's go●",
    backgroundColor: '#1B5E20', // Dark Green
    textColor: '#E1BEE7', // Light Purple
    dotColor: '#E1BEE7',
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
