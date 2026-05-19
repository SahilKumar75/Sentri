/**
 * Onboarding Screen Constants
 * 
 * Dark mode configuration with 7 screens
 */

/**
 * ONBOARDING_SCREENS
 * 
 * Array of screen configurations for the onboarding animation sequence.
 * Dark mode: Black background with white text
 */
export const ONBOARDING_SCREENS = [
  {
    id: 0,
    text: "Let's Enhance●",
    backgroundColor: '#000000', // Black
    textColor: '#FFFFFF', // White
    dotColor: '#FFFFFF',
  },
  {
    id: 1,
    text: "Let's Evolve●",
    backgroundColor: '#000000', // Black
    textColor: '#FFFFFF', // White
    dotColor: '#FFFFFF',
  },
  {
    id: 2,
    text: 'Step up with AI●',
    backgroundColor: '#000000', // Black
    textColor: '#FFFFFF', // White
    dotColor: '#FFFFFF',
  },
  {
    id: 3,
    text: 'One stop solution for●',
    backgroundColor: '#000000', // Black
    textColor: '#FFFFFF', // White
    dotColor: '#FFFFFF',
  },
  {
    id: 4,
    text: 'Timetable, Fitness,\nHangout, Mindspace●',
    backgroundColor: '#000000', // Black
    textColor: '#FFFFFF', // White
    dotColor: '#FFFFFF',
  },
  {
    id: 5,
    text: 'Your personal Pal●',
    backgroundColor: '#000000', // Black
    textColor: '#FFFFFF', // White
    dotColor: '#FFFFFF',
  },
  {
    id: 6,
    text: 'Sentri●',
    backgroundColor: '#000000', // Black
    textColor: '#FFFFFF', // White
    dotColor: '#FFFFFF',
  },
];

/**
 * ANIMATION_CONFIG
 * 
 * ⚙️ ADJUST THESE VALUES TO CHANGE ANIMATION SPEED:
 */
export const ANIMATION_CONFIG = {
  typewriterSpeed: 80, // Speed of typing effect (lower = faster)
  pauseAfterScreen: 1500, // Pause before next screen
  colorTransitionDuration: 800, // Background color transition speed
  textFadeOutDuration: 400, // Text fade out speed
  dotResetDuration: 300, // Dot return animation speed
};
