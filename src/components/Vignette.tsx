import { CONFIG } from '../config';

interface Props {
  light: number; // 0–100
  active: boolean; // only during live play
}

// ── The dark closing in ────────────────────────────────────────────
// A vignette that deepens as daylight falls and bleeds red once light drops
// past the warning threshold — the visceral half of the "race the dark"
// pressure. Pointer-events-none so it never blocks the puzzles.
export function Vignette({ light, active }: Props) {
  if (!active) return null;

  const t = Math.max(0, Math.min(1, light / 100));
  // Darkness grows as light falls; ramps in over the whole run, hard past warning.
  const darkness = (1 - t) * 0.55;
  const danger = light <= CONFIG.warningThreshold ? (CONFIG.warningThreshold - light) / CONFIG.warningThreshold : 0;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-20">
      {/* General closing dark */}
      <div
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          opacity: darkness,
          background:
            'radial-gradient(ellipse at center, transparent 35%, rgba(2,4,12,0.9) 100%)',
        }}
      />
      {/* Red danger bleed, pulsing, once light is critical */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${danger > 0 ? 'animate-pulse' : ''}`}
        style={{
          opacity: danger * 0.6,
          background:
            'radial-gradient(ellipse at center, transparent 30%, rgba(120,10,10,0.8) 100%)',
        }}
      />
    </div>
  );
}
