import { CONFIG } from '../config';

interface Props {
  light: number;
}

export function LightMeter({ light }: Props) {
  const pct = Math.round(light);
  const low = light <= CONFIG.warningThreshold;

  return (
    <div className="w-full" aria-label={`Daylight remaining: ${pct} percent`}>
      <div className="mb-1 flex items-center justify-between text-xs font-medium tracking-widest uppercase text-amber-100/70">
        <span>Daylight</span>
        <span
          role="status"
          aria-live="polite"
          className={low ? 'text-red-300' : 'text-amber-200'}
        >
          {pct}% {low && '· fading'}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/40 ring-1 ring-white/10">
        <div
          className={`h-full rounded-full transition-[width] duration-200 ${low ? 'animate-pulse' : ''}`}
          style={{
            width: `${pct}%`,
            background: low
              ? 'linear-gradient(90deg, #b91c1c, #f97316)'
              : 'linear-gradient(90deg, #ff9e5e, #ffd27a, #ffe6b0)',
          }}
        />
      </div>
    </div>
  );
}
