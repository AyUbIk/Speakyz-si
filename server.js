const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 10000;
const publicDir = path.join(__dirname, 'public');

app.use(express.static(publicDir, {
  index: false,
  extensions: ['html']
}));

app.get('*', (req, res) => {
  res.sendFile(path.join(publicDir, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Speakyz site is running on port ${PORT}`);
});
