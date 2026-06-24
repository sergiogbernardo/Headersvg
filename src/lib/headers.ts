// Knowledge base and scoring for HTTP security headers. Everything is plain
// TypeScript — parsing and grading happen entirely in the browser.

export type Status = 'ok' | 'weak' | 'missing';
export type Severity = 'high' | 'medium' | 'low';

export interface HeaderRule {
  key: string;
  name: string;
  severity: Severity;
  description: string;
  recommended: string;
  evaluate: (value: string | null) => { status: Status; note: string };
}

const HSTS_MIN_AGE = 15_552_000; // 180 days

export const RULES: HeaderRule[] = [
  {
    key: 'strict-transport-security',
    name: 'Strict-Transport-Security',
    severity: 'high',
    description: 'Força o navegador a usar HTTPS, evitando downgrade e ataques man-in-the-middle.',
    recommended: 'max-age=31536000; includeSubDomains; preload',
    evaluate: (v) => {
      if (!v) return { status: 'missing', note: 'Ausente — conexões podem ser rebaixadas para HTTP.' };
      const seconds = Number(/max-age=(\d+)/i.exec(v)?.[1] ?? 0);
      if (seconds < HSTS_MIN_AGE)
        return { status: 'weak', note: `max-age=${seconds} é baixo (recomendado ≥ ${HSTS_MIN_AGE}).` };
      if (!/includeSubDomains/i.test(v))
        return { status: 'weak', note: 'Considere adicionar includeSubDomains.' };
      return { status: 'ok', note: 'Configuração forte.' };
    },
  },
  {
    key: 'content-security-policy',
    name: 'Content-Security-Policy',
    severity: 'high',
    description: 'Principal defesa contra XSS e injeção: controla de onde recursos podem ser carregados.',
    recommended: "default-src 'self'; object-src 'none'; frame-ancestors 'none'",
    evaluate: (v) => {
      if (!v) return { status: 'missing', note: 'Sem CSP — a principal defesa contra XSS está ausente.' };
      if (/unsafe-inline|unsafe-eval/i.test(v))
        return { status: 'weak', note: "Presente, mas usa unsafe-inline/unsafe-eval — veja a aba CSP." };
      return { status: 'ok', note: 'Presente — veja a aba CSP para a análise detalhada.' };
    },
  },
  {
    key: 'x-frame-options',
    name: 'X-Frame-Options',
    severity: 'medium',
    description: 'Impede que a página seja embutida em iframes (clickjacking).',
    recommended: 'DENY',
    evaluate: (v) => {
      if (!v) return { status: 'missing', note: 'Ausente — use DENY/SAMEORIGIN ou CSP frame-ancestors.' };
      if (/deny|sameorigin/i.test(v)) return { status: 'ok', note: 'Proteção contra clickjacking ativa.' };
      return { status: 'weak', note: 'Valor não reconhecido.' };
    },
  },
  {
    key: 'x-content-type-options',
    name: 'X-Content-Type-Options',
    severity: 'medium',
    description: 'Impede o navegador de "adivinhar" (MIME sniffing) o tipo de conteúdo.',
    recommended: 'nosniff',
    evaluate: (v) => {
      if (!v) return { status: 'missing', note: 'Ausente — adicione nosniff.' };
      if (/nosniff/i.test(v)) return { status: 'ok', note: 'MIME sniffing desativado.' };
      return { status: 'weak', note: 'Valor inesperado (use nosniff).' };
    },
  },
  {
    key: 'referrer-policy',
    name: 'Referrer-Policy',
    severity: 'medium',
    description: 'Controla quanta informação de origem é enviada no header Referer.',
    recommended: 'strict-origin-when-cross-origin',
    evaluate: (v) => {
      if (!v) return { status: 'missing', note: 'Ausente — URLs completas podem vazar via Referer.' };
      if (/unsafe-url/i.test(v)) return { status: 'weak', note: 'unsafe-url vaza a URL completa.' };
      return { status: 'ok', note: 'Política de referrer definida.' };
    },
  },
  {
    key: 'permissions-policy',
    name: 'Permissions-Policy',
    severity: 'low',
    description: 'Restringe o acesso a recursos do navegador (câmera, geolocalização, etc.).',
    recommended: 'geolocation=(), camera=(), microphone=()',
    evaluate: (v) =>
      v
        ? { status: 'ok', note: 'Recursos do navegador restritos.' }
        : { status: 'missing', note: 'Ausente — recursos sensíveis ficam liberados por padrão.' },
  },
  {
    key: 'cross-origin-opener-policy',
    name: 'Cross-Origin-Opener-Policy',
    severity: 'low',
    description: 'Isola o contexto de navegação de outras origens (proteção contra XS-Leaks).',
    recommended: 'same-origin',
    evaluate: (v) => {
      if (!v) return { status: 'missing', note: 'Ausente — considere same-origin.' };
      if (/same-origin/i.test(v)) return { status: 'ok', note: 'Contexto isolado.' };
      return { status: 'weak', note: 'Isolamento parcial.' };
    },
  },
];

