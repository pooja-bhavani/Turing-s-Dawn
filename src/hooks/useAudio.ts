import { useCallback, useEffect, useRef, useState } from 'react';

// ── Synthesized audio (zero asset files) ───────────────────────────
// Everything is generated with the Web Audio API: a warm ambient drone, a
// rising solve chime, and a heartbeat that quickens as the light fails. The
// context is created lazily on a user gesture (the Begin button), every call
// is wrapped so a missing/blocked AudioContext can never break the game, and
// the mute preference persists.

const MUTE_KEY = 'turings-dawn:muted';

export function useAudio() {
  const [muted, setMuted] = useState(() => localStorage.getItem(MUTE_KEY) === '1');
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const ambientRef = useRef<(() => void) | null>(null);
  const heartRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const targetGain = muted ? 0 : 0.5;

  const ensure = useCallback((): AudioContext | null => {
    if (ctxRef.current) return ctxRef.current;
    try {
      const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!Ctx) return null;
      const ctx = new Ctx();
      const master = ctx.createGain();
      master.gain.value = muted ? 0 : 0.5;
      master.connect(ctx.destination);
      ctxRef.current = ctx;
      masterRef.current = master;
    } catch {
      /* audio unavailable — game continues silently */
    }
    return ctxRef.current;
  }, [muted]);

  /** Start the ambient drone. Safe to call repeatedly. */
  const startAmbient = useCallback(() => {
    const ctx = ensure();
    if (!ctx || !masterRef.current || ambientRef.current) return;
    try {
      ctx.resume?.();
      const gain = ctx.createGain();
      gain.gain.value = 0.06;
      const lp = ctx.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.value = 480;
      const oscs = [110, 110.4, 165].map((f) => {
        const o = ctx.createOscillator();
        o.type = 'sine';
        o.frequency.value = f;
        o.connect(gain);
        o.start();
        return o;
      });
      gain.connect(lp);
      lp.connect(masterRef.current);
      ambientRef.current = () => {
        oscs.forEach((o) => {
          try {
            o.stop();
          } catch {
            /* already stopped */
          }
        });
        try {
          gain.disconnect();
        } catch {
          /* noop */
        }
      };
    } catch {
      /* noop */
    }
  }, [ensure]);

  const stopAmbient = useCallback(() => {
    ambientRef.current?.();
    ambientRef.current = null;
  }, []);

  /** A short, bright rising arpeggio when a chamber is solved. */
  const playSolve = useCallback(() => {
    const ctx = ensure();
    if (!ctx || !masterRef.current) return;
    try {
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'triangle';
        o.frequency.value = f;
        const t = now + i * 0.08;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.18, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.5);
        o.connect(g);
        g.connect(masterRef.current!);
        o.start(t);
        o.stop(t + 0.55);
      });
    } catch {
      /* noop */
    }
  }, [ensure]);

  /** One low heartbeat thump (lub-dub). */
  const thump = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !masterRef.current) return;
    try {
      const now = ctx.currentTime;
      [0, 0.16].forEach((offset, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = i === 0 ? 64 : 52;
        const t = now + offset;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(i === 0 ? 0.5 : 0.32, t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
        o.connect(g);
        g.connect(masterRef.current!);
        o.start(t);
        o.stop(t + 0.26);
      });
    } catch {
      /* noop */
    }
  }, []);

  /** Turn the failing-light heartbeat on/off. */
  const setLowLight = useCallback(
    (low: boolean) => {
      if (low && !heartRef.current) {
        thump();
        heartRef.current = setInterval(thump, 1100);
      } else if (!low && heartRef.current) {
        clearInterval(heartRef.current);
        heartRef.current = null;
      }
    },
    [thump],
  );

  const toggleMute = useCallback(() => {
    setMuted((m) => {
      const next = !m;
      localStorage.setItem(MUTE_KEY, next ? '1' : '0');
      return next;
    });
  }, []);

  // Apply mute to the live master gain.
  useEffect(() => {
    if (masterRef.current && ctxRef.current) {
      masterRef.current.gain.setTargetAtTime(targetGain, ctxRef.current.currentTime, 0.05);
    }
  }, [targetGain]);

  // Tear down on unmount.
  useEffect(
    () => () => {
      stopAmbient();
      if (heartRef.current) clearInterval(heartRef.current);
    },
    [stopAmbient],
  );

  return { muted, toggleMute, startAmbient, stopAmbient, playSolve, setLowLight };
}
