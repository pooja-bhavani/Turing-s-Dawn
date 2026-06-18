// ── Core domain types ──────────────────────────────────────────────
// Every chamber in chambers.json conforms to `Puzzle`, so the engine,
// the verifier, and the Gemini-powered hint system can treat any puzzle
// uniformly. Adding a chamber = data, not code.

export type PuzzleType =
  | 'caesar'
  | 'binary'
  | 'pattern'
  | 'logic'
  | 'turing'
  | 'dawnkey';

// ── Per-type payloads ──────────────────────────────────────────────
export interface CaesarPayload {
  cipherText: string;
  shift: number;
}

export interface BinaryPayload {
  encoding: 'ascii8';
  bits: string; // space-separated 8-bit groups
}

export interface PatternPayload {
  sequence: (number | string)[]; // last element shown as "?"
}

export interface LogicGate {
  op: 'AND' | 'OR' | 'NOT' | 'XOR';
  in: string[]; // input symbol names (NOT uses one)
  out: string; // output symbol name
}

export interface LogicPayload {
  inputs: string[];
  gates: LogicGate[];
  target: boolean;
}

export interface TuringRule {
  state: string;
  read: string; // symbol under head; '' = blank
  write: string;
  move: 'L' | 'R' | '-';
  next: string; // next state; 'HALT' stops the machine
}

export interface TuringPayload {
  tape: string;
  head: number;
  state: string;
  rules: TuringRule[];
  targetTape: string;
}

export interface DawnKeyPayload {
  cipherText: string;
  keySource: 'fragments'; // key is assembled from collected fragments
}

export type PuzzlePayload =
  | CaesarPayload
  | BinaryPayload
  | PatternPayload
  | LogicPayload
  | TuringPayload
  | DawnKeyPayload;

export interface Puzzle {
  id: string;
  type: PuzzleType;
  title: string;
  prompt: string;
  payload: PuzzlePayload;
  solution: string; // canonical answer (engine-side; never shipped to a public AI raw)
  lightReward: number; // % light restored on solve
  keyFragment: string; // contributes to the Dawn Key
  hints: string[]; // 3 tiered static fallback hints
}

export interface NarrativeBeat {
  afterChamberId: string; // shown after this chamber is solved
  line: string;
}

// ── Runtime game state ─────────────────────────────────────────────
export type GameStatus = 'intro' | 'playing' | 'beat' | 'dawn' | 'dusk';

export interface GameState {
  status: GameStatus;
  chamberIndex: number;
  solvedIds: string[];
  fragments: string[]; // collected, in chamber order
  hintsUsed: number;
  firstTrySolves: number;
  startedAt: number | null;
}
