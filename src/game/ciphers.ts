// ── Pure cipher / puzzle primitives ────────────────────────────────
// No React, no DOM, no side effects. 100% unit-testable. Every puzzle's
// "truth" lives here so the UI stays dumb and the engine stays honest.

const A = 'A'.charCodeAt(0);

/** Shift each letter by `shift` (wraps A–Z). Non-letters pass through. */
export function caesarShift(text: string, shift: number): string {
  const k = ((shift % 26) + 26) % 26;
  return text.replace(/[a-z]/gi, (ch) => {
    const isUpper = ch >= 'A' && ch <= 'Z';
    const base = isUpper ? A : 'a'.charCodeAt(0);
    return String.fromCharCode(((ch.charCodeAt(0) - base + k) % 26) + base);
  });
}

/** Decode a Caesar cipher (inverse of the encoding shift). */
export function caesarDecode(cipher: string, shift: number): string {
  return caesarShift(cipher, -shift);
}

/** Decode space-separated 8-bit ASCII groups → text. */
export function binaryToText(bits: string): string {
  return bits
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((byte) => String.fromCharCode(parseInt(byte, 2)))
    .join('');
}

/** Encode text → space-separated 8-bit ASCII groups. */
export function textToBinary(text: string): string {
  return [...text]
    .map((ch) => ch.charCodeAt(0).toString(2).padStart(8, '0'))
    .join(' ');
}

/** Vigenère decode: subtract the repeating key (letters only). */
export function vigenereDecode(cipher: string, key: string): string {
  const cleanKey = key.replace(/[^a-z]/gi, '').toUpperCase();
  if (!cleanKey) return cipher;
  let ki = 0;
  return cipher.replace(/[a-z]/gi, (ch) => {
    const isUpper = ch >= 'A' && ch <= 'Z';
    const base = isUpper ? A : 'a'.charCodeAt(0);
    const shift = cleanKey.charCodeAt(ki % cleanKey.length) - A;
    ki++;
    return String.fromCharCode(((ch.charCodeAt(0) - base - shift + 26) % 26) + base);
  });
}

/** Vigenère encode (handy for authoring/test fixtures). */
export function vigenereEncode(text: string, key: string): string {
  const cleanKey = key.replace(/[^a-z]/gi, '').toUpperCase();
  if (!cleanKey) return text;
  let ki = 0;
  return text.replace(/[a-z]/gi, (ch) => {
    const isUpper = ch >= 'A' && ch <= 'Z';
    const base = isUpper ? A : 'a'.charCodeAt(0);
    const shift = cleanKey.charCodeAt(ki % cleanKey.length) - A;
    ki++;
    return String.fromCharCode(((ch.charCodeAt(0) - base + shift) % 26) + base);
  });
}

// ── Logic gates ────────────────────────────────────────────────────
import type { LogicPayload } from './types';

function gateEval(op: string, ins: boolean[]): boolean {
  switch (op) {
    case 'AND':
      return ins.every(Boolean);
    case 'OR':
      return ins.some(Boolean);
    case 'NOT':
      return !ins[0];
    case 'XOR':
      return ins.filter(Boolean).length % 2 === 1;
    default:
      throw new Error(`Unknown gate op: ${op}`);
  }
}

/**
 * Evaluate a logic-gate network for a given input assignment.
 * Gates are evaluated in declared order; each `out` becomes a usable wire.
 * Returns the value of the gate named "OUT".
 */
export function evaluateLogic(
  payload: LogicPayload,
  assignment: Record<string, boolean>,
): boolean {
  const wires: Record<string, boolean> = { ...assignment };
  for (const gate of payload.gates) {
    const ins = gate.in.map((name) => {
      if (!(name in wires)) throw new Error(`Undefined wire: ${name}`);
      return wires[name];
    });
    wires[gate.out] = gateEval(gate.op, ins);
  }
  if (!('OUT' in wires)) throw new Error('Logic network has no OUT wire');
  return wires.OUT;
}

/** Parse "A=1,B=0,C=1" → { A:true, B:false, C:true }. */
export function parseAssignment(input: string): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const pair of input.split(',')) {
    const [k, v] = pair.split('=').map((s) => s.trim());
    if (!k) continue;
    out[k.toUpperCase()] = v === '1' || v?.toLowerCase() === 'true';
  }
  return out;
}

// ── Turing machine ─────────────────────────────────────────────────
import type { TuringPayload, TuringRule } from './types';

/** A single observable configuration of the machine, mid-run. */
export interface TuringStep {
  step: number; // 0 = initial configuration, before any rule fires
  tape: string[]; // current tape cells ('' = blank)
  head: number; // index of the cell under the head
  state: string; // current state ('HALT' when stopped)
  applied: TuringRule | null; // rule that produced THIS config (null at step 0)
  halted: boolean; // true once no further rule can fire
}

/**
 * Trace a Turing-style machine step by step, returning every configuration
 * from the initial state through halt. This is the source of truth the UI
 * animates — "becoming the machine" means walking this trace one cell at a
 * time. Bounded by `maxSteps` to guarantee termination.
 */
export function traceTuring(payload: TuringPayload, maxSteps = 1000): TuringStep[] {
  const tape = payload.tape.split('');
  let head = payload.head;
  let state = payload.state;

  const trace: TuringStep[] = [
    { step: 0, tape: [...tape], head, state, applied: null, halted: state === 'HALT' },
  ];

  for (let step = 1; step <= maxSteps; step++) {
    if (state === 'HALT') break;
    const read = head >= 0 && head < tape.length ? tape[head] : '';
    const rule = payload.rules.find((r) => r.state === state && r.read === read);
    if (!rule) {
      // No applicable rule → machine stops where it stands.
      trace[trace.length - 1].halted = true;
      break;
    }
    if (rule.write !== '' && head >= 0) {
      if (head >= tape.length) tape.length = head + 1;
      tape[head] = rule.write;
    }
    if (rule.move === 'R') head++;
    else if (rule.move === 'L') head--;
    state = rule.next;

    const halted = state === 'HALT';
    trace.push({ step, tape: [...tape], head, state, applied: rule, halted });
    if (halted) break;
  }
  return trace;
}

/**
 * Run a Turing-style machine to halt and return the final tape (trimmed
 * of trailing blanks). Thin wrapper over `traceTuring`.
 */
export function runTuring(payload: TuringPayload, maxSteps = 1000): string {
  const trace = traceTuring(payload, maxSteps);
  return trace[trace.length - 1].tape.join('').replace(/\s+$/, '');
}
