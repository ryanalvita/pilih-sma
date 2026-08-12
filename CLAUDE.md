# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

PilihSMA: a static Astro site that lets people compare SNBP (Seleksi Nasional Berdasarkan
Prestasi) university-acceptance results across SMAs. Data currently covers Kota Bandung only —
that's where the project started (see `/about`), not a hard scope; it's meant to expand to other
cities over time. Built on top of the "Astro Base" template (Astro + Tailwind v4 + astro-icon +
sitemap), which is where the generic SEO/a11y/nav scaffolding comes from.

## Commands

```bash
npm run dev            # http://localhost:4321
npm run build           # static build to dist/
npm run preview         # preview the production build
python3 parse.py        # regenerate the site's data from raw_data.tsv (see caveat below)
```

There is no test suite.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`,
`chore:`, `docs:`, `refactor:`, etc.) for every commit message in this repo — including
ones written on the user's behalf. Keep the subject line imperative and scoped to one
logical change; put rationale/context in the body when it's not obvious from the diff.

**`npm run lint` and `npm run format`/`format:check` are currently broken** — the scripts exist in
`package.json` but there is no ESLint config (`.eslintrc*`) or Prettier config (`.prettierrc*`) in
the repo, so both fail immediately with "couldn't find a configuration file". `npm run type-check`
(`astro check`) also isn't usable out of the box — `@astrojs/check` isn't installed, and it will
prompt to install it interactively. Don't assume any of these run clean; `astro build` is the
reliable way to catch type/template errors.

## Data pipeline — read this before touching data

`raw_data.tsv` is the hand-edited source of truth (one row per school+year, one column per
university, edited via Google Sheets and exported as TSV). `parse.py` turns it into the
normalized JSON the site actually reads.

**Known bug in the documented workflow:** `parse.py` writes to `data.json` in the repo root, but
the site imports `src/data/snbp.json` (via `src/data/index.ts`), and the README's "Update data"
steps say to just run `python3 parse.py`. Running it as documented does **not** update the file
the site reads — the output has to be manually moved/renamed to `src/data/snbp.json` afterwards.
If you're asked to add a data-update step or fix the data pipeline, this mismatch is almost
certainly why "the data didn't change."

Each record's `hasBreakdown` flag matters semantically: it distinguishes "this university had 0
acceptances" (breakdown known, university just absent from the `universities` map) from "we don't
know the per-university split" (`hasBreakdown: false`, `accepted` may still hold a known total).
Never collapse the second case into a zero — it misrepresents unknown data as "didn't get in
anywhere."

## Deployment

Deployed to GitHub Pages via `.github/workflows/deploy.yml` on every push to `main`. The site
lives at its own custom domain, `pilihsma.ryanalvita.com` (not a `ryanalvita.com/pilih-sma/`
project-page path anymore). Three parts have to stay in sync if this ever changes:

- DNS: CNAME record `pilihsma.ryanalvita.com` -> `ryanalvita.github.io`.
- GitHub repo Settings -> Pages -> "Custom domain" = `pilihsma.ryanalvita.com`, with "Enforce
  HTTPS" ticked once DNS verification passes (can take a while to propagate).
- Code: `public/CNAME` (must contain `pilihsma.ryanalvita.com` and stay committed, or GitHub
  Pages resets the custom domain on the next deploy) and `src/config/site.mjs`
  (`url: "https://pilihsma.ryanalvita.com"`, `base: "/"` — `astro.config.mjs` reads `base` from
  here). If `base` and the actual serving path ever disagree, assets/links break.

## Architecture

- `src/data/index.ts` is the single data-access layer — all pages go through it (`schoolSummaries`,
  `recordsForSchool`, `universityAcceptedByYear`/`itbByYear`, `topUniversities`,
  `rankedUniversities`) rather than importing `snbp.json` directly. `YEARS` (`[2024, 2025, 2026]`)
  is defined here and drives every year-column loop across pages.
- `src/pages/schools/[slug].astro` is a static-paths page (`getStaticPaths` over `ALL_SCHOOLS`) —
  one prerendered page per school, not a dynamic route.
- `src/pages/index.astro` does most of the site's real interactive work despite being a static
  Astro page: search, the university filter, and column sorting are all client-side. The
  per-school/per-year/per-university dataset needed for that is computed once in frontmatter and
  handed to the browser via `<script define:vars={{ tableData, YEARS }}>` (Astro serializes the
  vars into the inline script — no separate JSON fetch). That script owns re-rendering the year
  cells and the trend sparkline and re-sorting the `<tr>`s in place; it does not touch the search
  logic's row-hiding, which stays independent (search only sets `row.hidden`).
- The trend column in that table is a small inline-SVG sparkline scaled **per school** (local
  min/max across that row's own years), not against a global max — the intent is to show the
  shape of change, since the numeric year columns already carry magnitude. Keep that in mind if
  extending it; scaling it globally would flatten small schools' lines back into unreadable noise.
- `src/components/SubmitDataForm.astro` posts directly to Web3Forms from its own inline script; it
  does not use `src/utils/validation.ts` or `src/utils/errors.ts`. Those two files plus
  `src/components/ContactForm.astro` and the `ContactFormData` type in `src/types/astro.d.ts` are
  unused leftovers from the base template — don't assume something imports them.
- `src/config/site.mjs` (`SITE`) is the one place for title/description/URL/author and the
  Web3Forms access key; `src/layouts/Layout.astro` reads it for all SEO/OG/Twitter meta tags.
  Leaving `web3formsAccessKey` empty is intentional/supported — the submit form renders a visible
  "not configured yet" warning instead of failing, so the site is safe to deploy before setting it
  up.
