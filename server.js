/**
 * Pranvix - AI Chatbot | Local Server
 * Team: Pratiksha, Anvesha Chauhan, Ujjwal Singh
 * BBDU | B.Tech CSE AI&B 1-A | Java Fundamentals
 */

const GROQ_API_KEY = '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';

// ─────────────────────────────────────────────────────────────
const http  = require('http');
const fs    = require('fs');
const path  = require('path');
const https = require('https');

const PORT = 3000;

const MIME = {
  '.html' : 'text/html',
  '.css'  : 'text/css',
  '.js'   : 'application/javascript',
  '.json' : 'application/json',
  '.png'  : 'image/png',
  '.jpg'  : 'image/jpeg',
  '.ico'  : 'image/x-icon',
  '.svg'  : 'image/svg+xml',
  '.ttf'  : 'font/ttf',
  '.woff2': 'font/woff2',
};

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end',  () => resolve(body));
    req.on('error', reject);
  });
}

function callGroq(systemPrompt, messages) {
  return new Promise((resolve, reject) => {

    // 1. Format messages for Groq (OpenAI Standard Format)
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    // 2. Build the payload
    const payload = JSON.stringify({
      model: 'llama-3.1-8b-instant', // A fast, standard Groq model
      messages: formattedMessages,
      max_tokens: 1000,
      temperature: 0.7
    });

    // 3. Set up the HTTPS request to Groq's endpoint
    const options = {
      hostname: 'api.groq.com',
      path    : '/openai/v1/chat/completions',
      method  : 'POST',
      headers : {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${GROQ_API_KEY}`,
        'Content-Length': Buffer.byteLength(payload)
      }
    };

    const apiReq = https.request(options, apiRes => {
      let body = '';
      apiRes.on('data', chunk => body += chunk);
      apiRes.on('end', () => {
        try   { resolve({ status: apiRes.statusCode, body: JSON.parse(body) }); }
        catch { resolve({ status: apiRes.statusCode, body }); }
      });
    });

    apiReq.on('error', reject);
    apiReq.write(payload);
    apiReq.end();
  });
}

const server = http.createServer(async (req, res) => {

  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // ── POST /api/chat ────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/chat') {
    try {
      const bodyStr = await readBody(req);
      const body    = JSON.parse(bodyStr);

      const result = await callGroq(body.system, body.messages);

      if (result.status !== 200 || result.body.error) {
        const errMsg = result.body.error?.message || 'Groq API error';
        res.writeHead(result.status || 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: { message: errMsg } }));
        return;
      }

      // 4. Parse the Groq response
      const replyText = result.body.choices?.[0]?.message?.content || 'No response from AI.';

      // 5. Send back in the exact format the frontend expects
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        content: [{ text: replyText }],
        usage  : {
          input_tokens : result.body.usage?.prompt_tokens || 0,
          output_tokens: result.body.usage?.completion_tokens || 0
        }
      }));

    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: { message: err.message } }));
    }
    return;
  }

  // ── Static files ──────────────────────────────────────────
  let urlPath    = req.url === '/' ? '/login.html' : req.url.split('?')[0];
  const filePath    = path.join(__dirname, urlPath);
  const ext         = path.extname(filePath).toLowerCase();
  const contentType = MIME[ext] || 'text/plain';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/html' });
      res.end(`<h2 style="font-family:sans-serif;padding:40px;color:red">404 — File not found: ${urlPath}</h2>`);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-cache' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('\n╔══════════════════════════════════════════╗');
  console.log('║       🤖  PRANVIX AI CHATBOT              ║');
  console.log('║   BBDU | B.Tech CSE AI&B 1-A             ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log('║  ✅  Groq API Key loaded                  ║');
  console.log(`║  ✅  Server running → port ${PORT}           ║`);
  console.log(`║  👉  Open: http://localhost:${PORT}          ║`);
  console.log('║  🛑  Stop: Press Ctrl + C                 ║');
  console.log('╚══════════════════════════════════════════╝\n');
});