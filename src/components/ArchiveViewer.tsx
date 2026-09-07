import { useMemo, useState } from 'react';
import { Archive, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { agentName } from '../lib/template';
import type { RelayRound } from '../types';

function RoundCard({ round }: { round: RelayRound }) {
  const agents = useStore((s) => s.agents);
  const deleteRound = useStore((s) => s.deleteRound);
  const [expanded, setExpanded] = useState(false);

  const when = new Date(round.timestamp).toLocaleString();

  return (
    <li className="card p-0">
      <button
        type="button"
        className="flex w-full items-center gap-3 p-4 text-left"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
      >
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">
            {round.topic || '(no topic)'}
          </p>
          <p className="mt-0.5 text-xs text-slate-500">{when}</p>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 shrink-0 text-slate-500" />
        ) : (
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-500" />
        )}
      </button>

      {expanded && (
        <div className="space-y-3 border-t border-slate-800 p-4 text-sm">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
            <dt className="text-slate-500">Target number</dt>
            <dd className="tabular-nums">{round.targetNumber ?? '—'}</dd>
            <dt className="text-slate-500">Starter</dt>
            <dd>{agentName(agents, round.starterAgentId)}</dd>
            <dt className="text-slate-500">Schema</dt>
            <dd>{round.schemaVersion}</dd>
          </dl>

          {Object.keys(round.agentGuesses).length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Guesses
              </p>
              <ul className="flex flex-wrap gap-2 text-xs">
                {Object.entries(round.agentGuesses).map(([id, guess]) => (
                  <li
                    key={id}
                    className="rounded-full bg-slate-800 px-2.5 py-1 tabular-nums"
                  >
                    {agentName(agents, id)}: {guess}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {round.turnOrder.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Responses (turn order)
              </p>
              <ol className="space-y-2">
                {round.turnOrder.map((id, index) => (
                  <li
                    key={id}
                    className="rounded-lg bg-slate-800/60 p-2.5 text-xs"
                  >
                    <span className="font-semibold text-sky-400">
                      {index + 1}. {agentName(agents, id)}
                    </span>
                    <p className="mt-1 whitespace-pre-wrap text-slate-300">
                      {round.responses[id]?.trim() || '(no response)'}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}

          <button
            type="button"
            className="btn-danger w-full"
            onClick={() => deleteRound(round.id)}
          >
            <Trash2 className="h-4 w-4" /> Delete Record
          </button>
        </div>
      )}
    </li>
  );
}

export function ArchiveViewer() {
  const historyLog = useStore((s) => s.historyLog);

  const sorted = useMemo(
    () => [...historyLog].sort((a, b) => b.timestamp - a.timestamp),
    [historyLog],
  );

  return (
    <div>
      <h2 className="card-title">
        <Archive className="h-4 w-4" /> History Archive
      </h2>
      {sorted.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-700 px-4 py-12 text-center text-sm text-slate-500">
          No sealed rounds yet. Seal an active relay to archive it here.
        </div>
      ) : (
        <ul className="space-y-3">
          {sorted.map((round) => (
            <RoundCard key={round.id} round={round} />
          ))}
        </ul>
      )}
    </div>
  );
}
