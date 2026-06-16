import { motion } from 'framer-motion';

interface Props {
  onRetry: () => void;
}

// Soft fail — the dark closed in, but the chamber waits. No harsh punishment.
export function DuskScreen({ onRetry }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-md text-center"
    >
      <h1 className="mb-3 font-serif text-4xl font-black text-indigo-200">Dusk</h1>
      <p className="mx-auto mb-8 max-w-prose text-indigo-100/70">
        The light slipped below the horizon. But the chamber remembers you — gather yourself and
        try once more.
      </p>
      <button
        onClick={onRetry}
        className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-8 py-2.5 font-semibold text-night transition hover:brightness-110"
      >
        Rekindle the light
      </button>
    </motion.div>
  );
}
