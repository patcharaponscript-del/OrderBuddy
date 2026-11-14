import { useState } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { AlertTriangle, Check, CheckCircle2, Copy, MinusCircle, ShieldAlert, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { FieldStatus, OverallStatus } from '../types';

export const inputCls =
  'w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-ink-200 bg-white p-4 sm:p-6 ${className}`}>{children}</section>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink-700">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-xs text-ink-500">{hint}</span>}
    </label>
  );
}

type Variant = 'primary' | 'secondary' | 'ghost';
const variants: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white hover:bg-brand-700 disabled:bg-ink-200 disabled:text-ink-400',
  secondary: 'border border-ink-200 bg-white text-ink-700 hover:bg-ink-50',
  ghost: 'text-ink-500 hover:bg-ink-50 hover:text-ink-900',
};

export function Btn({
  variant = 'secondary',
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }
}

export function CopyButton({ text, label = 'คัดลอก' }: { text: string; label?: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'fail'>('idle');
  const onClick = async () => {
    const ok = await copyText(text);
    setState(ok ? 'done' : 'fail');
    window.setTimeout(() => setState('idle'), 1800);
  };
  return (
    <Btn variant="secondary" onClick={onClick} className="min-h-[40px] px-3">
      {state === 'done' ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
      {state === 'done' ? 'คัดลอกแล้ว' : state === 'fail' ? 'คัดลอกไม่ได้' : label}
    </Btn>
  );
}

export function EmptyState({ icon: Icon, title, text }: { icon: LucideIcon; title: string; text: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-ink-200 bg-ink-50/60 px-6 py-10 text-center">
      <div className="mb-3 rounded-full bg-brand-50 p-3 text-brand-600">
        <Icon size={22} />
      </div>
      <p className="font-semibold text-ink-900">{title}</p>
      <p className="mt-1 max-w-sm text-sm text-ink-500">{text}</p>
    </div>
  );
}

const fieldStyle: Record<FieldStatus, { cls: string; text: string; Icon: LucideIcon }> = {
  match: { cls: 'bg-emerald-50 text-emerald-700', text: 'ตรงกัน', Icon: CheckCircle2 },
  mismatch: { cls: 'bg-red-50 text-red-700', text: 'ไม่ตรงกัน', Icon: XCircle },
  conflict: { cls: 'bg-amber-50 text-amber-800', text: 'ข้อมูลขัดแย้ง', Icon: AlertTriangle },
  missing: { cls: 'bg-ink-100 text-ink-700', text: 'ข้อมูลไม่ครบ', Icon: MinusCircle },
};

export function FieldBadge({ status }: { status: FieldStatus }) {
  const { cls, text, Icon } = fieldStyle[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <Icon size={14} />
      {text}
    </span>
  );
}

export const overallStyle: Record<OverallStatus, { cls: string; Icon: LucideIcon }> = {
  review: { cls: 'border-red-200 bg-red-50 text-red-800', Icon: ShieldAlert },
  incomplete: { cls: 'border-amber-200 bg-amber-50 text-amber-900', Icon: AlertTriangle },
  consistent: { cls: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: CheckCircle2 },
};

export function DemoBadge() {
  return (
    <span className="inline-flex items-center rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
      โหมดเดโม · ไม่ได้เชื่อมต่อ AI จริง
    </span>
  );
}
