import { LEAKY_HEADERS, RULES, type Severity } from '../lib/headers';
import CopyButton from './CopyButton';
import { Badge, Section, type Tone } from './ui';

const SEVERITY_TONE: Record<Severity, Tone> = { high: 'bad', medium: 'warn', low: 'muted' };

export default function ReferencePanel() {
  return (
    <div className="space-y-4">
      <Section title="Headers de segurança">
        <div className="space-y-4">
          {RULES.map((rule) => (
            <div key={rule.key} className="border-b border-emerald-500/10 pb-4 last:border-0">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-emerald-300">{rule.name}</span>
                <Badge tone={SEVERITY_TONE[rule.severity]}>{rule.severity}</Badge>
              </div>
              <p className="mt-1 text-sm text-slate-400">{rule.description}</p>
              <div className="mt-2 flex items-start justify-between gap-2 rounded-lg border border-emerald-500/15 bg-black/40 p-2">
                <code className="break-all font-mono text-xs text-slate-300">
                  {rule.name}: {rule.recommended}
                </code>
                <CopyButton value={`${rule.name}: ${rule.recommended}`} />
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Headers a remover (vazam informação)">
        <div className="space-y-2">
          {LEAKY_HEADERS.map((leaky) => (
            <div key={leaky.key} className="flex flex-col gap-0.5">
              <span className="font-mono text-sm text-amber-300">{leaky.name}</span>
              <p className="font-mono text-xs text-slate-500">{leaky.note}</p>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
