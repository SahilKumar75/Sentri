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
 * - id: Unique identifier for the screen (0-6)
 * - text: The text content to display with typewriter animation
 * - backgroundColor: Solid color for the screen background (hex format)
 * - textColor: Color for the typewriter text
 * - dotColor: Color for the animated dot
 * 
 * The screens cycle in order: 0 → 1 → 2 → 3 → 4 → 5 → 6 → 0 (loop)
 */
export const ONBOARDING_SCREENS = [
  {
    id: 0,
    text: 'Sentri●',
    backgroundColor: '#0066FF', // Bright Blue
    textColor: '#FFFFFF', // White
    dotColor: '#FFFFFF',
  },
  {
    id: 1,
    text: 'Your student pal●',
    backgroundColor: '#00695C', // Dark Teal/Green
    textColor: '#FFD700', // Golden Yellow
    dotColor: '#FFD700',
  },
  {
    id: 2,
    text: 'Personal AI assistant●',
    backgroundColor: '#FF9800', // Orange
    textColor: '#FFFFFF', // White
    dotColor: '#FFFFFF',
  },
  {
    id: 3,
    text: 'Timetable, virtual mind\nand hangout with friends●',
    backgroundColor: '#FFF8E1', // Cream/Skin
    textColor: '#0066FF', // Pantone Blue
    dotColor: '#0066FF',
  },
  {
    id: 4,
    text: 'All here●',
    backgroundColor: '#1B5E20', // Dark Green
    textColor: '#FFFFFF', // White
    dotColor: '#FFFFFF',
  },
  {
    id: 5,
    text: "Let's go!●",
    backgroundColor: '#FFFFFF', // White
    textColor: '#000000', // Black
    dotColor: '#000000',
  },
];

/**
 * ANIMATION_CONFIG
 * 
 * Configuration object for animation timing parameters.
 * Adjust these values to control the animation speed and transitions.
 * 
 * - typewriterSpeed: Milliseconds per character for typewriter animation (default: 80ms)
 * - pauseAfterScreen: Milliseconds to pause after animation completes before transitioning (default: 1500ms)
 * - colorTransitionDuration: Milliseconds for smooth color transition between screens (default: 800ms)
 * - textFadeOutDuration: Milliseconds for text fade out animation (default: 400ms)
 */
export const ANIMATION_CONFIG = {
  typewriterSpeed: 80, // Speed of typing effect (lower = faster)
  pauseAfterScreen: 1500, // Pause before next screen (increase for longer pause)
  colorTransitionDuration: 800, // Background color transition speed
  textFadeOutDuration: 400, // Text fade out speed
};
