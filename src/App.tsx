import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SolsticeBackground } from './components/SolsticeBackground';
import { Vignette } from './components/Vignette';
import { SolveFlash } from './components/SolveFlash';
import { LightMeter } from './components/LightMeter';
import { ChamberShell } from './components/ChamberShell';
import { NarrativeBeat } from './components/NarrativeBeat';
import { DawnScreen } from './components/DawnScreen';
import { DuskScreen } from './components/DuskScreen';
import { useGameState } from './hooks/useGameState';
import { useLightMeter } from './hooks/useLightMeter';
import { useAudio } from './hooks/useAudio';
import { computeScore } from './game/scoring';
import { CONFIG } from './config';
import narrative from './data/narrative.json';

const BEST_KEY = 'solstice-cipher:best';

export default function App() {
  const g = useGameState();
  const { state, current, puzzles } = g;
  const { light, addLight, setTo } = useLightMeter(state.status === 'playing');
  const audio = useAudio();

  const [cleanChamber, setCleanChamber] = useState(true);
  const [score, setScore] = useState(0);
  const [best, setBest] = useState<number>(() => Number(localStorage.getItem(BEST_KEY) || 0));
  const [flash, setFlash] = useState(0);
  const finalLight = useRef(0);

  // Light ran out → soft fail.
  useEffect(() => {
    if (state.status === 'playing' && light <= 0) g.toDusk();
  }, [light, state.status]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fresh chamber = clean run (for first-try scoring).
  useEffect(() => {
    if (state.status === 'playing') setCleanChamber(true);
  }, [state.chamberIndex, state.status]);

  // Quicken the heartbeat once the light is critical (only during live play).
  const critical = state.status === 'playing' && light <= CONFIG.warningThreshold && light > 0;
  useEffect(() => {
    audio.setLowLight(critical);
  }, [critical, audio]);

  // Ambient drone runs while a session is in progress; stops at the end screens.
  useEffect(() => {
    if (state.status === 'playing' || state.status === 'beat') audio.startAmbient();
    else audio.stopAmbient();
  }, [state.status, audio]);

  function begin() {
    audio.startAmbient(); // first user gesture — unlocks the AudioContext
    g.start();
  }

  function handleSolved() {
    if (!current) return;
    addLight(current.lightReward);
    finalLight.current = Math.min(100, light + current.lightReward);
    setFlash((n) => n + 1);
    audio.playSolve();
    g.solve(cleanChamber);
  }

  function handleAdvance() {
    const wasLast = state.chamberIndex >= puzzles.length - 1;
    g.advance();
    if (wasLast) {
      const s = computeScore({
        lightRemaining: finalLight.current,
        firstTrySolves: state.firstTrySolves,
        hintsUsed: state.hintsUsed,
        elapsedSeconds: g.elapsedSeconds,
      });
      setScore(s);
      if (s > best) {
        setBest(s);
        localStorage.setItem(BEST_KEY, String(s));
      }
    }
  }

  function handleRetry() {
    setTo(CONFIG.retryLight);
    setCleanChamber(false);
    g.retry();
  }

  const beatLine =
    narrative.beats.find((b) => b.afterChamberId === current?.id)?.line ?? '';

  const inSession = state.status === 'playing' || state.status === 'beat';

  return (
    <div className="relative flex min-h-dvh flex-col">
      <SolsticeBackground light={light} />
      <Vignette light={light} active={state.status === 'playing'} />
      <SolveFlash trigger={flash} />

      {/* Sound toggle — always reachable */}
      <button
        onClick={audio.toggleMute}
        aria-pressed={audio.muted}
        aria-label={audio.muted ? 'Unmute sound' : 'Mute sound'}
        className="fixed top-4 right-4 z-40 rounded-full border border-amber-200/20 bg-black/30 px-3 py-1.5 text-sm text-amber-100/80 backdrop-blur-md transition hover:bg-black/50"
      >
        {audio.muted ? '🔇' : '🔊'}
      </button>

      {/* HUD */}
      {inSession && (
        <header className="mx-auto w-full max-w-2xl px-5 pt-5">
          <LightMeter light={light} />
        </header>
      )}

      <main className="flex flex-1 items-center justify-center px-5 py-10">
        <AnimatePresence mode="wait">
          {state.status === 'intro' && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="max-w-xl text-center"
            >
              <p className="mb-3 font-mono text-xs tracking-[0.3em] text-amber-200/60 uppercase">
                June Solstice · An ode to Alan Turing
              </p>
              <h1 className="mb-5 font-serif text-4xl font-black text-amber-100 glyph-glow sm:text-6xl">
                Turing's Dawn
                <span className="block text-2xl font-semibold text-amber-200/80 sm:text-3xl">
                  Race the dark
                </span>
              </h1>
              <p className="mx-auto mb-8 max-w-prose leading-relaxed text-amber-100/80">
                {narrative.intro}
              </p>
              <button
                onClick={begin}
                className="rounded-full bg-gradient-to-r from-amber-400 to-orange-400 px-9 py-3 text-lg font-semibold text-night shadow-lg shadow-amber-500/25 transition hover:brightness-110"
              >
                Hold back the dark →
              </button>
              {best > 0 && (
                <p className="mt-5 font-mono text-xs text-amber-100/50">best score · {best}</p>
              )}
            </motion.div>
          )}

          {state.status === 'playing' && current && (
            <ChamberShell
              key={current.id}
              puzzle={current}
              index={state.chamberIndex}
              total={puzzles.length}
              fragments={state.fragments}
              onSolved={handleSolved}
              onWrong={() => setCleanChamber(false)}
              onHintUsed={g.registerHint}
            />
          )}

          {state.status === 'beat' && (
            <NarrativeBeat
              key={`beat-${current?.id}`}
              line={beatLine}
              lightReward={current?.lightReward ?? 0}
              onContinue={handleAdvance}
            />
          )}

          {state.status === 'dawn' && (
            <DawnScreen
              key="dawn"
              score={score}
              light={finalLight.current}
              hintsUsed={state.hintsUsed}
              firstTrySolves={state.firstTrySolves}
              total={puzzles.length}
              onReplay={g.reset}
            />
          )}

          {state.status === 'dusk' && <DuskScreen key="dusk" onRetry={handleRetry} />}
        </AnimatePresence>
      </main>
    </div>
  );
}
