<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/19r8FxHZi-UG92yFirr_VRvCr3LhLMQ6Y

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## PWA / Android (installable offline)

This project is configured as a Progressive Web App (PWA). You can install it on Android devices and the app will work offline using a service worker.

To build and install locally:

```bash
npm install
npm run build
# Serve the `dist` directory (e.g. with a static server) and open in Chrome on Android
npm install -g serve
serve dist
```

Then open the site in Chrome on your Android device, choose "Install app" from the browser menu, and the app will be available offline.

Security note: the repository previously injected `GEMINI_API_KEY` into the client bundle. Do not expose secrets in the client. Move any private keys to a server-side endpoint if needed.

## Server-side proxy for private APIs (example)

If your app needs to call a private API (like Gemini) you must NOT include the API key in the client bundle. Instead, create a server-side endpoint that stores the key in environment variables and proxies requests.

An example serverless handler is provided at `api/gemini-proxy.js`. Deploy it to a serverless host (Vercel/Netlify) and set the `GEMINI_API_KEY` in the host's environment settings. Then call your serverless endpoint from the frontend (e.g., `fetch('/api/gemini-proxy', { method: 'POST', body: JSON.stringify(payload) })`).

Do not add `GEMINI_API_KEY` to any client-side config or `vite.config.ts`.
