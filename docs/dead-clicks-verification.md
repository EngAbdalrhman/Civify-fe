# Dead Clicks & Hydration — Verification Checklist

Use this doc after deploying UX fixes to production (or the URL Microsoft Clarity tracks).

## Baseline (May 15, 2026)

| Metric | Value | Source |
|--------|-------|--------|
| Dead click rate | **29.24%** (1374 / 4699 sessions) | Clarity dashboard export |
| Rage click rate | **2.13%** | Clarity dashboard export |
| React hydration (#418) | 34 events / 25 users | Sentry CIVIFY-5, 7, 15 |
| DOM removeChild / insertBefore | 31 events / 15 users | Sentry CIVIFY-10, 11, 13 |
| iOS upload stack overflow | 20 events / 4 users | Sentry CIVIFY-F |
| Help page rage clicks | Edge / Windows | Sentry CIVIFY-R |

## Post-deploy comparison

### Clarity

1. Open [Clarity](https://clarity.microsoft.com/) → Civify project.
2. Date range: **last 7–14 days** after deploy.
3. Export Dashboard → note **Dead click %** and **Rage click %**.
4. Open **Dead clicks** → top URLs; expect lower share on `/app/upload`, `/app/resume-builder`.

**Target:** dead clicks **&lt; 15%** of sessions (stretch goal over 2 weeks).

### Sentry

Filter issues **CIVIFY-5, 7, 10, 11, 13, F, R** from deploy date → today.

**Target:** **&gt; 50%** reduction in event volume on upload and resume-builder routes.

### Manual smoke (5 min)

- [ ] `/app/upload` — centered tour modal on first visit; **Start tour** / **Not now**; Tour button on all steps.
- [ ] `/app/help` — Quick Start / Features / Account cards scroll to sections.
- [ ] Toggle theme — no hydration warning in console.
- [ ] Arabic locale — navbar date renders after mount without mismatch.
- [ ] iOS Safari — upload step 1 → 2 with a PDF (no freeze / stack overflow).

## Code changes (UX patch + follow-ups)

### Core UX patch

- `ENABLE_GUIDED_TOURS: true` + `TOUR_PROMPT_BEFORE_START` — centered modal on first visit (no auto overlay).
- Auto-start overlay disabled on upload steps 2–4 (manual Tour button on every step).
- Removed global `scrollIntoView` prototype patch in `TourContext`.
- Navbar date and footer year gated behind client mount.
- `translate="no"` on authenticated app shell.
- `usePreviewScale`: debounced observers, no 500ms polling interval.
- Route error boundaries on upload and resume-builder.
- Upload: in-flight guard + input reset after file pick (CIVIFY-F).

### Follow-ups

- Tour prompt: `localStorage` dismiss, timer cleared on dismiss/start.
- Public `translate="no"` on marketing `<main>` and blog article bodies.
- Safe JSON-LD via `sanitizeJsonLd` / `<JsonLd />` on all structured-data pages.
- LCP: `display: "swap"` + preload on Geist Sans.

### Still manual / out of band

- **Clarity/Sentry export** — compare metrics using the table above after deploy.
- **LCP &lt; 2.5s** — may need hero imagery, CDN, or server TTFB work beyond font swap.
- **Blog traffic** — public blog endpoints + sitemap (separate initiative).
