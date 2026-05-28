export const FLAGS = {
  ENABLE_INLINE_ONBOARDING: true,
  /** Guided tours (driver.js) — manual Help button always available */
  ENABLE_GUIDED_TOURS: true,
  /**
   * First visit: show "Start tour / Not now" banner instead of auto-opening the overlay.
   * Reduces Clarity dead clicks while keeping onboarding for new users.
   */
  TOUR_PROMPT_BEFORE_START: true,
};
