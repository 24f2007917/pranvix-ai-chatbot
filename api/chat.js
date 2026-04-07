const https = require('https');

function callGroq(systemPrompt, messages, apiKey) {
  return new Promise((resolve, reject) => {
    const formattedMessages = [
      { role: 'system', content: systemPrompt },
      ...messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }))
    ];

    const payload = JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: formattedMessages,
      max_tokens: 1000,
      temperature: 0.7
    });

    const options = {
      hostname: 'api.groq.com',
      path    : '/openai/v1/chat/completions',
      method  : 'POST',
      headers : {
        'Content-Type'  : 'application/json',
        'Authorization' : `Bearer ${apiKey}`,
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

module.exports = async function(req, res) {
  // Vercel automatically parses req.body for us
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Pull the API key from Vercel's secure environment variables
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: { message: "API key missing in Vercel settings" }});
  }

  try {
    const body = req.body;
    const result = await callGroq(body.system, body.messages, apiKey);

    if (result.status !== 200 || result.body.error) {
      return res.status(result.status || 500).json({ error: { message: result.body.error?.message || 'Groq API error' } });
    }

    const replyText = result.body.choices?.[0]?.message?.content || 'No response from AI.';

    res.status(200).json({
      content: [{ text: replyText }],
      usage: {
        input_tokens: result.body.usage?.prompt_tokens || 0,
        output_tokens: result.body.usage?.completion_tokens || 0
      }
    });
  } catch (err) {
    res.status(500).json({ error: { message: err.message } });
  }
};