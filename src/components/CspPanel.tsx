import { useMemo, useState } from 'react';
import { parseCsp, type FindingLevel } from '../lib/csp';
import { Badge, HeadersInput, Section, type Tone } from './ui';

const PLACEHOLDER =
  "default-src 'self'; script-src 'self' 'unsafe-inline'; img-src * data:; object-src 'none'";

const LEVEL_TONE: Record<FindingLevel, Tone> = { high: 'bad', medium: 'warn', low: 'muted' };

// Accept either a bare policy or a full "content-security-policy: ..." header line.
function extractPolicy(raw: string): string {
  const match = /content-security-policy(?:-report-only)?\s*:\s*(.+)/is.exec(raw);
  return (match ? match[1] : raw).trim();
}

export default function CspPanel() {
  const [input, setInput] = useState('');
  const analysis = useMemo(() => {
    const policy = extractPolicy(input);
    return policy ? parseCsp(policy) : null;
  }, [input]);

  return (
    <div className="space-y-4">
      <Section title="Content-Security-Policy">
        <HeadersInput value={input} onChange={setInput} placeholder={PLACEHOLDER} rows={5} />
        <p className="mt-2 font-mono text-xs text-slate-500">
          Cole a política (ou a linha inteira do header). Análise 100% local.
        </p>
      </Section>

      {analysis && (
        <>
          <Section title={`Achados (${analysis.findings.length})`}>
            {analysis.findings.length === 0 ? (
              <p className="text-sm text-emerald-300">
                Nenhum problema comum encontrado nas verificações aplicadas.
              </p>
            ) : (
              <div className="space-y-2">
                {analysis.findings.map((f, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge tone={LEVEL_TONE[f.level]}>{f.level}</Badge>
                    <span className="text-sm text-slate-300">{f.message}</span>
                  </div>
                ))}
              </div>
            )}
          </Section>

          <Section title="Diretivas">
            <div className="space-y-2">
              {analysis.directives.map((d) => (
                <div key={d.name} className="border-b border-emerald-500/10 pb-2 last:border-0">
                  <span className="font-mono text-sm text-emerald-300">{d.name}</span>
                  <p className="mt-0.5 break-all font-mono text-xs text-slate-400">
                    {d.sources.join(' ') || '(sem fontes)'}
                  </p>
                </div>
              ))}
            </div>
          </Section>
        </>
      )}
    </div>
  );
}
