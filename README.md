# 🌅 Turing's Dawn — Race the dark

<img width="1463" height="884" alt="image" src="https://github.com/user-attachments/assets/328784ee-4cbb-4385-a996-a111815a31b5" />


> Break the ciphers before the longest day's light runs out.

A story-based browser puzzle game for the **DEV June Solstice Game Jam 2026**. You're stranded in the seam between the longest day and the shortest night. Daylight is a draining resource — the only way to hold back the dark is to break the codes left behind by a mind that once did the same.

An ode to **Alan Turing**: every chamber is a codebreaking puzzle (Caesar, binary, logic gates, a Turing-machine tape, and a final Vigenère "Dawn Key"), and the narrative honors the man who broke codes to push back a darkness of his own.

## 🎮 How to play

1. **Daylight drains in real time.** Watch the meter.
2. **Solve a chamber** to restore light and advance.
3. Each chamber gives you a **key fragment**; collect them all to forge the **Dawn Key** and bring back the morning.
4. Run out of light? Soft fail — the chamber waits, rekindle and retry.

## 🧩 Architecture

```
src/
  game/        pure, unit-tested engine — ciphers, verifiers, scoring (no React)
  data/        chambers.json + narrative.json  (chambers = data, not code)
  hooks/       useLightMeter (rAF drain), useGameState (state machine)
  ai/          hintFallback — spoiler-safe tiered hints
  components/  SolsticeBackground, LightMeter, ChamberShell, puzzles/, end screens
```

The engine is **pure TypeScript** with full Vitest coverage — every chamber in `chambers.json` is proven solvable and every verifier proven to reject near-misses. The UI is data-driven: adding a chamber is a JSON entry, not new code.

Each chamber is its own hands-on instrument, not a text box: a **Caesar dial** you rotate to read the glyphs, **binary sunrise lamps** you tap to read each byte, a **logic-gate garden** of switches that light the network live, **sequence tiles** for the pattern, an interactive **Turing machine** ("The Bombe") you step rule-by-rule until it halts, and a **Vigenère "Dawn Key"** that aligns your collected fragments under the cipher.

## 💡 Tiered hint system

The hint system has one entry point (`getHint`) that returns a tiered, **non-spoiler** nudge. Each chamber ships three authored hints that escalate gently — reframe the goal, name the technique, then point at the next concrete step — so a stuck player is never stranded and never simply handed the answer.

<img width="1466" height="800" alt="image" src="https://github.com/user-attachments/assets/90533d29-a59d-445b-a7a1-d7c971a05b99" />


## 🚀 Run locally

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # engine test suite (Vitest)
npm run build      # production build
```

## ♿ Accessibility

Keyboard-playable, `prefers-reduced-motion` aware, ARIA live regions for the light meter / hints / narrative, color never the sole signal, and the timer pauses outside active play so it's never unfair.

<img width="1470" height="884" alt="Screenshot 2026-06-16 at 7 25 00 PM" src="https://github.com/user-attachments/assets/6cecf79f-2cd5-416f-adfb-c19fce9fa9cd" />


## 📜 License

MIT. A small ode to Alan Turing — keep the light.
