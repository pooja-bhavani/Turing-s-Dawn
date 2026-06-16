// ── Tiered, spoiler-safe hint system ───────────────────────────────
// Every chamber ships three authored hints that escalate gently — reframe
// the goal, name the technique, then point at the next concrete step —
// without ever handing over the answer. One entry point (`getHint`) keeps
// the UI decoupled from where a hint comes from.

import type { Puzzle } from '../game/types';

export interface HintRequest {
  puzzle: Puzzle;
  tier: number; // 1 = reframe goal, 2 = name technique, 3 = next concrete step
  attempt?: string;
}

export interface HintResult {
  source: 'authored';
  hint: string;
}

/** Returns the authored, non-spoiler hint for the requested tier. */
export function authoredHint(req: HintRequest): HintResult {
  const tiers = req.puzzle.hints ?? [];
  const idx = Math.min(Math.max(req.tier, 1), tiers.length) - 1;
  return {
    source: 'authored',
    hint: tiers[idx] ?? 'Trust the pattern in front of you — read it slowly.',
  };
}

/** Single entry point the UI calls for a tiered hint. */
export async function getHint(req: HintRequest): Promise<HintResult> {
  return authoredHint(req);
}
