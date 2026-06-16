// ── Puzzle verification ────────────────────────────────────────────
// One pure dispatcher, one validator per puzzle type. The UI calls
// `verify(puzzle, input, fragments)` and gets a boolean — nothing more.

import type {
  Puzzle,
  LogicPayload,
  TuringPayload,
  DawnKeyPayload,
} from './types';
import { evaluateLogic, parseAssignment, runTuring, vigenereDecode } from './ciphers';

/** Normalize free-text answers: trim, collapse spaces, upper-case. */
function norm(s: string): string {
  return s.trim().replace(/\s+/g, ' ').toUpperCase();
}

export function verify(
  puzzle: Puzzle,
  input: string,
  fragments: string[] = [],
): boolean {
  switch (puzzle.type) {
    case 'caesar':
    case 'binary':
    case 'pattern':
      // Player supplies the decoded plaintext; compare to canonical.
      return norm(input) === norm(puzzle.solution);

    case 'logic': {
      // Validate by *executing* the network, not by string-matching —
      // any assignment that drives OUT to the target is accepted.
      const payload = puzzle.payload as LogicPayload;
      try {
        const assignment = parseAssignment(input);
        return evaluateLogic(payload, assignment) === payload.target;
      } catch {
        return false;
      }
    }

    case 'turing': {
      // Accept either the correct final tape or a literal match of the
      // canonical solution string.
      const payload = puzzle.payload as TuringPayload;
      const result = runTuring(payload);
      return (
        norm(input) === norm(payload.targetTape) ||
        norm(input) === norm(result) ||
        norm(input) === norm(puzzle.solution)
      );
    }

    case 'dawnkey': {
      // The key is the collected fragments, in order. Player decrypts.
      const payload = puzzle.payload as DawnKeyPayload;
      const key = fragments.join('');
      const decoded = vigenereDecode(payload.cipherText, key);
      return norm(input) === norm(puzzle.solution) || norm(input) === norm(decoded);
    }

    default:
      return false;
  }
}
