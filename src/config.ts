// ── Tunable game constants (single source of truth) ────────────────
export const CONFIG = {
  /** Seconds of *active* play for the light meter to drain 100 → 0. */
  drainSeconds: 110,
  /** Light the player starts each session with. */
  startingLight: 100,
  /** Light restored after a failed chamber on retry (soft fail). */
  retryLight: 45,
  /** Below this %, the meter pulses red as a warning. */
  warningThreshold: 25,
} as const;
