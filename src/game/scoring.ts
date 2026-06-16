// ── Scoring ────────────────────────────────────────────────────────
// Pure function so it's testable and tunable in one place.

export interface ScoreInput {
  lightRemaining: number; // 0–100 at Dawn
  firstTrySolves: number;
  hintsUsed: number;
  elapsedSeconds: number;
}

export function computeScore(s: ScoreInput): number {
  const light = Math.max(0, Math.min(100, s.lightRemaining));
  const mastery = s.firstTrySolves * 15;
  const hintPenalty = Math.min(s.hintsUsed * 5, 40); // capped, never punitive
  // Up to +30 for finishing under ~4 minutes; linearly decays after.
  const timeBonus = Math.max(0, Math.round(30 - s.elapsedSeconds / 8));
  return Math.max(0, Math.round(light + mastery - hintPenalty + timeBonus));
}
