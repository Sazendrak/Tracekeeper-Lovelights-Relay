import { MessageSquare, Copy, ClipboardCopy } from 'lucide-react';
import { useStore } from '../store';
import { agentName, renderTemplate } from '../lib/template';
import { copyText } from '../lib/clipboard';
import { useToast } from './Toast';

export function RelayNodes() {
  const agents = useStore((s) => s.agents);
  const round = useStore((s) => s.activeRound);
  const promptTemplate = useStore((s) => s.promptTemplate);
  const setResponse = useStore((s) => s.setResponse);
  const { showToast } = useToast();

  if (!round || round.turnOrder.length === 0) return null;

  const copyNode = async (agentId: string) => {
    const response = round.responses[agentId] ?? '';
    if (!response.trim()) {
      showToast('Nothing to copy for this node yet.', 'error');
      return;
    }
    const ok = await copyText(response);
    showToast(
      ok
        ? `${agentName(agents, agentId)}'s response copied.`
        : 'Copy failed — clipboard unavailable.',
      ok ? 'success' : 'error',
    );
  };

  const copyPayload = async (agentId: string) => {
    const payload = renderTemplate(promptTemplate, round, agents, agentId);
    const ok = await copyText(payload);
    showToast(
      ok
        ? `Relay payload for ${agentName(agents, agentId)} copied.`
        : 'Copy failed — clipboard unavailable.',
      ok ? 'success' : 'error',
    );
  };

  return (
    <section className="card">
      <h2 className="card-title">
        <MessageSquare className="h-4 w-4" /> Phase 3 · Relay Nodes
      </h2>
      <div className="space-y-4">
        {round.turnOrder.map((agentId, index) => (
          <div
            key={agentId}
            className="rounded-xl border border-slate-800 bg-slate-800/40 p-3"
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500/15 text-xs font-bold tabular-nums text-sky-400">
                {index + 1}
              </span>
              <span className="text-sm font-semibold">
                {agentName(agents, agentId)}
              </span>
            </div>
            <textarea
              className="field min-h-24 text-sm"
              placeholder={`Paste ${agentName(agents, agentId)}'s response here…`}
              value={round.responses[agentId] ?? ''}
              onChange={(e) => setResponse(agentId, e.target.value)}
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => copyNode(agentId)}
              >
                <Copy className="h-4 w-4" /> Copy Node
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={() => copyPayload(agentId)}
              >
                <ClipboardCopy className="h-4 w-4" /> Copy Relay Payload
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
