const express = require('express');
const path = require('path');
const { handler } = require('./chat.js');

const app = express();
const PORT = process.env.PORT || 10000;
const publicDir = path.join(__dirname, 'public');

app.use(express.json({ limit: '1mb' }));

app.post('/api/chat', async (req, res) => {
  try {
    const event = {
      httpMethod: 'POST',
      headers: {
        'x-nf-client-connection-ip': req.ip,
        'x-forwarded-for': req.ip,
      },
      body: JSON.stringify(req.body || {}),
    };

    const result = await handler(event);
    const payload = typeof result.body === 'string' ? JSON.parse(result.body) : result.body;

    res.status(result.statusCode || 200).json(payload);
  } catch (error) {
    console.error('API chat error:', error);
    res.status(500).json({ error: 'server_error' });
  }
});

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
