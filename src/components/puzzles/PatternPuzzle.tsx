import { useState } from 'react';
import { motion } from 'framer-motion';
import type { PatternPayload, Puzzle } from '../../game/types';
import { verify } from '../../game/verifiers';

interface Props {
  puzzle: Puzzle;
  onSolved: () => void;
  onWrong: () => void;
  onAttemptChange: (attempt: string) => void;
}

// ── Pattern of Days ────────────────────────────────────────────────
// The solstice calendar laid out as tiles; the last tile is yours to fill.
export function PatternPuzzle({ puzzle, onSolved, onWrong, onAttemptChange }: Props) {
  const payload = puzzle.payload as PatternPayload;
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onAttemptChange(value);
    if (verify(puzzle, value)) {
      onSolved();
    } else {
      setShake(true);
      onWrong();
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-center gap-7">
      <motion.div
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="flex flex-wrap items-center justify-center gap-3"
      >
        {payload.sequence.map((n, idx) => {
          const isBlank = n === '?';
          return (
            <div key={idx} className="flex items-center gap-3">
              {isBlank ? (
                <input
                  autoFocus
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  inputMode="numeric"
                  placeholder="?"
                  aria-label="Next number in the sequence"
                  className="glyph-glow h-16 w-16 rounded-xl border border-amber-300/60 bg-amber-300/10 text-center font-mono text-2xl text-amber-100 outline-none focus:ring-2 focus:ring-amber-300/40"
                />
              ) : (
                <span className="flex h-16 w-16 items-center justify-center rounded-xl border border-amber-200/20 bg-black/30 font-mono text-2xl text-amber-100/80">
                  {n}
                </span>
              )}
              {idx < payload.sequence.length - 1 && (
                <span className="text-amber-100/30" aria-hidden>
                  →
                </span>
              )}
            </div>
          );
        })}
      </motion.div>

      <button
        type="submit"
        className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-2.5 font-semibold text-night shadow-lg shadow-amber-500/20 transition hover:brightness-110"
      >
        Name the next day
      </button>
    </form>
  );
}
