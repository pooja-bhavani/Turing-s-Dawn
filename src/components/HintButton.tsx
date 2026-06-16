import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Puzzle } from '../game/types';
import { getHint, type HintResult } from '../ai/hintFallback';

interface Props {
  puzzle: Puzzle;
  attempt: string;
  onHintUsed: () => void;
}

// Tiered hints: each click reveals a deeper nudge (never the answer).
export function HintButton({ puzzle, attempt, onHintUsed }: Props) {
  const [tier, setTier] = useState(0);
  const [result, setResult] = useState<HintResult | null>(null);
  const [loading, setLoading] = useState(false);

  const maxTier = puzzle.hints?.length ?? 0;
  const atMax = tier >= maxTier;

  async function reveal() {
    if (atMax) return;
    const next = tier + 1;
    setLoading(true);
    const r = await getHint({ puzzle, tier: next, attempt });
    setResult(r);
    setTier(next);
    setLoading(false);
    onHintUsed();
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={reveal}
        disabled={atMax || loading}
        className="rounded-full border border-amber-300/30 bg-amber-300/5 px-4 py-1.5 text-sm text-amber-100 transition hover:bg-amber-300/15 disabled:opacity-40"
      >
        {atMax ? '✨ No more hints' : tier === 0 ? '💡 Need a hint?' : '💡 Go deeper'}
      </button>

      <AnimatePresence>
        {result && (
          <motion.p
            key={tier}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            aria-live="polite"
            className="mt-3 max-w-prose text-sm leading-relaxed text-amber-100/85"
          >
            <span className="mr-1 opacity-60">
              💡 Hint {tier}/{maxTier}:
            </span>
            {result.hint}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
