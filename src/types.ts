// Mirrors <DataSchema> in specs/001-core-feature/SPEC.md. Do not diverge.

export const SCHEMA_VERSION = '1.0';

export interface Agent {
  id: string; // generated via crypto.randomUUID()
  name: string;
  isActive: boolean; // toggle inclusion for current round
}

export interface RelayRound {
  id: string; // unique identifier for the archive
  timestamp: number; // UNIX epoch for sorting
  schemaVersion: string; // "1.0", prevents import crashes
  targetNumber: number | null;
  agentGuesses: Record<string, number>; // Maps Agent.id to guess
  starterAgentId: string | null;
  topic: string;
  turnOrder: string[]; // Array of Agent.ids
  responses: Record<string, string>; // Maps Agent.id to their text response
  isSealed: boolean;
}

export interface AppState {
  agents: Agent[];
  promptTemplate: string;
  activeRound: RelayRound | null;
  historyLog: RelayRound[];
}
