---
title: "Turing's Dawn — race the dark before the longest day runs out"
published: false
tags: gamechallenge, devchallenge, gamedev, react
cover_image:
---

*This is my submission for the [DEV June Solstice Game Jam 2026](https://dev.to/challenges/june-game-jam-2026-06-03).*

> **▶️ Play it:** https://pooja-bhavani.github.io/Turing-s-Dawn/
> **📺 Demo video:** <!-- your video URL -->
> **💻 Source:** https://github.com/pooja-bhavani/Turing-s-Dawn

---

## The pitch

On the longest day of the year, the light starts running out.

**Turing's Dawn** is a browser puzzle game where **daylight is a resource that drains in real time**, and the only way to hold back the dark is to break the codes a vanished mind left behind. Six chambers, six codebreaking disciplines — a Caesar dial, a binary sunrise, a logic-gate garden, the pattern of days, an honest-to-goodness **Turing machine**, and a final Vigenère "Dawn Key" assembled from everything you've collected.

It's an ode to **Alan Turing** — but the thing that makes it *play* is the clock. You're not browsing a museum of ciphers. You're racing the night.

## Why a clock changes everything

Most codebreaking games let you think forever. I wanted the solstice theme to be **mechanical, not decorative** — so light is a meter that drains on a `requestAnimationFrame` loop the whole time you're solving. Solve a chamber and you claw some back. Stall, and the screen literally closes in: a vignette deepens, the edges bleed red, and a heartbeat starts up underneath the music.

That single decision turns "decode this string" into "decode this string *before the dark wins*." The solstice isn't the skin on the game — it's the pressure.

To keep it fair (never the cheap kind of hard):

- The timer **pauses** during narrative beats and end screens — you only lose light while actually playing.
- Failure is **soft**: run out of light and the chamber waits. You rekindle and retry, no progress lost.
- Hints are **tiered and spoiler-safe**: three escalating nudges per chamber — reframe the goal, name the technique, point at the next step — so you're never stranded and never simply handed the answer.

## The chamber I'm proudest of: becoming the machine

The fifth chamber, **"The Bombe,"** doesn't ask you to *describe* a Turing machine. It makes you *run* one.

You get a tape, a head, a state, and a rules table. You read the cell under the head, the matching rule lights up, and you **Step** — watching the head move, the cell rewrite, the state change — until the machine halts. Then you lock in what the tape reads. Lock in early and the tape is wrong, so *understanding the run is the puzzle.*

The whole thing animates a **pure, unit-tested `traceTuring()` engine** — the UI is just drawing real machine configurations, one step at a time. That's the ode I wanted: not a portrait of Turing, but a few minutes spent thinking the way his machines did.

## Everything is a hands-on instrument

No chamber is a plain text box. Each cipher gets its own toy:

- **First Light** — a Caesar dial you rotate to watch the glyphs resolve into a word.
- **The Binary Sunrise** — the horizon as lit/unlit lamps; tap a byte to read its ASCII value.
- **Logic Gate Garden** — throw the input switches and watch the gate network light up live; the OUT lamp glows when you hit the target.
- **Pattern of Days** — the solstice calendar as tiles, with the next day yours to fill.
- **The Bombe** — the step-through Turing machine above.
- **The Dawn Key** — your collected key-fragments align beneath the final cipher; turn the key and bring back the morning.

## Built to be solid (and provably so)

The whole cipher engine is **pure TypeScript with no React, no DOM, no side effects** — which means it's fully unit-tested with Vitest. Every chamber in the data file is *proven solvable*, and every verifier is *proven to reject near-misses*. The Turing trace is tested to agree with the run-to-halt result and to terminate even on pathological rule sets.

The game itself is **data-driven**: adding a chamber is a JSON entry, not new code.

```
src/
  game/        pure, unit-tested engine — ciphers, verifiers, scoring, Turing trace
  data/        chambers.json + narrative.json   (chambers = data, not code)
  hooks/       useLightMeter (rAF drain), useGameState (state machine), useAudio (synth)
  components/  background, vignette, light meter, puzzles/, end screens
```

## Accessible by default

This mattered to me as much as the puzzles:

- **Keyboard-playable** throughout.
- `prefers-reduced-motion` aware — the typewriter and auto-run collapse to instant.
- **ARIA live regions** announce the light meter, hints, and narrative.
- **Color is never the only signal** — states carry text and shape too.
- **Audio is synthesized** (no asset files) with a mute toggle that persists, and it only starts on your first click, so nothing ambushes you.

## Tech

React + TypeScript + Vite, Tailwind v4, Framer Motion for the juice, the Web Audio API for a drone / heartbeat / solve-chime built entirely in code, and Vitest for the engine. No backend, no keys, no install — it's a static site.

## What I learned

The jam tempted everyone toward "another cipher game." The lesson for me was that the **theme had to be a verb**, not a backdrop. Once daylight became something you could *lose*, every other decision — the soft-fail, the heartbeat, the vignette, the score chase — fell out of that one mechanic. The Turing tribute is the heart; the draining light is the pulse.

Thanks for playing. Keep the light. ☀️

---

*An ode to Alan Turing, who broke codes to push back a darkness of his own, and whose dawn came far too late.*
