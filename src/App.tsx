import { useState } from 'react';
import { Play } from 'lucide-react';
import { Layout, type TabId } from './components/Layout';
import { ToastProvider } from './components/Toast';
import { Configuration } from './components/Configuration';
import { Arbitration } from './components/Arbitration';
import { Sequencing } from './components/Sequencing';
import { RelayNodes } from './components/RelayNodes';
import { SyncAndSeal } from './components/SyncAndSeal';
import { ArchiveViewer } from './components/ArchiveViewer';
import { useStore } from './store';

function ActiveRelay() {
  const hasRound = useStore((s) => s.activeRound !== null);
  const startRound = useStore((s) => s.startRound);

  return (
    <div className="space-y-4">
      {!hasRound && (
        <div className="card flex flex-col items-center gap-3 py-10 text-center">
          <p className="text-sm text-slate-400">
            No active relay. Start a new round, or import a sync payload from
            another device below.
          </p>
          <button type="button" className="btn-primary" onClick={startRound}>
            <Play className="h-4 w-4" /> Start New Round
          </button>
        </div>
      )}
      <Arbitration />
      <Sequencing />
      <RelayNodes />
      <SyncAndSeal />
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('relay');

  return (
    <ToastProvider>
      <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        {activeTab === 'relay' && <ActiveRelay />}
        {activeTab === 'history' && <ArchiveViewer />}
        {activeTab === 'settings' && <Configuration />}
      </Layout>
    </ToastProvider>
  );
}
