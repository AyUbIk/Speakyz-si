# Speakyz-site

Static landing page for Speakyz English school.

## Local preview

```bash
npm install
npm run build
npm start
```

Then open: http://localhost:10000

## Deploy on Render

1. Push this repository to GitHub.
2. Create a new Web Service in Render.
3. Connect the repository `AyUbIk/Speakyz-site`.
4. Set:
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Deploy.

## Why this works

This app serves a static `index.html` file and correctly falls back to it for client-side routes, which prevents `404 Not Found` on page refresh or direct navigation.
