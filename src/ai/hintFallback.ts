// ── Tiered hint system (Gemini-powered, authored fallback) ─────────
// One entry point (`getHint`) keeps the UI decoupled from where a hint
// comes from. When a Google Gemini key is configured, hints are generated
// live and adapt to the player's actual attempt; otherwise we serve the
// three authored, spoiler-safe hints that ship with every chamber.
//
// Either way the contract is the same: a tiered, NON-spoiler nudge that
// reframes the goal, then names the technique, then points at the next
// concrete step — never simply handing over the answer.

import type { Puzzle } from '../game/types';
import { generateGeminiHint, isGeminiConfigured } from './gemini';

export interface HintRequest {
  puzzle: Puzzle;
  tier: number; // 1 = reframe goal, 2 = name technique, 3 = next concrete step
  attempt?: string;
}

export interface HintResult {
  source: 'gemini' | 'authored';
  hint: string;
}

/** The authored, non-spoiler hint for the requested tier (always available). */
export function authoredHint(req: HintRequest): HintResult {
  const tiers = req.puzzle.hints ?? [];
  const idx = Math.min(Math.max(req.tier, 1), tiers.length) - 1;
  return {
    source: 'authored',
    hint: tiers[idx] ?? 'Trust the pattern in front of you — read it slowly.',
  };
}

/**
 * Single entry point the UI calls for a tiered hint.
 * Tries Google Gemini for an adaptive nudge; falls back to the authored
 * hint if no key is configured or the call fails — so the game is always
 * playable, with or without AI.
 */
export async function getHint(req: HintRequest): Promise<HintResult> {
  const fallback = authoredHint(req);

  if (!isGeminiConfigured()) return fallback;

  const aiHint = await generateGeminiHint({
    puzzle: req.puzzle,
    tier: req.tier,
    attempt: req.attempt,
    referenceHint: fallback.hint, // the authored hint caps how specific Gemini may get
  });

  return aiHint ? { source: 'gemini', hint: aiHint } : fallback;
}
