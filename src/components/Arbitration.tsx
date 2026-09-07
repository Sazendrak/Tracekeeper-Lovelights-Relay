import { Target, Dices, Crown } from 'lucide-react';
import { useStore } from '../store';

export function Arbitration() {
  const activeAgents = useStore((s) => s.agents.filter((a) => a.isActive));
  const round = useStore((s) => s.activeRound);
  const setAgentGuess = useStore((s) => s.setAgentGuess);
  const generateTargetNumber = useStore((s) => s.generateTargetNumber);
  const setStarterAgent = useStore((s) => s.setStarterAgent);

  if (!round) return null;

  return (
    <section className="card">
      <h2 className="card-title">
        <Target className="h-4 w-4" /> Phase 1 · Arbitration
      </h2>

      {activeAgents.length === 0 ? (
        <p className="text-sm text-slate-500">
          No active agents. Enable agents in Settings first.
        </p>
      ) : (
        <div className="space-y-2">
          {activeAgents.map((agent) => {
            const guess = round.agentGuesses[agent.id];
            const delta =
              round.targetNumber !== null && typeof guess === 'number'
                ? Math.abs(guess - round.targetNumber)
                : null;
            return (
              <div key={agent.id} className="flex items-center gap-3">
                <span className="w-24 flex-1 truncate text-sm font-medium">
                  {agent.name}
                  {round.starterAgentId === agent.id && (
                    <Crown className="ml-1.5 inline h-4 w-4 text-amber-400" />
                  )}
                </span>
                {delta !== null && (
                  <span className="text-xs tabular-nums text-slate-500">
                    Δ {delta}
                  </span>
                )}
                <input
                  type="number"
                  min={1}
                  max={100}
                  inputMode="numeric"
                  placeholder="1–100"
                  aria-label={`Guess for ${agent.name}`}
                  className="field w-24 text-center tabular-nums"
                  value={typeof guess === 'number' ? guess : ''}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (raw === '') {
                      setAgentGuess(agent.id, null);
                      return;
                    }
                    const num = Number(raw);
                    setAgentGuess(
                      agent.id,
                      Number.isFinite(num)
                        ? Math.min(100, Math.max(1, num))
                        : null,
                    );
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          className="btn-primary flex-1"
          onClick={generateTargetNumber}
          disabled={activeAgents.length === 0}
        >
          <Dices className="h-4 w-4" /> Generate Target Number
        </button>
        {round.targetNumber !== null && (
          <span className="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-lg font-bold tabular-nums text-sky-300">
            {round.targetNumber}
          </span>
        )}
      </div>

      <label className="mt-4 block text-xs font-medium text-slate-400">
        Starter (auto-designated by proximity, manual override below)
        <select
          className="field mt-1.5"
          value={round.starterAgentId ?? ''}
          onChange={(e) => setStarterAgent(e.target.value || null)}
        >
          <option value="">— No starter designated —</option>
          {activeAgents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
