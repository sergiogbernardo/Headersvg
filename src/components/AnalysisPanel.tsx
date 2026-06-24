import { useMemo, useState } from 'react';
import { analyze, type Status } from '../lib/headers';
import { Badge, HeadersInput, Section, type Tone } from './ui';

const PLACEHOLDER = `cole os headers de resposta, ex.:

HTTP/2 200
strict-transport-security: max-age=63072000; includeSubDomains
content-security-policy: default-src 'self'
x-content-type-options: nosniff`;

const STATUS_TONE: Record<Status, Tone> = { ok: 'ok', weak: 'warn', missing: 'bad' };
const STATUS_LABEL: Record<Status, string> = { ok: 'ok', weak: 'fraco', missing: 'ausente' };

function gradeColor(grade: string): string {
  if (grade.startsWith('A')) return 'text-emerald-300';
  if (grade === 'B') return 'text-emerald-400';
  if (grade === 'C') return 'text-amber-300';
  if (grade === 'D') return 'text-amber-400';
  return 'text-red-400';
}

export default function AnalysisPanel() {
  const [input, setInput] = useState('');
  const analysis = useMemo(() => (input.trim() ? analyze(input) : null), [input]);

  return (
    <div className="space-y-4">
      <Section title="Headers de resposta">
        <HeadersInput value={input} onChange={setInput} placeholder={PLACEHOLDER} />
        <p className="mt-2 font-mono text-xs text-slate-500">
          Cole a saída de <code className="text-emerald-300">curl -I</code> ou a aba Network do
          DevTools. Tudo é analisado localmente.
        </p>
      </Section>

      {analysis && (
        <>
          <Section title="Nota de segurança">
            <div className="flex items-center gap-5">
              <span className={`font-display text-5xl font-bold ${gradeColor(analysis.grade)}`}>
                {analysis.grade}
              </span>
              <div className="font-mono text-xs text-slate-400">
                <p>
                  <span className="text-emerald-300">{analysis.score}</span>/100
                </p>
                <p>
                  {analysis.present}/{analysis.total} headers presentes
                </p>
                {analysis.leaks.length > 0 && (
                  <p className="text-amber-300">{analysis.leaks.length} header(s) que vazam info</p>
                )}
              </div>
            </div>
          </Section>

          <Section title="Detalhe">
            <div className="space-y-2">
              {analysis.results.map((r) => (
                <div key={r.rule.key} className="border-b border-emerald-500/10 pb-2 last:border-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm text-slate-200">{r.rule.name}</span>
                    <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                  </div>
                  <p className="mt-0.5 font-mono text-xs text-slate-500">{r.note}</p>
                </div>
              ))}
            </div>
          </Section>

          {analysis.leaks.length > 0 && (
            <Section title="Headers que expõem informação">
              <div className="space-y-2">
                {analysis.leaks.map((leak) => (
                  <div key={leak.name} className="flex flex-col gap-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-sm text-amber-300">{leak.name}</span>
                      <code className="font-mono text-xs text-slate-400">{leak.value}</code>
                    </div>
                    <p className="font-mono text-xs text-slate-500">{leak.note}</p>
                  </div>
                ))}
              </div>
            </Section>
          )}
        </>
      )}
    </div>
  );
}
