import type { ReactNode } from 'react';

export type Tone = 'ok' | 'warn' | 'bad' | 'muted';

const TONE_CLASS: Record<Tone, string> = {
  ok: 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300',
  warn: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  bad: 'border-red-400/40 bg-red-400/10 text-red-300',
  muted: 'border-slate-600/40 bg-slate-500/10 text-slate-400',
};

export function Badge({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="panel">
      <p className="panel-title mb-3">{title}</p>
      {children}
    </div>
  );
}

export function HeadersInput({
  value,
  onChange,
  placeholder,
  rows = 8,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      spellCheck={false}
      autoComplete="off"
      placeholder={placeholder}
      className="w-full resize-y rounded-lg border border-emerald-500/20 bg-black/50 px-3 py-2 font-mono text-xs text-emerald-200 outline-none focus:border-emerald-400/50"
    />
  );
}
