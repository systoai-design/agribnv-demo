// Haptic feedback utility for mobile devices
// Uses the Vibration API when available

export const haptics = {
  /**
   * Light haptic feedback - for subtle interactions
   * Use for: toggles, selections, small buttons
   */
  light: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10);
    }
  },

  /**
   * Medium haptic feedback - for standard interactions
   * Use for: navigation, modal open/close, confirmations
   */
  medium: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(20);
    }
  },

  /**
   * Heavy haptic feedback - for important interactions
   * Use for: warnings, significant actions
   */
  heavy: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([30, 10, 30]);
    }
  },

  /**
   * Selection haptic - very subtle for scrolling selections
   * Use for: picker wheels, category selections
   */
  selection: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(5);
    }
  },

  /**
   * Success haptic pattern - celebratory feel
   * Use for: booking confirmed, item added, task completed
   */
  success: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 50, 30]);
    }
  },

  /**
   * Error haptic pattern - attention-grabbing
   * Use for: form errors, failed actions
   */
  error: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([50, 30, 50, 30, 50]);
    }
  },

  /**
   * Heart like haptic - special pattern for favorites
   * Use for: like/wishlist button
   */
  heartLike: () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([5, 30, 15, 30, 25]);
    }
  },
};

export default haptics;
