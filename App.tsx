import { useEffect, useState } from 'react';
import { CheckCheck, ClipboardCheck, LayoutDashboard, MessageSquareText } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AppState, Page } from './types';
import { createDefaultState } from './lib/defaults';
import Dashboard from './pages/Dashboard';
import ChatAssistant from './pages/ChatAssistant';
import OrderCheck from './pages/OrderCheck';

const KEY = 'orderbuddy-ai:v1';

function load(): AppState {
  const base = createDefaultState();
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<AppState>;
      return {
        ...base,
        ...saved,
        product: { ...base.product, ...saved.product },
        order: { ...base.order, ...saved.order },
      };
    }
  } catch {
    /* ignore corrupted or unavailable storage */
  }
  return base;
}

const NAV: { id: Page; label: string; icon: LucideIcon }[] = [
  { id: 'dashboard', label: 'ภาพรวม', icon: LayoutDashboard },
  { id: 'chat', label: 'ตอบแชท', icon: MessageSquareText },
  { id: 'orders', label: 'ตรวจออเดอร์', icon: ClipboardCheck },
];

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
        <CheckCheck size={20} />
      </span>
      <span className="text-lg font-bold tracking-tight">OrderBuddy <span className="text-brand-600">AI</span></span>
    </div>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [state, setState] = useState<AppState>(load);

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage may be unavailable (private mode) */
    }
  }, [state]);

  const patch = (p: Partial<AppState>) => setState((s) => ({ ...s, ...p }));
  const go = (p: Page) => {
    setPage(p);
    window.scrollTo({ top: 0 });
  };

  return (
    <div className="min-h-screen bg-white">
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-ink-200 bg-white p-5 lg:flex">
        <Logo />
        <nav className="mt-8 space-y-1">
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
              aria-current={page === id ? 'page' : undefined}
              className={`flex min-h-[44px] w-full items-center gap-3 rounded-lg px-3 text-sm font-medium ${
                page === id ? 'bg-brand-50 text-brand-700' : 'text-ink-700 hover:bg-ink-50'
              }`}
            >
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <p className="mt-auto text-xs leading-relaxed text-ink-500">
          เวอร์ชันเดโม ใช้กฎในเบราว์เซอร์ ข้อมูลอยู่ในเครื่องคุณเท่านั้น
        </p>
      </aside>

      <header className="sticky top-0 z-20 border-b border-ink-200 bg-white/95 px-4 pb-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur lg:hidden">
        <Logo />
      </header>

      <main className="pb-28 lg:pb-10 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-8 sm:py-8">
          {page === 'dashboard' && <Dashboard state={state} go={go} onResetAll={() => setState(createDefaultState())} />}
          {page === 'chat' && <ChatAssistant state={state} patch={patch} />}
          {page === 'orders' && <OrderCheck state={state} patch={patch} />}
        </div>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-3 border-t border-ink-200 bg-white pb-[env(safe-area-inset-bottom)] lg:hidden">
        {NAV.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => go(id)}
            aria-current={page === id ? 'page' : undefined}
            className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium ${
              page === id ? 'text-brand-600' : 'text-ink-500'
            }`}
          >
            <Icon size={20} /> {label}
          </button>
        ))}
      </nav>
    </div>
  );
}
