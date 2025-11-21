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

  const { email, companyName, companySize, techStack } = payload;

  if (!email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Email is required." }),
    };
  }

  // 1️⃣ Create/update the contact
  const contactResponse = await fetch(
    "https://api.hubapi.com/crm/v3/objects/contacts",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          email,
          company: companyName || "",
          company_size: companySize || "",
          tech_stack_input: techStack || "",
        },
      }),
    }
  );

  const contactData = await contactResponse.json();

  if (!contactResponse.ok) {
    return {
      statusCode: contactResponse.status,
      body: JSON.stringify({
        error: "Failed to create/update contact",
        details: contactData,
      }),
    };
  }

  const contactId = contactData.id;

  // 2️⃣ Optional: add a Note to the timeline
  if (techStack) {
    await fetch("https://api.hubapi.com/crm/v3/objects/notes", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${HUBSPOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          hs_note_body: `Tech Stack Submitted:\n${techStack}`,
        },
        associations: [
          {
            to: { id: contactId },
            types: [
              { associationCategory: "HUBSPOT_DEFINED", associationTypeId: 202 },
            ],
          },
        ],
      }),
    });
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "Contact synced successfully",
      contactId,
    }),
  };
};
