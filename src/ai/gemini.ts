// ── Google Gemini hint client ──────────────────────────────────────
// A thin, dependency-free wrapper over the Gemini REST API. It powers
// *adaptive* hints: Gemini reads the player's actual attempt and the
// authored nudge for the current tier, then writes a fresh, encouraging
// coach line — escalating with the tier, never stating the answer.
//
// Privacy / spoiler-safety: the canonical `solution` is NEVER sent to
// Gemini (see types.ts). The authored hint acts as the *ceiling of
// specificity*, and the system instruction forbids revealing the answer.
//
// No key configured (or any failure) → callers fall back to the authored
// hints, so the game is fully playable offline and for anyone who clones
// without a key.

import type { Puzzle } from '../game/types';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const MODEL =
  (import.meta.env.VITE_GEMINI_MODEL as string | undefined) ?? 'gemini-2.5-flash';
const ENDPOINT = (model: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

/** True when a Gemini API key is present, so the UI can advertise live AI hints. */
export function isGeminiConfigured(): boolean {
  return typeof API_KEY === 'string' && API_KEY.length > 0;
}

const TIER_INTENT: Record<number, string> = {
  1: 'Reframe the goal in fresh words. Do NOT name a technique yet.',
  2: 'Name the codebreaking technique or concept that unlocks it, but not the steps.',
  3: 'Point at the single next concrete step. Still never state the final answer.',
};

const SYSTEM_INSTRUCTION = `You are the in-game hint guide for "Turing's Dawn", a solstice
codebreaking puzzle game that is an ode to Alan Turing. The player is racing a draining
daylight meter, so they are under time pressure and want a quick, warm nudge — not a lecture.

Hard rules:
- NEVER reveal or spell out the final answer, the decoded word, or the exact solution.
- Stay at or below the specificity of the "reference nudge" you are given for this tier.
- Match the requested tier: tier 1 reframes the goal, tier 2 names the technique, tier 3
  points at the next concrete step.
- If the player's attempt is given, acknowledge it briefly and steer from where they are.
- 1–2 sentences, max ~40 words. Warm, lightly atmospheric (dawn/light imagery is welcome),
  second person. No preamble, no markdown, no quotes — just the hint line.`;

interface GeminiHintArgs {
  puzzle: Puzzle;
  tier: number;
  attempt?: string;
  referenceHint: string; // the authored hint for this tier (the specificity ceiling)
  signal?: AbortSignal;
}

/**
 * Ask Gemini for an adaptive, spoiler-safe hint. Returns the hint text, or
 * `null` if no key is configured or the call fails (caller falls back).
 */
export async function generateGeminiHint(args: GeminiHintArgs): Promise<string | null> {
  if (!isGeminiConfigured()) return null;

  const { puzzle, tier, attempt, referenceHint, signal } = args;
  const intent = TIER_INTENT[tier] ?? TIER_INTENT[3];

  const userPrompt = [
    `Puzzle type: ${puzzle.type}`,
    `Chamber: ${puzzle.title}`,
    `Prompt shown to player: ${puzzle.prompt}`,
    `Hint tier: ${tier} — ${intent}`,
    `Reference nudge (do not exceed its specificity): ${referenceHint}`,
    attempt && attempt.trim()
      ? `Player's current attempt: "${attempt.trim()}" (do not confirm or deny if it is correct; just steer)`
      : `Player has not entered an attempt yet.`,
    `Write the hint now.`,
  ].join('\n');

  try {
    const res = await fetch(`${ENDPOINT(MODEL)}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal,
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: 'user', parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0.8,
          maxOutputTokens: 120,
          topP: 0.95,
        },
        // Keep the coach friendly even when puzzles mention "attacks", "kill", etc.
        safetySettings: [
          'HARM_CATEGORY_HARASSMENT',
          'HARM_CATEGORY_HATE_SPEECH',
          'HARM_CATEGORY_SEXUALLY_EXPLICIT',
          'HARM_CATEGORY_DANGEROUS_CONTENT',
        ].map((category) => ({ category, threshold: 'BLOCK_NONE' })),
      }),
    });

    if (!res.ok) return null;
    const data = await res.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.map((p: { text?: string }) => p.text).join('') ??
      undefined;
    const cleaned = text?.trim().replace(/^["']|["']$/g, '');
    return cleaned && cleaned.length > 0 ? cleaned : null;
  } catch {
    // Network error, abort, quota, malformed response — fall back silently.
    return null;
  }
}
