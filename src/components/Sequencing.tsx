import { ListOrdered, Shuffle } from 'lucide-react';
import { useStore } from '../store';
import { agentName } from '../lib/template';

export function Sequencing() {
  const agents = useStore((s) => s.agents);
  const round = useStore((s) => s.activeRound);
  const setTopic = useStore((s) => s.setTopic);
  const generateTurnOrder = useStore((s) => s.generateTurnOrder);

  if (!round) return null;

  return (
    <section className="card">
      <h2 className="card-title">
        <ListOrdered className="h-4 w-4" /> Phase 2 · Sequencing
      </h2>

      <label className="block text-xs font-medium text-slate-400">
        Topic / Question (from the starter)
        <input
          className="field mt-1.5"
          placeholder="e.g. What breaks first at scale?"
          value={round.topic}
          onChange={(e) => setTopic(e.target.value)}
        />
      </label>

      <button
        type="button"
        className="btn-primary mt-4 w-full"
        onClick={generateTurnOrder}
      >
        <Shuffle className="h-4 w-4" /> Generate Order
      </button>

      {round.turnOrder.length > 0 && (
        <ol className="mt-4 flex flex-wrap gap-2">
          {round.turnOrder.map((id, index) => (
            <li
              key={id}
              className="flex items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm"
            >
              <span className="font-bold tabular-nums text-sky-400">
                {index + 1}
              </span>
              {agentName(agents, id)}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
