import { motion } from 'framer-motion';

interface Props {
  trigger: number; // increments on each solve; remounts to replay the flash
}

// A warm light-burst that washes the screen each time a chamber is solved —
// the reward beat that sells "you pushed the dark back."
export function SolveFlash({ trigger }: Props) {
  if (trigger === 0) return null;
  return (
    <motion.div
      key={trigger}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-30"
      initial={{ opacity: 0.85 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.9, ease: 'easeOut' }}
      style={{
        background:
          'radial-gradient(circle at center, rgba(255,230,176,0.9), rgba(255,200,120,0.35) 45%, transparent 70%)',
      }}
    />
  );
}
