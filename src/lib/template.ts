import type { Agent, RelayRound } from '../types';

export function agentName(agents: Agent[], agentId: string | null): string {
  if (!agentId) return 'Unknown';
  return agents.find((a) => a.id === agentId)?.name ?? 'Unknown';
}

/**
 * Compiles the relay history: every completed response in turn order,
 * stopping before `uptoAgentId` so an agent never sees its own slot.
 */
export function buildHistory(
  round: RelayRound,
  agents: Agent[],
  uptoAgentId?: string,
): string {
  const lines: string[] = [];
  for (const id of round.turnOrder) {
    if (uptoAgentId && id === uptoAgentId) break;
    const response = round.responses[id]?.trim();
    if (response) lines.push(`${agentName(agents, id)}: ${response}`);
  }
  return lines.length > 0 ? lines.join('\n\n') : '(none)';
}

/**
 * Renders the user-defined prompt template for a specific agent's turn.
 * Supports {topic}, {history}, and {agent_name} (with {agent} as an alias).
 */
export function renderTemplate(
  template: string,
  round: RelayRound,
  agents: Agent[],
  agentId: string,
): string {
  const name = agentName(agents, agentId);
  return template
    .replaceAll('{topic}', round.topic || '(no topic set)')
    .replaceAll('{history}', buildHistory(round, agents, agentId))
    .replaceAll('{agent_name}', name)
    .replaceAll('{agent}', name);
}
