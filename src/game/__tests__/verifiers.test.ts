import { describe, it, expect } from 'vitest';
import { verify } from '../verifiers';
import { computeScore } from '../scoring';
import chambers from '../../data/chambers.json';
import type { Puzzle } from '../types';

const puzzles = chambers.chambers as Puzzle[];
const byId = (id: string) => puzzles.find((p) => p.id === id)!;

describe('verify: every chamber in chambers.json is solvable', () => {
  it('accepts each canonical solution', () => {
    // Fragments accumulate in chamber order, mirroring real play.
    const fragments: string[] = [];
    for (const p of puzzles) {
      expect(verify(p, p.solution, fragments)).toBe(true);
      if (p.keyFragment) fragments.push(p.keyFragment);
    }
  });
});

describe('verify: rejects near-misses', () => {
  it('caesar rejects a wrong word', () => {
    expect(verify(byId('ch1-first-light'), 'DUSK')).toBe(false);
  });
  it('caesar is case/space insensitive', () => {
    expect(verify(byId('ch1-first-light'), '  dawn ')).toBe(true);
  });
  it('binary rejects garbage', () => {
    expect(verify(byId('ch2-binary-sunrise'), 'MOON')).toBe(false);
  });
  it('logic rejects an assignment that misses the target', () => {
    expect(verify(byId('ch3-logic-garden'), 'A=0,B=0,C=0')).toBe(false);
  });
  it('logic accepts ANY assignment that satisfies the network', () => {
    expect(verify(byId('ch3-logic-garden'), 'A=1,B=0,C=1')).toBe(true);
  });
});

describe('verify: dawnkey uses collected fragments', () => {
  it('decrypts with the assembled fragment key', () => {
    const dawn = byId('ch6-dawn-key');
    const fragments = puzzles
      .filter((p) => p.id !== dawn.id)
      .map((p) => p.keyFragment)
      .filter(Boolean);
    expect(verify(dawn, dawn.solution, fragments)).toBe(true);
  });
});

describe('scoring', () => {
  it('rewards light + first-try, penalizes hints (capped)', () => {
    const high = computeScore({ lightRemaining: 90, firstTrySolves: 6, hintsUsed: 0, elapsedSeconds: 60 });
    const low = computeScore({ lightRemaining: 10, firstTrySolves: 0, hintsUsed: 20, elapsedSeconds: 600 });
    expect(high).toBeGreaterThan(low);
    expect(low).toBeGreaterThanOrEqual(0);
  });
});