export interface LeakyHeader {
  key: string;
  name: string;
  note: string;
}

export const LEAKY_HEADERS: LeakyHeader[] = [
  { key: 'server', name: 'Server', note: 'Revela o servidor e, às vezes, a versão.' },
  { key: 'x-powered-by', name: 'X-Powered-By', note: 'Revela a tecnologia/versão do backend.' },
  { key: 'x-aspnet-version', name: 'X-AspNet-Version', note: 'Revela a versão do ASP.NET.' },
  { key: 'x-aspnetmvc-version', name: 'X-AspNetMvc-Version', note: 'Revela a versão do ASP.NET MVC.' },
];

export interface HeaderResult {
  rule: HeaderRule;
  value: string | null;
  status: Status;
  note: string;
}

export interface LeakResult {
  name: string;
  value: string;
  note: string;
}

export interface Analysis {
  results: HeaderResult[];
  leaks: LeakResult[];
  score: number;
  grade: string;
  present: number;
  total: number;
}

export function parseHeaders(raw: string): Map<string, string> {
  const map = new Map<string, string>();
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || /^HTTP\//i.test(trimmed)) continue;
    const idx = trimmed.indexOf(':');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim().toLowerCase();
    const value = trimmed.slice(idx + 1).trim();
    if (!key) continue;
    const existing = map.get(key);
    map.set(key, existing ? `${existing}, ${value}` : value);
  }
  return map;
}

const WEIGHT: Record<Severity, number> = { high: 3, medium: 2, low: 1 };

function grade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 85) return 'A';
  if (score >= 70) return 'B';
  if (score >= 55) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

export function analyze(raw: string): Analysis {
  const map = parseHeaders(raw);

  const results: HeaderResult[] = RULES.map((rule) => {
    const value = map.get(rule.key) ?? null;
    const { status, note } = rule.evaluate(value);
    return { rule, value, status, note };
  });

  let earned = 0;
  let max = 0;
  for (const result of results) {
    const weight = WEIGHT[result.rule.severity];
    max += weight;
    if (result.status === 'ok') earned += weight;
    else if (result.status === 'weak') earned += weight * 0.5;
  }

  const leaks: LeakResult[] = LEAKY_HEADERS.flatMap((leaky) => {
    const value = map.get(leaky.key);
    return value != null ? [{ name: leaky.name, value, note: leaky.note }] : [];
  });

  let score = max > 0 ? (earned / max) * 100 : 0;
  score = Math.max(0, score - leaks.length * 4);

  const present = results.filter((r) => r.status !== 'missing').length;

  return {
    results,
    leaks,
    score: Math.round(score),
    grade: grade(score),
    present,
    total: results.length,
  };
}
