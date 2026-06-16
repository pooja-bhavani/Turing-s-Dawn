import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Puzzle } from '../game/types';
import { CaesarPuzzle } from './puzzles/CaesarPuzzle';
import { BinaryPuzzle } from './puzzles/BinaryPuzzle';
import { LogicPuzzle } from './puzzles/LogicPuzzle';
import { PatternPuzzle } from './puzzles/PatternPuzzle';
import { TuringPuzzle } from './puzzles/TuringPuzzle';
import { DawnKeyPuzzle } from './puzzles/DawnKeyPuzzle';
import { GenericPuzzle } from './puzzles/GenericPuzzle';
import { HintButton } from './HintButton';

interface Props {
  puzzle: Puzzle;
  index: number;
  total: number;
  fragments: string[];
  onSolved: () => void;
  onWrong: () => void;
  onHintUsed: () => void;
}

export function ChamberShell({
  puzzle,
  index,
  total,
  fragments,
  onSolved,
  onWrong,
  onHintUsed,
}: Props) {
  const [attempt, setAttempt] = useState('');

  // Each chamber type gets its own bespoke instrument; GenericPuzzle is the
  // safety net for any type that doesn't (yet) have one.
  function renderPuzzle() {
    switch (puzzle.type) {
      case 'caesar':
        return (
          <CaesarPuzzle
            puzzle={puzzle}
            onSolved={onSolved}
            onWrong={onWrong}
            onAttemptChange={setAttempt}
          />
        );
      case 'binary':
        return (
          <BinaryPuzzle
            puzzle={puzzle}
            onSolved={onSolved}
            onWrong={onWrong}
            onAttemptChange={setAttempt}
          />
        );
      case 'logic':
        return (
          <LogicPuzzle
            puzzle={puzzle}
            onSolved={onSolved}
            onWrong={onWrong}
            onAttemptChange={setAttempt}
          />
        );
      case 'pattern':
        return (
          <PatternPuzzle
            puzzle={puzzle}
            onSolved={onSolved}
            onWrong={onWrong}
            onAttemptChange={setAttempt}
          />
        );
      case 'turing':
        return (
          <TuringPuzzle
            puzzle={puzzle}
            onSolved={onSolved}
            onWrong={onWrong}
            onAttemptChange={setAttempt}
          />
        );
      case 'dawnkey':
        return (
          <DawnKeyPuzzle
            puzzle={puzzle}
            fragments={fragments}
            onSolved={onSolved}
            onWrong={onWrong}
            onAttemptChange={setAttempt}
          />
        );
      default:
        return (
          <GenericPuzzle
            puzzle={puzzle}
            fragments={fragments}
            onSolved={onSolved}
            onWrong={onWrong}
            onAttemptChange={setAttempt}
          />
        );
    }
  }

  return (
    <motion.section
      key={puzzle.id}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl rounded-3xl border border-amber-200/15 bg-black/30 p-7 backdrop-blur-md sm:p-10"
    >
      <p className="mb-1 font-mono text-xs tracking-widest text-amber-200/60 uppercase">
        Chamber {index + 1} / {total}
      </p>
      <h2 className="mb-4 font-serif text-2xl font-bold text-amber-100 sm:text-3xl">
        {puzzle.title}
      </h2>
      <p className="mx-auto mb-8 max-w-prose text-center text-amber-100/80">{puzzle.prompt}</p>

      {/* One-time onboarding on the very first chamber */}
      {index === 0 && (
        <p className="mx-auto mb-6 max-w-prose rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-2.5 text-center text-sm text-amber-100/70">
          ☀️ Daylight drains while you think. Solve the chamber to win it back — and stuck on
          anything? Tap <span className="text-amber-200">Need a hint?</span> below.
        </p>
      )}

      {renderPuzzle()}

      <div className="mt-6 flex justify-center">
        <HintButton puzzle={puzzle} attempt={attempt} onHintUsed={onHintUsed} />
      </div>
    </motion.section>
  );
}
