import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Puzzle, TuringPayload, TuringRule } from '../../game/types';
import { traceTuring } from '../../game/ciphers';
import { verify } from '../../game/verifiers';

interface Props {
  puzzle: Puzzle;
  onSolved: () => void;
  onWrong: () => void;
  onAttemptChange: (attempt: string) => void;
}

const cell = (c: string) => (c === '' ? '·' : c);

// ── The Bombe — an interactive Turing machine ──────────────────────
// You don't type an answer; you *become the machine*. Read the cell under
// the head, watch the matching rule light up, and step it forward until it
// halts — then lock in what the tape reads. Lock in early and the tape is
// wrong, so understanding the run is the puzzle. An ode to Turing in code.
export function TuringPuzzle({ puzzle, onSolved, onWrong, onAttemptChange }: Props) {
  const payload = puzzle.payload as TuringPayload;
  const trace = useMemo(() => traceTuring(payload), [payload]);
  const reduce =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const [i, setI] = useState(0); // index into the trace
  const [running, setRunning] = useState(false);
  const [shake, setShake] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const conf = trace[i];
  const halted = conf.halted;
  const reading = conf.head >= 0 && conf.head < conf.tape.length ? conf.tape[conf.head] : '';

  // The rule that will fire on the NEXT step (what the player should obey).
  const nextRule: TuringRule | null = halted
    ? null
    : payload.rules.find((r) => r.state === conf.state && r.read === reading) ?? null;

  const tapeString = conf.tape.join('').replace(/\s+$/, '');

  useEffect(() => {
    onAttemptChange(tapeString);
  }, [tapeString, onAttemptChange]);

  function step() {
    setI((n) => Math.min(n + 1, trace.length - 1));
  }
  function reset() {
    stopRun();
    setI(0);
  }
  function stopRun() {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRunning(false);
  }

  function run() {
    if (halted) return;
    if (reduce) {
      setI(trace.length - 1);
      return;
    }
    setRunning(true);
    timer.current = setInterval(() => {
      setI((n) => {
        if (n >= trace.length - 1) {
          stopRun();
          return n;
        }
        return n + 1;
      });
    }, 650);
  }

  useEffect(() => () => stopRun(), []);
  useEffect(() => {
    if (halted) stopRun();
  }, [halted]);

  function lockIn() {
    if (verify(puzzle, tapeString)) {
      onSolved();
    } else {
      setShake(true);
      onWrong();
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* State + step readout */}
      <div className="flex items-center gap-3 font-mono text-sm">
        <span className="rounded-md border border-amber-300/30 bg-amber-300/5 px-3 py-1 text-amber-100">
          state{' '}
          <span className={halted ? 'text-emerald-300' : 'text-amber-200'}>{conf.state}</span>
        </span>
        <span className="text-amber-100/50">step {conf.step}</span>
      </div>

      {/* Tape */}
      <motion.div
        animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
        transition={{ duration: 0.45 }}
        className="flex flex-col items-center"
      >
        <div className="flex gap-1.5">
          {conf.tape.map((c, idx) => {
            const isHead = idx === conf.head;
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <motion.div
                  className="font-mono text-amber-300"
                  initial={false}
                  animate={{ opacity: isHead ? 1 : 0, y: isHead ? 0 : -4 }}
                  aria-hidden
                >
                  ▼
                </motion.div>
                <motion.span
                  layout
                  className={`flex h-14 w-12 items-center justify-center rounded-lg border font-mono text-2xl transition-colors ${
                    isHead
                      ? 'glyph-glow border-amber-300/70 bg-amber-300/15 text-amber-100'
                      : 'border-amber-200/20 bg-black/30 text-amber-100/70'
                  }`}
                >
                  {cell(c)}
                </motion.span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 font-mono text-xs text-amber-100/50" aria-live="polite">
          {halted ? `halted — the tape reads ${tapeString}` : `head reads ${cell(reading)}`}
        </p>
      </motion.div>

      {/* Rules table */}
      <table className="w-full max-w-sm border-collapse font-mono text-xs">
        <thead>
          <tr className="text-amber-200/50">
            <th className="px-2 py-1 text-left font-medium">state</th>
            <th className="px-2 py-1 text-left font-medium">read</th>
            <th className="px-2 py-1 text-left font-medium">write</th>
            <th className="px-2 py-1 text-left font-medium">move</th>
            <th className="px-2 py-1 text-left font-medium">next</th>
          </tr>
        </thead>
        <tbody>
          {payload.rules.map((r, idx) => {
            const active = nextRule === r;
            return (
              <tr
                key={idx}
                className={`transition-colors ${
                  active ? 'bg-amber-300/15 text-amber-100' : 'text-amber-100/55'
                }`}
              >
                <td className="px-2 py-1">{r.state}</td>
                <td className="px-2 py-1">{cell(r.read)}</td>
                <td className="px-2 py-1">{cell(r.write)}</td>
                <td className="px-2 py-1">{r.move}</td>
                <td className="px-2 py-1">{r.next}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={step}
          disabled={halted || running}
          className="rounded-full border border-amber-300/40 px-5 py-2 text-sm text-amber-100 transition hover:bg-amber-300/10 disabled:opacity-40"
        >
          Step ▶
        </button>
        <button
          type="button"
          onClick={running ? stopRun : run}
          disabled={halted}
          className="rounded-full border border-amber-300/40 px-5 py-2 text-sm text-amber-100 transition hover:bg-amber-300/10 disabled:opacity-40"
        >
          {running ? 'Pause ⏸' : 'Run ⏩'}
        </button>
        <button
          type="button"
          onClick={reset}
          disabled={i === 0}
          className="rounded-full border border-amber-300/20 px-5 py-2 text-sm text-amber-100/70 transition hover:bg-amber-300/10 disabled:opacity-30"
        >
          Reset ↺
        </button>
      </div>

      <AnimatePresence>
        {halted && (
          <motion.button
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            type="button"
            onClick={lockIn}
            className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-2.5 font-semibold text-night shadow-lg shadow-amber-500/20 transition hover:brightness-110"
          >
            Lock in the tape →
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
