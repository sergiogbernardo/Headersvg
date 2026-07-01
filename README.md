# Headersvg

Client-side security-header auditor. Paste the HTTP response headers (or a
Content-Security-Policy) and get a graded report of what is present, weak or
missing — **entirely in the browser**. There is no backend.

Part of the [project hub](https://sabion.io/), alongside
[Bytevg](https://sabion.io/Bytevg/),
[Loghivevg](https://sabion.io/Loghivevg/) and
[Scanvg](https://sabion.io/Scanvg/).

## Modules

- **Response headers** — paste raw HTTP response headers and see, per header,
  whether it is present, weak or missing, with a short explanation.
- **CSP policy** — parse a Content-Security-Policy, explain each directive and
  flag risky values (`unsafe-inline`, `unsafe-eval`, wildcards).
- **Security score** — an overall grade covering HSTS, CSP, X-Frame-Options,
  X-Content-Type-Options, Referrer-Policy and Permissions-Policy.
- **Reference** — the purpose and recommended value of each security header,
  ready to copy.

## Stack

React + TypeScript + Vite + Tailwind. Header parsing and scoring are plain
TypeScript. No backend, no tracking.

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build      # outputs to dist/
npm run preview
```

The Vite `base` is `/Headersvg/` to match GitHub Pages. Deployment is automated
by `.github/workflows/deploy.yml` on every push to `main`.
