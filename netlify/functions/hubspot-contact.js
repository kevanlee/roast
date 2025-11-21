const HUBSPOT_TOKEN = process.env.HUBSPOT_PRIVATE_APP_TOKEN;

exports.handler = async function handler(event) {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  if (!HUBSPOT_TOKEN) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "HubSpot token is not configured" }),
    };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch (parseError) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid JSON payload" }),
    };
  }

  const { email, companyName, companySize } = payload;

  if (!email || !companyName || !companySize) {
    return {
      statusCode: 400,
      body: JSON.stringify({
        error: "Missing required fields: email, companyName, companySize",
      }),
    };
  }

  const hubspotUrl = `https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/${encodeURIComponent(
    email
  )}`;

  try {
    const response = await fetch(hubspotUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: [
          { property: "email", value: email },
          { property: "company", value: companyName },
          { property: "company_size", value: companySize },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        body: JSON.stringify({
          error: data.message || "Failed to create or update contact",
          details: data,
        }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Contact created or updated", data }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Unexpected error", details: error.message }),
    };
  }
};
