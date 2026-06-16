import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { CaesarPayload, Puzzle } from '../../game/types';
import { caesarShift } from '../../game/ciphers';
import { verify } from '../../game/verifiers';

interface Props {
  puzzle: Puzzle;
  onSolved: () => void;
  onWrong: () => void;
  onAttemptChange: (attempt: string) => void;
}

// ── The showcase chamber ───────────────────────────────────────────
// Player rotates the dial; the glyph-line transforms live. When the
// reading looks like a word, they lock it in. Teaches the cipher by feel.
export function CaesarPuzzle({ puzzle, onSolved, onWrong, onAttemptChange }: Props) {
  const payload = puzzle.payload as CaesarPayload;
  const [shift, setShift] = useState(0);
  const [shake, setShake] = useState(false);

  // Live preview = cipher rotated backward by the chosen shift.
  const preview = useMemo(
    () => caesarShift(payload.cipherText, -shift),
    [payload.cipherText, shift],
  );

  function submit() {
    onAttemptChange(preview);
    if (verify(puzzle, preview)) {
      onSolved();
    } else {
      setShake(true);
      onWrong();
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Cipher glyphs */}
      <motion.div
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="flex flex-wrap justify-center gap-2"
      >
        {[...preview].map((ch, i) => (
          <span
            key={i}
            className="glyph-glow flex h-14 w-12 items-center justify-center rounded-lg border border-amber-200/25 bg-black/30 font-mono text-2xl text-amber-100"
          >
            {ch}
          </span>
        ))}
      </motion.div>

      {/* Shift dial */}
      <div className="w-full max-w-sm">
        <div className="mb-2 flex items-center justify-between font-mono text-sm text-amber-100/70">
          <span>shift</span>
          <span className="text-amber-200">−{shift}</span>
        </div>
        <input
          type="range"
          min={0}
          max={25}
          value={shift}
          onChange={(e) => setShift(Number(e.target.value))}
          aria-label="Cipher shift amount"
          className="w-full accent-amber-400"
        />
        <p className="mt-2 text-center font-mono text-xs text-amber-100/50">
          original: {payload.cipherText}
        </p>
      </div>

      <button
        type="button"
        onClick={submit}
        className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-2.5 font-semibold text-night shadow-lg shadow-amber-500/20 transition hover:brightness-110"
      >
        Lock in this reading
      </button>
    </div>
  );
}
