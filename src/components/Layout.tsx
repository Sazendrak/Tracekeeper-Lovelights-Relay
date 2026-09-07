import type { ReactNode } from 'react';
import { Radio, History, Settings } from 'lucide-react';

export type TabId = 'relay' | 'history' | 'settings';

const TABS: { id: TabId; label: string; icon: typeof Radio }[] = [
  { id: 'relay', label: 'Active Relay', icon: Radio },
  { id: 'history', label: 'History', icon: History },
  { id: 'settings', label: 'Settings', icon: Settings },
];

interface LayoutProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  children: ReactNode;
}

export function Layout({ activeTab, onTabChange, children }: LayoutProps) {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-3xl flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-slate-950/90 px-4 py-3 backdrop-blur">
        <h1 className="flex items-center gap-2 text-lg font-bold tracking-tight">
          <Radio className="h-5 w-5 text-sky-400" />
          AI Relay Manager
        </h1>
      </header>

      <main className="flex-1 px-4 pb-28 pt-4">{children}</main>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="mx-auto flex w-full max-w-3xl">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onTabChange(id)}
              aria-current={activeTab === id ? 'page' : undefined}
              className={`flex flex-1 flex-col items-center gap-1 py-2.5 text-xs font-medium transition-colors ${
                activeTab === id
                  ? 'text-sky-400'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="h-5 w-5" />
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
