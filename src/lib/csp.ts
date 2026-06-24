// Content-Security-Policy parser and risk analysis. Plain TypeScript, runs in
// the browser.

export type FindingLevel = 'high' | 'medium' | 'low';

export interface CspDirective {
  name: string;
  sources: string[];
}

export interface CspFinding {
  level: FindingLevel;
  message: string;
}

export interface CspAnalysis {
  directives: CspDirective[];
  findings: CspFinding[];
}

export function parseCsp(value: string): CspAnalysis {
  const directives: CspDirective[] = value
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [name, ...sources] = part.split(/\s+/);
      return { name: name.toLowerCase(), sources };
    });

  return { directives, findings: analyzeDirectives(directives) };
}

function analyzeDirectives(directives: CspDirective[]): CspFinding[] {
  const findings: CspFinding[] = [];
  const byName = new Map(directives.map((d) => [d.name, d.sources]));
  const scriptSrc = byName.get('script-src') ?? byName.get('default-src');

  if (!byName.has('default-src') && !byName.has('script-src')) {
    findings.push({ level: 'high', message: 'Sem default-src nem script-src: scripts ficam sem restrição.' });
  }
  if (scriptSrc?.some((s) => /^'unsafe-inline'$/i.test(s))) {
    findings.push({ level: 'high', message: "script-src usa 'unsafe-inline', anulando boa parte da proteção contra XSS." });
  }
  if (scriptSrc?.some((s) => /^'unsafe-eval'$/i.test(s))) {
    findings.push({ level: 'medium', message: "script-src usa 'unsafe-eval', permitindo eval()." });
  }
  if (scriptSrc?.some((s) => s === 'data:' || s === '*')) {
    findings.push({ level: 'medium', message: 'script-src permite data: ou * — fontes amplas demais.' });
  }
  for (const directive of directives) {
    if (directive.sources.includes('*')) {
      findings.push({ level: 'low', message: `${directive.name} usa o curinga * (qualquer origem).` });
    }
  }
  const objectSrc = byName.get('object-src');
  if (!objectSrc || !objectSrc.some((s) => /^'none'$/i.test(s))) {
    findings.push({ level: 'low', message: "Defina object-src 'none' para bloquear plugins legados." });
  }
  if (!byName.has('frame-ancestors')) {
    findings.push({ level: 'low', message: 'Sem frame-ancestors: a proteção moderna contra clickjacking está ausente.' });
  }
  if (!byName.has('base-uri')) {
    findings.push({ level: 'low', message: "Sem base-uri: considere base-uri 'none' ou 'self'." });
  }

  return findings;
}
