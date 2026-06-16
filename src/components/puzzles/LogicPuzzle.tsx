import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import type { LogicPayload, Puzzle } from '../../game/types';
import { evaluateLogic } from '../../game/ciphers';
import { verify } from '../../game/verifiers';

interface Props {
  puzzle: Puzzle;
  onSolved: () => void;
  onWrong: () => void;
  onAttemptChange: (attempt: string) => void;
}

// ── Logic Gate Garden ──────────────────────────────────────────────
// Throw the sun-lamp switches and watch the gate network resolve live. The
// OUT lamp glows when the network matches its target — then lock it in.
export function LogicPuzzle({ puzzle, onSolved, onWrong, onAttemptChange }: Props) {
  const payload = puzzle.payload as LogicPayload;
  const [on, setOn] = useState<Record<string, boolean>>(
    () => Object.fromEntries(payload.inputs.map((n) => [n, false])),
  );
  const [shake, setShake] = useState(false);

  const assignmentStr = useMemo(
    () => payload.inputs.map((n) => `${n}=${on[n] ? 1 : 0}`).join(','),
    [payload.inputs, on],
  );

  // Live evaluation of every wire so we can light the gates and OUT lamp.
  const wires = useMemo(() => {
    const w: Record<string, boolean> = { ...on };
    try {
      for (const g of payload.gates) {
        const ins = g.in.map((name) => w[name] ?? false);
        w[g.out] =
          g.op === 'AND'
            ? ins.every(Boolean)
            : g.op === 'OR'
              ? ins.some(Boolean)
              : g.op === 'NOT'
                ? !ins[0]
                : ins.filter(Boolean).length % 2 === 1; // XOR
      }
    } catch {
      /* partial network — ignore */
    }
    return w;
  }, [on, payload.gates]);

  const out = (() => {
    try {
      return evaluateLogic(payload, on);
    } catch {
      return false;
    }
  })();
  const matches = out === payload.target;

  function toggle(name: string) {
    onAttemptChange(assignmentStr);
    setOn((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  function lockIn() {
    onAttemptChange(assignmentStr);
    if (verify(puzzle, assignmentStr)) {
      onSolved();
    } else {
      setShake(true);
      onWrong();
      setTimeout(() => setShake(false), 500);
    }
  }

  return (
    <motion.div
      animate={shake ? { x: [0, -8, 8, -6, 6, 0] } : {}}
      transition={{ duration: 0.45 }}
      className="flex flex-col items-center gap-7"
    >
      {/* Input switches */}
      <div className="flex flex-wrap justify-center gap-4">
        {payload.inputs.map((name) => (
          <button
            type="button"
            key={name}
            onClick={() => toggle(name)}
            role="switch"
            aria-checked={on[name]}
            aria-label={`Input ${name}`}
            className={`flex w-20 flex-col items-center gap-2 rounded-xl border p-3 transition ${
              on[name]
                ? 'border-amber-300/60 bg-amber-300/10'
                : 'border-amber-200/15 bg-black/30'
            }`}
          >
            <span className="font-mono text-lg text-amber-100">{name}</span>
            <span
              className={`h-8 w-8 rounded-full border transition-colors ${
                on[name] ? 'glyph-glow border-amber-300 bg-amber-300' : 'border-amber-200/25 bg-black/40'
              }`}
            />
            <span className="font-mono text-xs text-amber-200">{on[name] ? '1' : '0'}</span>
          </button>
        ))}
      </div>

      {/* Gate network */}
      <div className="flex flex-col items-center gap-1.5 font-mono text-sm text-amber-100/70">
        {payload.gates.map((g, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-amber-200/80">{g.out}</span>
            <span className="text-amber-100/40">=</span>
            <span>
              {g.op === 'NOT' ? `NOT ${g.in[0]}` : g.in.join(` ${g.op} `)}
            </span>
            <span
              className={`ml-1 inline-block h-2.5 w-2.5 rounded-full ${
                wires[g.out] ? 'bg-amber-300 glyph-glow' : 'bg-black/50 ring-1 ring-amber-200/20'
              }`}
            />
          </div>
        ))}
      </div>

      {/* OUT lamp */}
      <div className="flex flex-col items-center gap-1">
        <motion.div
          animate={{ scale: matches ? [1, 1.15, 1] : 1 }}
          transition={{ duration: 0.4 }}
          className={`flex h-16 w-16 items-center justify-center rounded-full border-2 font-mono text-xs ${
            matches
              ? 'glyph-glow border-emerald-300 bg-emerald-300/20 text-emerald-100'
              : 'border-amber-200/25 bg-black/40 text-amber-100/40'
          }`}
        >
          OUT
        </motion.div>
        <span className="font-mono text-xs text-amber-100/50">
          {out ? 'true' : 'false'} · need {String(payload.target)}
        </span>
      </div>

      <button
        type="button"
        onClick={lockIn}
        className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-2.5 font-semibold text-night shadow-lg shadow-amber-500/20 transition hover:brightness-110"
      >
        Lock in the lamps
      </button>
    </motion.div>
  );
}
