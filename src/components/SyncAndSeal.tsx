import { useState } from 'react';
import { RefreshCw, Upload, Download, Lock } from 'lucide-react';
import { useStore } from '../store';
import { exportRound, importRound } from '../lib/serialization';
import { copyText } from '../lib/clipboard';
import { useToast } from './Toast';

export function SyncAndSeal() {
  const round = useStore((s) => s.activeRound);
  const hydrateRound = useStore((s) => s.hydrateRound);
  const sealRound = useStore((s) => s.sealRound);
  const { showToast } = useToast();

  const [importPayload, setImportPayload] = useState('');
  const [exportPayload, setExportPayload] = useState('');

  const handleExport = async () => {
    if (!round) return;
    const payload = exportRound(round);
    setExportPayload(payload);
    const ok = await copyText(payload);
    showToast(
      ok
        ? 'Sync payload copied to clipboard.'
        : 'Copy failed — payload shown below instead.',
      ok ? 'success' : 'error',
    );
  };

  const handleImport = () => {
    const result = importRound(importPayload);
    if (!result.ok) {
      showToast(result.error, 'error');
      return;
    }
    hydrateRound(result.round);
    setImportPayload('');
    showToast('State imported — missing responses merged.');
  };

  const handleSeal = () => {
    sealRound();
    setExportPayload('');
    showToast('Round sealed and archived. Board reset.');
  };

  return (
    <section className="card">
      <h2 className="card-title">
        <RefreshCw className="h-4 w-4" /> Phase 4 · Sync &amp; Seal
      </h2>

      <div className="space-y-4">
        <div>
          <button
            type="button"
            className="btn-secondary w-full"
            onClick={handleExport}
            disabled={!round}
          >
            <Upload className="h-4 w-4" /> Export State
          </button>
          {exportPayload && (
            <textarea
              readOnly
              className="field mt-2 min-h-20 break-all font-mono text-[10px] leading-relaxed"
              value={exportPayload}
              onFocus={(e) => e.target.select()}
            />
          )}
        </div>

        <div>
          <textarea
            className="field min-h-20 break-all font-mono text-[10px] leading-relaxed"
            placeholder="Paste a sync payload from another device…"
            value={importPayload}
            onChange={(e) => setImportPayload(e.target.value)}
          />
          <button
            type="button"
            className="btn-secondary mt-2 w-full"
            onClick={handleImport}
            disabled={!importPayload.trim()}
          >
            <Download className="h-4 w-4" /> Import State
          </button>
        </div>

        <button
          type="button"
          className="btn-danger w-full"
          onClick={handleSeal}
          disabled={!round}
        >
          <Lock className="h-4 w-4" /> Seal Round &amp; Archive
        </button>
      </div>
    </section>
  );
}
