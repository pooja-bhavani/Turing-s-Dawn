import { useState } from 'react';
import { motion } from 'framer-motion';
import type { DawnKeyPayload, Puzzle } from '../../game/types';
import { verify } from '../../game/verifiers';

interface Props {
  puzzle: Puzzle;
  fragments: string[];
  onSolved: () => void;
  onWrong: () => void;
  onAttemptChange: (attempt: string) => void;
}

// ── The Dawn Key ───────────────────────────────────────────────────
// Every chamber gave one letter; together they are the Vigenère key. The
// fragments stack under each cipher glyph so the alignment is visible, and
// the player decrypts the final glyph-line to bring back the morning.
export function DawnKeyPuzzle({
  puzzle,
  fragments,
  onSolved,
  onWrong,
  onAttemptChange,
}: Props) {
  const payload = puzzle.payload as DawnKeyPayload;
  const cipher = [...payload.cipherText];
  const key = fragments.join('');
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
    <form onSubmit={submit} className="flex flex-col items-center gap-7">
      <p className="font-mono text-xs tracking-widest text-amber-200/60 uppercase">
        Dawn Key · {key || '—'}
      </p>

      {/* Cipher glyphs with the repeating key aligned beneath */}
      <motion.div
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="flex flex-wrap justify-center gap-2"
      >
        {cipher.map((ch, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <span className="glyph-glow flex h-14 w-12 items-center justify-center rounded-lg border border-amber-200/25 bg-black/30 font-mono text-2xl text-amber-100">
              {ch}
            </span>
            <span className="flex h-8 w-12 items-center justify-center rounded-md border border-amber-300/30 bg-amber-300/10 font-mono text-sm text-amber-200">
              {key ? key[i % key.length] : '·'}
            </span>
          </div>
        ))}
      </motion.div>

      <motion.input
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.45 }}
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="decrypt the dawn…"
        aria-label="Decrypted word"
        className="w-full max-w-md rounded-xl border border-amber-200/25 bg-black/30 px-5 py-3 text-center font-mono text-xl tracking-widest text-amber-100 uppercase outline-none focus:border-amber-300/60 focus:ring-2 focus:ring-amber-300/30"
      />

      <button
        type="submit"
        className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-2.5 font-semibold text-night shadow-lg shadow-amber-500/20 transition hover:brightness-110"
      >
        Turn the key
      </button>
    </form>
  );
}
