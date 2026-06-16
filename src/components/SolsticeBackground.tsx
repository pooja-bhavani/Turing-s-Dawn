import { useMemo } from 'react';

// ── The whole theme in one component ───────────────────────────────
// The gradient warms toward dawn as `light` rises and darkens toward
// night as it falls. Stars grow brighter as the dark deepens.

interface Props {
  light: number; // 0–100
}

function mix(a: number, b: number, t: number) {
  return Math.round(a + (b - a) * t);
}

export function SolsticeBackground({ light }: Props) {
  const t = Math.max(0, Math.min(1, light / 100));

  // Night (#070a1b) → Dawn ember/gold as light climbs.
  const top = `rgb(${mix(7, 28, t)}, ${mix(10, 18, t)}, ${mix(27, 46, t)})`;
  const mid = `rgb(${mix(11, 120, t)}, ${mix(16, 60, t)}, ${mix(38, 70, t)})`;
  const horizon = `rgb(${mix(20, 255, t)}, ${mix(20, 175, t)}, ${mix(45, 110, t)})`;

  const stars = useMemo(
    () =>
      Array.from({ length: 60 }, (_, i) => ({
        left: (i * 53) % 100,
        top: (i * 29) % 70,
        size: (i % 3) + 1,
        delay: (i % 7) * 0.4,
      })),
    [],
  );

  return (
    <div
      aria-hidden
      className="fixed inset-0 -z-10 overflow-hidden transition-[background] duration-700"
      style={{ background: `linear-gradient(to bottom, ${top} 0%, ${mid} 55%, ${horizon} 100%)` }}
    >
      {/* Stars — visible mainly when the light is low */}
      <div className="absolute inset-0" style={{ opacity: 1 - t * 0.85 }}>
        {stars.map((s, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: s.size,
              height: s.size,
              animation: `twinkle ${2 + s.delay}s ease-in-out ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>
      {/* Rising sun glow on the horizon, intensifies with light */}
      <div
        className="absolute -bottom-40 left-1/2 h-96 w-[140%] -translate-x-1/2 rounded-[50%] blur-3xl transition-opacity duration-700"
        style={{
          background: 'radial-gradient(closest-side, rgba(255,210,122,0.85), transparent)',
          opacity: t * 0.8,
        }}
      />
    </div>
  );
}
