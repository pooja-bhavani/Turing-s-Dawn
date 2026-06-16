import { useCallback, useMemo, useState } from 'react';
import type { GameState, Puzzle } from '../game/types';
import chambersData from '../data/chambers.json';

const PUZZLES = chambersData.chambers as Puzzle[];

const initial: GameState = {
  status: 'intro',
  chamberIndex: 0,
  solvedIds: [],
  fragments: [],
  hintsUsed: 0,
  firstTrySolves: 0,
  startedAt: null,
};

// ── Game progression state machine ─────────────────────────────────
// intro → playing → beat → playing → … → dawn (all solved) | dusk (light out)
export function useGameState() {
  const [state, setState] = useState<GameState>(initial);

  const puzzles = PUZZLES;
  const current: Puzzle | null = puzzles[state.chamberIndex] ?? null;
  const isLast = state.chamberIndex >= puzzles.length - 1;

  const start = useCallback(() => {
    setState((s) => ({ ...s, status: 'playing', startedAt: Date.now() }));
  }, []);

  /** Called when the current chamber is verified solved. */
  const solve = useCallback(
    (firstTry: boolean) => {
      setState((s) => {
        const p = puzzles[s.chamberIndex];
        if (!p) return s;
        return {
          ...s,
          status: 'beat',
          solvedIds: [...s.solvedIds, p.id],
          fragments: p.keyFragment ? [...s.fragments, p.keyFragment] : s.fragments,
          firstTrySolves: s.firstTrySolves + (firstTry ? 1 : 0),
        };
      });
    },
    [puzzles],
  );

  /** Advance past the narrative beat to the next chamber (or Dawn). */
  const advance = useCallback(() => {
    setState((s) => {
      const atEnd = s.chamberIndex >= puzzles.length - 1;
      if (atEnd) return { ...s, status: 'dawn' };
      return { ...s, status: 'playing', chamberIndex: s.chamberIndex + 1 };
    });
  }, [puzzles]);

  const registerHint = useCallback(() => {
    setState((s) => ({ ...s, hintsUsed: s.hintsUsed + 1 }));
  }, []);

  /** Light ran out — soft fail. */
  const toDusk = useCallback(() => {
    setState((s) => (s.status === 'playing' ? { ...s, status: 'dusk' } : s));
  }, []);

  /** Retry the current chamber after Dusk. */
  const retry = useCallback(() => {
    setState((s) => ({ ...s, status: 'playing' }));
  }, []);

  const reset = useCallback(() => setState(initial), []);

  const elapsedSeconds = useMemo(
    () => (state.startedAt ? Math.round((Date.now() - state.startedAt) / 1000) : 0),
    [state.startedAt, state.status],
  );

  return {
    state,
    puzzles,
    current,
    isLast,
    elapsedSeconds,
    start,
    solve,
    advance,
    registerHint,
    toDusk,
    retry,
    reset,
  };
}
