import {
  compressToEncodedURIComponent,
  decompressFromEncodedURIComponent,
} from 'lz-string';
import type { RelayRound } from '../types';
import { SCHEMA_VERSION } from '../types';

/** Compresses a round into a messenger-safe (URI-safe Base64) payload. */
export function exportRound(round: RelayRound): string {
  return compressToEncodedURIComponent(JSON.stringify(round));
}

export type ImportResult =
  | { ok: true; round: RelayRound }
  | { ok: false; error: string };

export function importRound(payload: string): ImportResult {
  const trimmed = payload.trim();
  if (!trimmed) {
    return { ok: false, error: 'Payload is empty.' };
  }

  const json = decompressFromEncodedURIComponent(trimmed);
  if (!json) {
    return {
      ok: false,
      error: 'Could not decompress payload. Check that it was copied fully.',
    };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: 'Decompressed payload is not valid JSON.' };
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'Payload does not contain a relay round.' };
  }

  const round = parsed as Partial<RelayRound>;
  if (round.schemaVersion !== SCHEMA_VERSION) {
    return {
      ok: false,
      error: `Unsupported schema version "${String(
        round.schemaVersion,
      )}" (expected "${SCHEMA_VERSION}").`,
    };
  }

  return {
    ok: true,
    round: {
      id: typeof round.id === 'string' ? round.id : crypto.randomUUID(),
      timestamp:
        typeof round.timestamp === 'number' ? round.timestamp : Date.now(),
      schemaVersion: SCHEMA_VERSION,
      targetNumber:
        typeof round.targetNumber === 'number' ? round.targetNumber : null,
      agentGuesses:
        round.agentGuesses && typeof round.agentGuesses === 'object'
          ? round.agentGuesses
          : {},
      starterAgentId:
        typeof round.starterAgentId === 'string' ? round.starterAgentId : null,
      topic: typeof round.topic === 'string' ? round.topic : '',
      turnOrder: Array.isArray(round.turnOrder)
        ? round.turnOrder.filter((id): id is string => typeof id === 'string')
        : [],
      responses:
        round.responses && typeof round.responses === 'object'
          ? round.responses
          : {},
      isSealed: round.isSealed === true,
    },
  };
}
