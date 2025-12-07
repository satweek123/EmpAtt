CI & Deployment

This project includes example workflows and scripts to help you build and deploy the site.

GitHub Actions
- `.github/workflows/ci.yml`: runs `npm ci` and `npm run build` on push/PR to `main`.
- `.github/workflows/deploy-gh-pages.yml`: builds and publishes `dist/` to GitHub Pages on push to `main`.

GitHub Pages (local deploy)

1. Install dev dependencies once (use legacy peer deps if needed):

```bash
npm install --legacy-peer-deps
```

2. Build and deploy (provided `deploy:gh-pages` script uses `gh-pages`):

```bash
npm run deploy:gh-pages
```

Vercel
- `api/gemini-proxy.js` is suitable for Vercel serverless functions. Deploy the repo to Vercel and set `GEMINI_API_KEY` in Project Settings → Environment Variables.

Netlify
- `netlify/functions/gemini-proxy.js` is a Netlify Function example. Deploy to Netlify and set `GEMINI_API_KEY` in Site Settings → Build & deploy → Environment.

Notes
- Replace demo SVG icons with proper PNG/maskable icons for better Android compatibility.
- Do not inject secret API keys into the client bundle. Use serverless functions or a backend to keep secrets safe.
