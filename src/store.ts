import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Agent, AppState, RelayRound } from './types';
import { SCHEMA_VERSION } from './types';

export const DEFAULT_PROMPT_TEMPLATE =
  'Topic: {topic}\n\nPrevious: {history}\n\n{agent_name}, your turn.';

const DEFAULT_AGENT_NAMES = [
  'Gemini',
  'Atlas',
  'Sage',
  'Cap-n',
  'Virel',
  'Kidd',
  'Rogue',
];

const seedAgents = (): Agent[] =>
  DEFAULT_AGENT_NAMES.map((name) => ({
    id: crypto.randomUUID(),
    name,
    isActive: true,
  }));

export const createEmptyRound = (): RelayRound => ({
  id: crypto.randomUUID(),
  timestamp: Date.now(),
  schemaVersion: SCHEMA_VERSION,
  targetNumber: null,
  agentGuesses: {},
  starterAgentId: null,
  topic: '',
  turnOrder: [],
  responses: {},
  isSealed: false,
});

/** Closest guess to the target wins; ties resolve to roster order. */
function computeStarter(
  targetNumber: number | null,
  guesses: Record<string, number>,
  activeAgents: Agent[],
): string | null {
  if (targetNumber === null) return null;
  let winner: string | null = null;
  let bestDelta = Infinity;
  for (const agent of activeAgents) {
    const guess = guesses[agent.id];
    if (typeof guess !== 'number') continue;
    const delta = Math.abs(guess - targetNumber);
    if (delta < bestDelta) {
      bestDelta = delta;
      winner = agent.id;
    }
  }
  return winner;
}

function shuffle<T>(items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

interface AppActions {
  addAgent: (name: string) => void;
  renameAgent: (id: string, name: string) => void;
  deleteAgent: (id: string) => void;
  toggleAgentActive: (id: string) => void;
  setPromptTemplate: (template: string) => void;

  startRound: () => void;
  setAgentGuess: (agentId: string, guess: number | null) => void;
  generateTargetNumber: () => void;
  setStarterAgent: (agentId: string | null) => void;
  setTopic: (topic: string) => void;
  generateTurnOrder: () => void;
  setResponse: (agentId: string, text: string) => void;

  hydrateRound: (incoming: RelayRound) => void;
  sealRound: () => void;
  deleteRound: (roundId: string) => void;
}

export type Store = AppState & AppActions;

/** Applies an update to activeRound, no-op when no round is running. */
const withRound =
  (fn: (round: RelayRound, state: Store) => Partial<RelayRound>) =>
  (state: Store): Partial<Store> => {
    if (!state.activeRound) return {};
    return { activeRound: { ...state.activeRound, ...fn(state.activeRound, state) } };
  };

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      agents: seedAgents(),
      promptTemplate: DEFAULT_PROMPT_TEMPLATE,
      activeRound: null,
      historyLog: [],

      addAgent: (name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          agents: [
            ...state.agents,
            { id: crypto.randomUUID(), name: trimmed, isActive: true },
          ],
        }));
      },

      renameAgent: (id, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, name: trimmed } : agent,
          ),
        }));
      },

      deleteAgent: (id) =>
        set((state) => ({
          agents: state.agents.filter((agent) => agent.id !== id),
        })),

      toggleAgentActive: (id) =>
        set((state) => ({
          agents: state.agents.map((agent) =>
            agent.id === id ? { ...agent, isActive: !agent.isActive } : agent,
          ),
        })),

      setPromptTemplate: (template) => set({ promptTemplate: template }),

      startRound: () =>
        set((state) =>
          state.activeRound ? {} : { activeRound: createEmptyRound() },
        ),

      setAgentGuess: (agentId, guess) =>
        set(
          withRound((round, state) => {
            const agentGuesses = { ...round.agentGuesses };
            if (guess === null) {
              delete agentGuesses[agentId];
            } else {
              agentGuesses[agentId] = guess;
            }
            return {
              agentGuesses,
              starterAgentId: computeStarter(
                round.targetNumber,
                agentGuesses,
                state.agents.filter((a) => a.isActive),
              ),
            };
          }),
        ),

      generateTargetNumber: () =>
        set(
          withRound((round, state) => {
            const targetNumber = Math.floor(Math.random() * 100) + 1;
            return {
              targetNumber,
              starterAgentId: computeStarter(
                targetNumber,
                round.agentGuesses,
                state.agents.filter((a) => a.isActive),
              ),
            };
          }),
        ),

      setStarterAgent: (agentId) =>
        set(withRound(() => ({ starterAgentId: agentId }))),

      setTopic: (topic) => set(withRound(() => ({ topic }))),

      generateTurnOrder: () =>
        set(
          withRound((round, state) => {
            const active = state.agents.filter((a) => a.isActive);
            const starter = active.find((a) => a.id === round.starterAgentId);
            const rest = shuffle(
              active.filter((a) => a.id !== round.starterAgentId),
            );
            const ordered = starter ? [starter, ...rest] : rest;
            return { turnOrder: ordered.map((a) => a.id) };
          }),
        ),

      setResponse: (agentId, text) =>
        set(
          withRound((round) => ({
            responses: { ...round.responses, [agentId]: text },
          })),
        ),

      hydrateRound: (incoming) => {
        const current = get().activeRound;
        if (!current) {
          set({ activeRound: incoming });
          return;
        }
        // Strict merge: imported data only fills gaps, local data always wins.
        set({
          activeRound: {
            ...current,
            targetNumber: current.targetNumber ?? incoming.targetNumber,
            starterAgentId: current.starterAgentId ?? incoming.starterAgentId,
            topic: current.topic || incoming.topic,
            turnOrder: current.turnOrder.length
              ? current.turnOrder
              : incoming.turnOrder,
            agentGuesses: { ...incoming.agentGuesses, ...current.agentGuesses },
            responses: { ...incoming.responses, ...current.responses },
          },
        });
      },

      sealRound: () =>
        set((state) => {
          if (!state.activeRound) return {};
          const sealed: RelayRound = {
            ...state.activeRound,
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            isSealed: true,
          };
          return {
            historyLog: [...state.historyLog, sealed],
            activeRound: null,
          };
        }),

      deleteRound: (roundId) =>
        set((state) => ({
          historyLog: state.historyLog.filter((round) => round.id !== roundId),
        })),
    }),
    {
      name: 'ai-relay-manager',
      version: 1,
    },
  ),
);
