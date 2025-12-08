

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

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

