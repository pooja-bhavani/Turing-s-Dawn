import { useCallback, useEffect, useRef, useState } from 'react';
import { CONFIG } from '../config';

// ── Real-time light meter ──────────────────────────────────────────
// A single requestAnimationFrame loop drains light while `running` is
// true. Drain pauses during modals / solve flashes so timing is never
// unfair. Restoring light (`addLight`) is the reward channel.

export function useLightMeter(running: boolean) {
  const [light, setLight] = useState<number>(CONFIG.startingLight);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number | null>(null);

  useEffect(() => {
    if (!running) {
      lastRef.current = null;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const tick = (now: number) => {
      if (lastRef.current != null) {
        const dt = (now - lastRef.current) / 1000;
        const drainPerSec = 100 / CONFIG.drainSeconds;
        setLight((l) => Math.max(0, l - dt * drainPerSec));
      }
      lastRef.current = now;
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [running]);

  const addLight = useCallback((amount: number) => {
    setLight((l) => Math.min(100, l + amount));
  }, []);

  const setTo = useCallback((value: number) => {
    setLight(Math.max(0, Math.min(100, value)));
  }, []);

  return { light, addLight, setTo };
}
