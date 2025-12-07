// Netlify Functions handler for proxying Gemini API requests
// Place this file at `netlify/functions/gemini-proxy.js` and deploy to Netlify.

const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Server missing GEMINI_API_KEY' }) };
    }

    const targetUrl = 'https://api.gemini.example/v1/endpoint';

    const response = await fetch(targetUrl, {
      method: event.httpMethod || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: event.httpMethod === 'GET' ? undefined : event.body
    });

    const data = await response.text();
    return { statusCode: response.status, body: data };
  } catch (err) {
    console.error('Proxy error', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Proxy failed' }) };
  }
};
