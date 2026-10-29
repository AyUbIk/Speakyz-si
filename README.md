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

## Notes

- This setup is for Render's Web Service because Render's Static Site flow may not accept the required build settings in your current account.
- The app serves the built static files from the `public/` folder.
