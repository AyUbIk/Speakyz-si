# Speakyz-site

Static landing page for Speakyz English school.

## Local preview

```bash
npm install
npm run build
npm start
```

Then open: http://localhost:10000

## Deploy on GitHub Pages + Cloudflare Worker

1. Push this repository to GitHub.
2. Publish the static site on GitHub Pages.
3. Create a Cloudflare Worker from the `worker/` folder.
4. Set the Worker secret:
   - `GEMINI_API_KEY`
5. Set the Worker vars:
   - `ALLOWED_ORIGINS = "https://ayubik.github.io"`
   - optional: `SPEAKYZ_MODEL = "gemini-2.5-flash"`
   - optional: `GEMINI_THINKING = "low"`
6. In the static site, set the API endpoint before the AI scripts run:

```html
<script>
  window.SPEAKYZ_API_URL = 'https://speakyz-api.ayubik.workers.dev';
</script>
```

7. If the site is hosted on Cloudflare Pages instead of GitHub Pages, add the Pages origin to `ALLOWED_ORIGINS`.

## Why this works

This app serves a static `index.html` file and uses a separate Cloudflare Worker for the Gemini API. GitHub Pages cannot run serverless functions, so the AI chat must call a Worker endpoint instead of `/.netlify/functions/...`.
