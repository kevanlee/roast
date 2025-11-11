import './style.css';

const TOOL_SECTIONS = [
  {
    id: 'popular',
    title: 'Popular tools',
    defaultTools: [
      'Slack',
      'Microsoft Teams',
      'HubSpot',
      'Salesforce',
      'Google Drive',
      'Dropbox',
      'Zoom',
      'Google Meet',
      'QuickBooks',
      'Xero',
      'Zendesk',
      'AWS',
      'Azure',
      'GitHub',
      'Linear',
      'Intercom',
      'Figma',
    ],
  },
  {
    id: 'collaboration',
    title: 'Marketing tools',
    defaultTools: [
      'Webflow',
      'Squarespace',
      'Ahrefs',
      'Mailchimp',
    ],
  },
  {
    id: 'security',
    title: 'Security tools',
    defaultTools: [
      'Okta',
      'Auth0',
      '1Password',
      'Snyk',
      'Vanta',
    ],
  },
];

const SYSTEM_PROMPT = `You are a witty but kind AI consultant who roasts bad tech stacks with humor and insight.
Always give:
- A numeric score (0–100) for stack sanity.
- A 2–3 sentence roast that’s funny but insightful.
- One tip for improvement.
Format your reply like:
Score: [number]/100
Roast: [text]
Tip: [text]`;

const API_URL = 'https://api.openai.com/v1/chat/completions';

const app = document.querySelector('#app');

// The backend can inject additional tools by assigning a structure like:
// window.__roastToolSections = { customTools: { security: ['Custom Tool'] } };
// Each section pulls from its corresponding array, if provided.
const getCustomToolsForSection = (sectionId) => {
  const customToolData = window.__roastToolSections?.customTools;

  if (!customToolData || typeof customToolData !== 'object') {
    return [];
  }

  const candidateList = customToolData[sectionId];

  if (!Array.isArray(candidateList)) {
    return [];
  }

  return candidateList
    .map((tool) => (typeof tool === 'string' ? tool.trim() : ''))
    .filter(Boolean);
};

const escapeHtml = (unsafeString) =>
  unsafeString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const createToolOption = (sectionId, index, tool) => `
  <label class="tool-option">
    <input type="checkbox" name="tools" value="${escapeHtml(tool)}" aria-describedby="tool-${sectionId}-${index}" />
    <span id="tool-${sectionId}-${index}">${escapeHtml(tool)}</span>
  </label>`;

const renderToolSections = () =>
  TOOL_SECTIONS.map((section) => {
    const combinedTools = [
      ...section.defaultTools,
      ...getCustomToolsForSection(section.id),
    ];

    const options = combinedTools
      .map((tool, index) => createToolOption(section.id, index, tool))
      .join('');

    return `
      <section class="fieldset">
        <h2>${section.title}</h2>
        <div class="tool-grid">
          ${options}
        </div>
      </section>`;
  }).join('');

app.innerHTML = `
  <main class="app-shell">
    <nav class="site-nav">
      <div class="nav-logo" aria-label="PRMT logo"><img src="/img/prmt-logo.png"></div>
      <a href="https://prmt.com"><button type="button" class="nav-cta">Talk to an expert</button></a>
    </nav>
    <header class="hero">
      <h1>Roast My Tech Stack</h1>
      <p>Select the tools in your stack and let our resident snark specialist evaluate your choices.</p>
    </header>

    <form id="stack-form" class="stack-form">
      <section class="fieldset">
        <h2>Company details</h2>
        <div class="input-grid">
          <label class="text-input" for="company-name">
            <span>Company name</span>
            <input id="company-name" name="companyName" type="text" placeholder="Acme Corp" autocomplete="organization" />
          </label>
          <label class="text-input" for="company-size">
            <span>Company size</span>
            <select id="company-size" name="companySize" autocomplete="organization" aria-label="Company size">
              <option value="" disabled selected>Select company size</option>
              <option value="1-10">1-10</option>
              <option value="11-50">11-50</option>
              <option value="51-200">51-200</option>
              <option value="201-500">201-500</option>
              <option value="501-1000">501-1,000</option>
              <option value="1001+">1,001+</option>
            </select>
          </label>
          <label class="text-input" for="company-email">
            <span>Work email</span>
            <input id="company-email" name="companyEmail" type="email" placeholder="you@company.com" autocomplete="email" />
          </label>
        </div>
      </section>

      ${renderToolSections()}

      <label class="other-input" for="other-tools">
        <span>Other tools (comma separated)</span>
        <textarea id="other-tools" name="otherTools" rows="3" placeholder="Figma, Custom CRM, Legacy ERP..."></textarea>
      </label>

      <button type="submit" class="primary-button">Roast my stack</button>
      <p id="status" class="status" aria-live="polite"></p>
    </form>

    <section id="roast-card" class="roast-card hidden" aria-live="polite">
      <h2>🔥 Your Roast Is Ready</h2>
      <pre id="roast-output" class="roast-output"></pre>
      <button id="share-roast" type="button" class="secondary-button hidden">Copy roast</button>
    </section>
  </main>
`;

