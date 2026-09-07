import { useState } from 'react';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  FileText,
  RotateCcw,
} from 'lucide-react';
import { useStore, DEFAULT_PROMPT_TEMPLATE } from '../store';

function AgentRow({ agentId }: { agentId: string }) {
  const agent = useStore((s) => s.agents.find((a) => a.id === agentId));
  const renameAgent = useStore((s) => s.renameAgent);
  const deleteAgent = useStore((s) => s.deleteAgent);
  const toggleAgentActive = useStore((s) => s.toggleAgentActive);

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  if (!agent) return null;

  const commitRename = () => {
    renameAgent(agent.id, draft);
    setEditing(false);
  };

  return (
    <li className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-800/50 px-3 py-2.5">
      <button
        type="button"
        role="switch"
        aria-checked={agent.isActive}
        aria-label={`Toggle ${agent.name} for the current round`}
        onClick={() => toggleAgentActive(agent.id)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          agent.isActive ? 'bg-sky-500' : 'bg-slate-700'
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${
            agent.isActive ? 'left-[22px]' : 'left-0.5'
          }`}
        />
      </button>

      {editing ? (
        <>
          <input
            className="field flex-1 py-1.5"
            value={draft}
            autoFocus
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') setEditing(false);
            }}
          />
          <button
            type="button"
            className="btn-secondary px-2.5 py-1.5"
            aria-label="Save name"
            onClick={commitRename}
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="btn-secondary px-2.5 py-1.5"
            aria-label="Cancel rename"
            onClick={() => setEditing(false)}
          >
            <X className="h-4 w-4" />
          </button>
        </>
      ) : (
        <>
          <span
            className={`flex-1 truncate text-sm font-medium ${
              agent.isActive ? 'text-slate-100' : 'text-slate-500 line-through'
            }`}
          >
            {agent.name}
          </span>
          <button
            type="button"
            className="btn-secondary px-2.5 py-1.5"
            aria-label={`Rename ${agent.name}`}
            onClick={() => {
              setDraft(agent.name);
              setEditing(true);
            }}
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="btn-danger px-2.5 py-1.5"
            aria-label={`Delete ${agent.name}`}
            onClick={() => deleteAgent(agent.id)}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </>
      )}
    </li>
  );
}

export function Configuration() {
  const agentIds = useStore((s) => s.agents.map((a) => a.id));
  const addAgent = useStore((s) => s.addAgent);
  const promptTemplate = useStore((s) => s.promptTemplate);
  const setPromptTemplate = useStore((s) => s.setPromptTemplate);

  const [newName, setNewName] = useState('');

  const submitNewAgent = () => {
    if (!newName.trim()) return;
    addAgent(newName);
    setNewName('');
  };

  return (
    <div className="space-y-4">
      <section className="card">
        <h2 className="card-title">
          <Users className="h-4 w-4" /> Agent Roster
        </h2>
        <ul className="space-y-2">
          {agentIds.map((id) => (
            <AgentRow key={id} agentId={id} />
          ))}
          {agentIds.length === 0 && (
            <li className="rounded-xl border border-dashed border-slate-700 px-3 py-6 text-center text-sm text-slate-500">
              No agents yet. Add one below.
            </li>
          )}
        </ul>
        <div className="mt-3 flex gap-2">
          <input
            className="field flex-1"
            placeholder="New agent name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && submitNewAgent()}
          />
          <button
            type="button"
            className="btn-primary"
            onClick={submitNewAgent}
            disabled={!newName.trim()}
          >
            <Plus className="h-4 w-4" /> Add
          </button>
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">
          <FileText className="h-4 w-4" /> Prompt Template
        </h2>
        <textarea
          className="field min-h-36 font-mono text-xs leading-relaxed"
          value={promptTemplate}
          onChange={(e) => setPromptTemplate(e.target.value)}
        />
        <p className="mt-2 text-xs text-slate-500">
          Placeholders: <code className="text-sky-400">{'{topic}'}</code>,{' '}
          <code className="text-sky-400">{'{history}'}</code>,{' '}
          <code className="text-sky-400">{'{agent_name}'}</code> (alias{' '}
          <code className="text-sky-400">{'{agent}'}</code>)
        </p>
        <button
          type="button"
          className="btn-secondary mt-3"
          onClick={() => setPromptTemplate(DEFAULT_PROMPT_TEMPLATE)}
        >
          <RotateCcw className="h-4 w-4" /> Reset to default
        </button>
      </section>
    </div>
  );
}
