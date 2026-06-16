import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface Props {
  line: string;
  onContinue: () => void;
  lightReward: number;
}

// Typewriter-revealed found-text between chambers.
export function NarrativeBeat({ line, onContinue, lightReward }: Props) {
  const [shown, setShown] = useState('');

  useEffect(() => {
    setShown('');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setShown(line);
      return;
    }
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(line.slice(0, i));
      if (i >= line.length) clearInterval(id);
    }, 28);
    return () => clearInterval(id);
  }, [line]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-xl text-center"
    >
      <p className="mb-2 font-mono text-xs tracking-widest text-amber-200/60 uppercase">
        +{lightReward}% daylight restored
      </p>
      <blockquote className="mx-auto mb-8 min-h-[4rem] font-serif text-xl leading-relaxed text-amber-100/90 italic sm:text-2xl">
        “{shown}”
      </blockquote>
      <button
        type="button"
        onClick={onContinue}
        className="rounded-full border border-amber-300/40 px-8 py-2.5 text-amber-100 transition hover:bg-amber-300/10"
      >
        Continue →
      </button>
    </motion.div>
  );
}
