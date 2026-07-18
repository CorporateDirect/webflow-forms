# AGENTS.md

## Cursor Cloud specific instructions

This repo is `webflow-forms`: a single, browser-only JavaScript library (no backend, no
database, no server of its own). It is bundled with Webpack into `dist/webflow-forms.min.js`
(UMD, global `WebflowForms`) and loaded into a host HTML page via a `<script>` tag. It
auto-initializes on page load and enhances form fields based on `data-*` attributes.

### Build / dev / test / lint
- Build: `npm run build` (webpack production → `dist/webflow-forms.min.js`).
- Dev watch: `npm run dev` (webpack `--watch`). Caveat: watch mode writes a larger,
  development-mode bundle over the committed `dist/`. Before committing, restore/rebuild the
  production bundle (`git checkout -- dist/ && npm run build`) so you don't commit a dev build.
- Tests: none. `npm test` is the default placeholder that intentionally exits non-zero.
- Lint: none configured (no ESLint/Prettier).
- The committed `dist/` bundle is intentionally checked in (used for CDN) and is NOT gitignored.

### Running / demoing the library
- There is no dev server or `start` script. To exercise it, serve the repo root over HTTP and
  open one of the example HTML pages, e.g.:
  `python3 -m http.server 8080` then open `http://localhost:8080/your-specific-form-example.html`.
- The library ONLY enhances fields inside a `<form data-name="...">`. Bare `<form>` elements are
  ignored. Note: `examples/phone-with-country-code-injection.html` uses a bare `<form>`, so the
  library does nothing there — it is a poor smoke test. Prefer `your-specific-form-example.html`
  (root), which has `<form data-name="contact-form">` with a `data-country-code` select and a
  `data-phone-format` phone field.
- Google Places address autocomplete requires a real Google Maps API key in the host page's
  script URL (the examples ship a `YOUR_API_KEY` placeholder). It is optional — the library
  degrades gracefully, and the searchable country dropdown + phone-number formatting work
  without any key.