const form = document.querySelector('#stack-form');
const statusEl = document.querySelector('#status');
const roastCard = document.querySelector('#roast-card');
const roastOutput = document.querySelector('#roast-output');
const shareButton = document.querySelector('#share-roast');
const otherToolsInput = document.querySelector('#other-tools');
const companyNameInput = document.querySelector('#company-name');
const companySizeSelect = document.querySelector('#company-size');
const companyEmailInput = document.querySelector('#company-email');

const toggleFormDisabled = (isDisabled) => {
  const controls = form.querySelectorAll('input, textarea, select, button');
  controls.forEach((control) => {
    control.disabled = isDisabled;
  });
};

const getApiKey = () => import.meta.env.VITE_OPENAI_API_KEY;

const buildToolList = () => {
  const selected = Array.from(
    form.querySelectorAll('input[name="tools"]:checked'),
    (checkbox) => checkbox.value
  );

  const others = otherToolsInput.value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  const combined = [...selected, ...others];

  return combined;
};

const buildCompanyDetails = () => {
  const details = {
    name: companyNameInput?.value.trim() ?? '',
    size: companySizeSelect?.value ?? '',
    email: companyEmailInput?.value.trim() ?? '',
  };

  return details;
};

const displayRoast = (roastText) => {
  if (!roastText) {
    roastCard.classList.add('hidden');
    roastOutput.textContent = '';
    shareButton.classList.add('hidden');
    return;
  }

  roastOutput.textContent = roastText;
  roastCard.classList.remove('hidden');
  shareButton.classList.remove('hidden');
};

const showStatus = (message) => {
  statusEl.textContent = message;
};

const callOpenAI = async ({ toolSummary, companyDetails }) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error(
      'Missing OpenAI API key. Set VITE_OPENAI_API_KEY in your environment and restart the dev server.'
    );
  }

  const detailSnippets = [];

  if (companyDetails.name) {
    detailSnippets.push(`Company name: ${companyDetails.name}.`);
  }

  if (companyDetails.size) {
    detailSnippets.push(`Company size: ${companyDetails.size}.`);
  }

  if (companyDetails.email) {
    detailSnippets.push(`Point of contact: ${companyDetails.email}.`);
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: `Here’s the tech stack: ${toolSummary}. ${detailSnippets.join(' ')}`.trim(),
        },
      ],
      max_tokens: 300,
      temperature: 0.8,
    }),
  });

  if (!response.ok) {
    throw new Error('OpenAI API request failed.');
  }

  const data = await response.json();
  const roastText = data?.choices?.[0]?.message?.content?.trim();

  if (!roastText) {
    throw new Error('The Roast Bot returned an empty response.');
  }

  return roastText;
};

form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const toolList = buildToolList();
  const companyDetails = buildCompanyDetails();

  if (toolList.length === 0) {
    showStatus('Tell me about at least one tool before I start roasting.');
    displayRoast('');
    return;
  }

  showStatus('Analyzing your tech stack... sharpening the knives 🔪…');
  toggleFormDisabled(true);

  try {
    const roast = await callOpenAI({
      toolSummary: toolList.join(', '),
      companyDetails,
    });
    displayRoast(roast);
    showStatus('');
  } catch (error) {
    console.error(error);
    displayRoast('');
    showStatus('The Roast Bot is taking a break. Try again in a minute.');
  } finally {
    toggleFormDisabled(false);
  }
});

shareButton.addEventListener('click', async () => {
  const roastText = roastOutput.textContent.trim();
  if (!roastText) {
    return;
  }

  try {
    await navigator.clipboard.writeText(roastText);
    shareButton.textContent = 'Copied!';
  } catch (error) {
    console.error(error);
    shareButton.textContent = 'Copy failed';
  } finally {
    setTimeout(() => {
      shareButton.textContent = 'Copy roast';
    }, 2000);
  }
});
