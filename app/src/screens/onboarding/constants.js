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
    backgroundColor: '#0433FF', // Blue
    textColor: '#FFFFFF', // White
    dotColor: '#FFFFFF',
  },
  {
    id: 1,
    text: 'Your student pal●',
    backgroundColor: '#015554', // Dark Teal/Green
    textColor: '#FEC987', // Golden/Peach
    dotColor: '#FEC987',
  },
  {
    id: 2,
    text: 'Personal AI assistant●',
    backgroundColor: '#FFF1D6', // Light Cream/Skin
    textColor: '#0433FF', // Blue
    dotColor: '#0433FF',
  },
  {
    id: 3,
    text: 'Timetable, virtual mind\nand hangout with friends●',
    backgroundColor: '#FFFFFF', // White
    textColor: '#000000', // Black
    dotColor: '#000000',
  },
];

/**
 * ANIMATION_CONFIG
 * 
 * Configuration object for animation timing parameters.
 * 
 * ⚙️ ADJUST THESE VALUES TO CHANGE ANIMATION SPEED:
 * 
 * - typewriterSpeed: Milliseconds per character for typewriter animation (default: 80ms)
 *   Lower value = faster typing. Try 50-120 for different speeds.
 * 
 * - pauseAfterScreen: Milliseconds to pause after animation completes before transitioning (default: 1500ms)
 *   Increase for longer pause between screens. Try 1000-3000.
 * 
 * - colorTransitionDuration: Milliseconds for smooth color transition between screens (default: 800ms)
 *   Controls how fast the background color changes. Try 500-1200.
 * 
 * - textFadeOutDuration: Milliseconds for text fade out animation (default: 400ms)
 *   Controls how fast text disappears before next screen. Try 200-600.
 */
export const ANIMATION_CONFIG = {
  typewriterSpeed: 80, // Speed of typing effect (lower = faster)
  pauseAfterScreen: 1500, // Pause before next screen (increase for longer pause)
  colorTransitionDuration: 800, // Background color transition speed
  textFadeOutDuration: 400, // Text fade out speed
};
