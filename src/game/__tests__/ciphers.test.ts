import { describe, it, expect } from 'vitest';
import {
  caesarShift,
  caesarDecode,
  binaryToText,
  textToBinary,
  vigenereEncode,
  vigenereDecode,
  evaluateLogic,
  parseAssignment,
  runTuring,
  traceTuring,
} from '../ciphers';
import type { LogicPayload, TuringPayload } from '../types';

describe('caesar', () => {
  it('decodes a shift of 3', () => {
    expect(caesarDecode('GDZQ', 3)).toBe('DAWN');
  });
  it('encode then decode is identity', () => {
    expect(caesarDecode(caesarShift('SOLSTICE', 7), 7)).toBe('SOLSTICE');
  });
  it('wraps around the alphabet', () => {
    expect(caesarShift('XYZ', 3)).toBe('ABC');
  });
  it('leaves non-letters untouched', () => {
    expect(caesarShift('A-B!', 1)).toBe('B-C!');
  });
});

describe('binary', () => {
  it('decodes 8-bit ascii groups', () => {
    expect(binaryToText('01010011 01010101 01001110')).toBe('SUN');
  });
  it('round-trips text', () => {
    expect(binaryToText(textToBinary('DAWN'))).toBe('DAWN');
  });
});

describe('vigenere', () => {
  it('round-trips with a key', () => {
    expect(vigenereDecode(vigenereEncode('DAWN', 'DAWN'), 'DAWN')).toBe('DAWN');
  });
});

describe('logic gates', () => {
  const payload: LogicPayload = {
    inputs: ['A', 'B', 'C'],
    gates: [
      { op: 'XOR', in: ['A', 'B'], out: 'X' },
      { op: 'AND', in: ['X', 'C'], out: 'OUT' },
    ],
    target: true,
  };

  it('the intended solution drives OUT true', () => {
    expect(evaluateLogic(payload, parseAssignment('A=1,B=0,C=1'))).toBe(true);
  });
  it('a wrong assignment does not', () => {
    expect(evaluateLogic(payload, parseAssignment('A=1,B=1,C=1'))).toBe(false);
  });
  it('parses true/false words too', () => {
    expect(parseAssignment('A=true,B=false')).toEqual({ A: true, B: false });
  });
});

describe('turing machine', () => {
  const payload: TuringPayload = {
    tape: '1011',
    head: 0,
    state: 'A',
    rules: [
      { state: 'A', read: '1', write: '0', move: 'R', next: 'A' },
      { state: 'A', read: '0', write: '1', move: 'R', next: 'B' },
      { state: 'B', read: '1', write: '1', move: 'R', next: 'B' },
      { state: 'B', read: '', write: '', move: '-', next: 'HALT' },
    ],
    targetTape: '0111',
  };

  it('halts on the target tape', () => {
    expect(runTuring(payload)).toBe('0111');
  });
  it('terminates even with a pathological rule set', () => {
    const spin: TuringPayload = {
      tape: '1',
      head: 0,
      state: 'A',
      rules: [{ state: 'A', read: '1', write: '1', move: '-', next: 'A' }],
      targetTape: '1',
    };
    expect(runTuring(spin, 50)).toBe('1'); // bounded, no infinite loop
  });

  it('traces every configuration from start to halt', () => {
    const trace = traceTuring(payload);
    // First config is the untouched input; last config is halted.
    expect(trace[0].step).toBe(0);
    expect(trace[0].tape.join('')).toBe('1011');
    expect(trace[0].applied).toBeNull();
    expect(trace.at(-1)?.halted).toBe(true);
    expect(trace.at(-1)?.state).toBe('HALT');
  });

  it('trace agrees with runTuring on the final tape', () => {
    const trace = traceTuring(payload);
    const finalTape = trace.at(-1)?.tape.join('').replace(/\s+$/, '');
    expect(finalTape).toBe(runTuring(payload));
  });

  it('each non-initial step records the rule that fired', () => {
    const trace = traceTuring(payload);
    for (const step of trace.slice(1)) {
      expect(step.applied).not.toBeNull();
      expect(step.applied?.state).toBeTypeOf('string');
    }
  });

  it('marks halt when no rule applies (machine stuck)', () => {
    const stuck: TuringPayload = {
      tape: '9',
      head: 0,
      state: 'A',
      rules: [{ state: 'A', read: '1', write: '1', move: 'R', next: 'A' }],
      targetTape: '9',
    };
    const trace = traceTuring(stuck);
    expect(trace).toHaveLength(1); // never moved
    expect(trace[0].halted).toBe(true);
  });
});
