import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { BinaryPayload, Puzzle } from '../../game/types';
import { verify } from '../../game/verifiers';

interface Props {
  puzzle: Puzzle;
  onSolved: () => void;
  onWrong: () => void;
  onAttemptChange: (attempt: string) => void;
}

// ── The Binary Sunrise ─────────────────────────────────────────────
// The horizon blinks in lit / unlit lamps, grouped into bytes. Tap a byte
// to read the ASCII value it's sending, then type the word the sun spells.
export function BinaryPuzzle({ puzzle, onSolved, onWrong, onAttemptChange }: Props) {
  const payload = puzzle.payload as BinaryPayload;
  const bytes = useMemo(() => payload.bits.trim().split(/\s+/).filter(Boolean), [payload.bits]);
  const [value, setValue] = useState('');
  const [revealed, setRevealed] = useState<Set<number>>(new Set());
  const [shake, setShake] = useState(false);

  function toggleByte(idx: number) {
    setRevealed((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });
  }

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
    <form onSubmit={submit} className="flex flex-col items-center gap-6">
      <div className="flex flex-wrap justify-center gap-4">
        {bytes.map((byte, bi) => {
          const dec = parseInt(byte, 2);
          const open = revealed.has(bi);
          return (
            <button
              type="button"
              key={bi}
              onClick={() => toggleByte(bi)}
              aria-label={`Byte ${bi + 1}${open ? `, ASCII ${dec}, '${String.fromCharCode(dec)}'` : ', tap to read'}`}
              className="flex flex-col items-center gap-1.5 rounded-lg p-1.5 transition hover:bg-amber-300/5"
            >
              <div className="flex gap-1">
                {[...byte].map((bit, idx) => (
                  <span
                    key={idx}
                    className={`h-5 w-5 rounded-full border transition-colors ${
                      bit === '1'
                        ? 'glyph-glow border-amber-300/60 bg-amber-300'
                        : 'border-amber-200/20 bg-black/40'
                    }`}
                  />
                ))}
              </div>
              <span className="font-mono text-[0.65rem] text-amber-100/40">{byte}</span>
              <span className="font-mono text-xs text-amber-200">
                {open ? `${dec} · ${String.fromCharCode(dec)}` : 'tap'}
              </span>
            </button>
          );
        })}
      </div>

      <motion.input
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.45 }}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="the word the sun spells…"
        aria-label="Decoded word"
        className="w-full max-w-md rounded-xl border border-amber-200/25 bg-black/30 px-5 py-3 text-center font-mono text-xl tracking-widest text-amber-100 uppercase outline-none focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/30"
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
