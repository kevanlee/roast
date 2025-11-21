/* eslint-env node */

const GOOGLE_DOCS_WEBHOOK_URL = process.env.GOOGLE_DOCS_WEBHOOK_URL;

exports.handler = async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
  }

  if (!GOOGLE_DOCS_WEBHOOK_URL) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Google Docs webhook is not configured' }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON payload' }),
    };
  }

  const { email, companyName, companySize, techStack, roast } = payload;

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Email is required.' }),
    };
  }

  const response = await fetch(GOOGLE_DOCS_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, companyName, companySize, techStack, roast }),
  });

  const responseData = await response.json().catch(() => null);

  if (!response.ok) {
    return {
      statusCode: response.status,
      body: JSON.stringify({
        error: 'Failed to sync with Google Docs',
        details: responseData,
      }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Submission synced to Google Docs',
      response: responseData,
    }),
  };
};
