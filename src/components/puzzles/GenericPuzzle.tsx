import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Puzzle } from '../../game/types';
import { verify } from '../../game/verifiers';

interface Props {
  puzzle: Puzzle;
  fragments: string[];
  onSolved: () => void;
  onWrong: () => void;
  onAttemptChange: (attempt: string) => void;
}

// Generic text-answer chamber. The pure verifier handles binary / logic /
// pattern / turing / dawnkey, so this one component plays them all until
// each gets its own bespoke UI.
export function GenericPuzzle({ puzzle, fragments, onSolved, onWrong, onAttemptChange }: Props) {
  const [value, setValue] = useState('');
  const [shake, setShake] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    onAttemptChange(value);
    if (verify(puzzle, value, fragments)) {
      onSolved();
    } else {
      setShake(true);
      onWrong();
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <form onSubmit={submit} className="flex flex-col items-center gap-6">
      {puzzle.type === 'dawnkey' && fragments.length > 0 && (
        <div className="flex gap-2" aria-label="Collected key fragments">
          {fragments.map((f, i) => (
            <span
              key={i}
              className="glyph-glow flex h-12 w-10 items-center justify-center rounded-lg border border-amber-300/40 bg-amber-300/10 font-mono text-xl text-amber-100"
            >
              {f}
            </span>
          ))}
        </div>
      )}

      <motion.input
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.45 }}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="your answer…"
        aria-label="Your answer"
        className="w-full max-w-md rounded-xl border border-amber-200/25 bg-black/30 px-5 py-3 text-center font-mono text-xl text-amber-100 outline-none focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/30"
      />

      <button
        type="submit"
        className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-2.5 font-semibold text-night shadow-lg shadow-amber-500/20 transition hover:brightness-110"
      >
        Submit
      </button>
    </form>
  );
}
