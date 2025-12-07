// Example serverless proxy for Gemini API requests.
// Deploy this file to a serverless platform (Vercel/Netlify) or run as a small Node server.
// It expects `GEMINI_API_KEY` to be set as a server environment variable.

const fetch = require('node-fetch');

module.exports = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'Server missing GEMINI_API_KEY' });
      return;
    }

    // Adjust the target URL and request shape to match how you call Gemini.
    const targetUrl = 'https://api.gemini.example/v1/endpoint';

    // Forward body and headers as needed — this is a simple passthrough example.
    const response = await fetch(targetUrl, {
      method: req.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: req.method === 'GET' ? undefined : JSON.stringify(req.body)
    });

    const data = await response.text();
    res.status(response.status).send(data);
  } catch (err) {
    console.error('Proxy error', err);
    res.status(500).json({ error: 'Proxy failed' });
  }
};
