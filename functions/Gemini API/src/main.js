const https = require('https');

module.exports = async ({ req, res, log, error }) => {
  const apiKey = process.env.GOOGLE_GENAI_API_KEY;

  if (!apiKey) {
    return res.json({ error: 'Missing API Key' }, 500);
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const prompt = body.prompt || 'Olá';

    const postData = JSON.stringify({
      contents: [{
        parts: [{
          text: prompt
        }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    };

    return new Promise((resolve) => {
      const request = https.request(options, (response) => {
        let data = '';
        response.setEncoding('utf8');
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.candidates && result.candidates[0].content && result.candidates[0].content.parts[0].text) {
              resolve(res.json({
                success: true,
                text: result.candidates[0].content.parts[0].text
              }));
            } else {
              resolve(res.json({ success: false, error: 'Invalid response from Google API', details: result }, 500));
            }
          } catch (err) {
            resolve(res.json({ success: false, error: 'JSON Parse Error', details: data }, 500));
          }
        });
      });

      request.on('error', (e) => {
        resolve(res.json({ success: false, error: e.message }, 500));
      });

      request.write(postData);
      request.end();
    });

  } catch (e) {
    return res.json({ success: false, error: e.message }, 500);
  }
};
