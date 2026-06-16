import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import narrative from '../data/narrative.json';

interface Props {
  score: number;
  light: number;
  hintsUsed: number;
  firstTrySolves: number;
  total: number;
  onReplay: () => void;
}

export function DawnScreen({
  score,
  light,
  hintsUsed,
  firstTrySolves,
  total,
  onReplay,
}: Props) {
  const [copied, setCopied] = useState(false);

  // A Wordle-style, copy-pasteable result so players spread their run.
  const { card, lightBar } = useMemo(() => {
    const filled = Math.round((Math.max(0, Math.min(100, light)) / 100) * 10);
    const bar = '🟧'.repeat(filled) + '⬛'.repeat(10 - filled);
    const hints = hintsUsed === 0 ? 'no hints' : `${hintsUsed} hint${hintsUsed === 1 ? '' : 's'}`;
    const url = typeof window !== 'undefined' ? window.location.href : '';
    return {
      lightBar: bar,
      card:
        `☀️ Turing's Dawn — Score ${score}\n` +
        `Light ${bar} ${Math.round(light)}%\n` +
        `Chambers ${total}/${total} · first-try ${firstTrySolves}/${total} · ${hints}\n` +
        `Race the dark → ${url}`,
    };
  }, [score, light, hintsUsed, firstTrySolves, total]);

  async function share() {
    try {
      if (navigator.share) {
        await navigator.share({ title: "Turing's Dawn — Race the dark", text: card });
        return;
      }
    } catch {
      /* user dismissed — fall through to copy */
    }
    try {
      await navigator.clipboard?.writeText(card);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — nothing we can do */
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full max-w-xl text-center"
    >
      <h1 className="mb-3 font-serif text-4xl font-black text-amber-100 sm:text-5xl glyph-glow">
        Dawn
      </h1>
      <p className="mx-auto mb-6 max-w-prose text-amber-100/85">{narrative.beats.at(-1)?.line}</p>

      <div className="mx-auto mb-5 grid max-w-sm grid-cols-3 gap-3 text-center">
        {[
          ['Score', String(score)],
          ['Light', `${Math.round(light)}%`],
          ['Hints', String(hintsUsed)],
        ].map(([label, val]) => (
          <div key={label} className="rounded-xl border border-amber-200/15 bg-black/20 py-3">
            <div className="font-mono text-2xl text-amber-200">{val}</div>
            <div className="text-xs tracking-widest text-amber-100/50 uppercase">{label}</div>
          </div>
        ))}
      </div>

      {/* Shareable result card */}
      <div className="mx-auto mb-6 max-w-sm rounded-2xl border border-amber-200/15 bg-black/30 px-5 py-4 text-left">
        <p className="mb-1 font-mono text-xs tracking-widest text-amber-200/60 uppercase">
          ☀️ Turing's Dawn · Score {score}
        </p>
        <p className="text-lg leading-relaxed tracking-wide" aria-hidden>
          {lightBar} <span className="font-mono text-sm text-amber-100/70">{Math.round(light)}%</span>
        </p>
        <p className="font-mono text-xs text-amber-100/55">
          {total}/{total} chambers · first-try {firstTrySolves}/{total} ·{' '}
          {hintsUsed === 0 ? 'no hints' : `${hintsUsed} hint${hintsUsed === 1 ? '' : 's'}`}
        </p>
      </div>

      <p className="mx-auto mb-8 max-w-prose text-sm leading-relaxed text-amber-100/60 italic">
        {narrative.epilogue}
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <button
          onClick={share}
          className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-7 py-2.5 font-semibold text-night transition hover:brightness-110"
        >
          {copied ? 'Copied ✓' : 'Share your result'}
        </button>
        <button
          onClick={onReplay}
          className="rounded-full border border-amber-300/40 px-7 py-2.5 text-amber-100 transition hover:bg-amber-300/10"
        >
          Play again
        </button>
      </div>
    </motion.div>
  );
}
