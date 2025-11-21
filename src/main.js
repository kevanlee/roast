import './style.css';

const TOOL_SECTIONS = [
  {
    id: 'popular',
    title: 'Popular tools',
    defaultTools: [
      'Slack',
      'Microsoft Teams',
      'Google Docs',
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
      'Notion',
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

const SYSTEM_PROMPT = `You are the Tech Stack Roaster, a witty but kind expert AI consultant who "works" at PRMT (https://prmt.com/) and who humorously diagnoses bad tech stacks according to the company's philosophy. 

You can and should use their brand foundations, which you can read more about below, to ground yourself in the world of PRMT, but we're pushing the "rebel" side of the empathetic rebel in tone and you can allow yourself to be a little bit wicked for the sake of humor and getting a reaction. 

Tone: dry humor, clever, confident, a glint in your eye, and if you're saying something teasing, it comes from a place of self-awareness and you've "been there too." 

You evaluate stacks for efficiency, integration, scalability, security, and sanity. 

You must always return three fields clearly labeled exactly as shown: 

Score: [number]/100
Vibe: [choose an emoji or combination of emojis that correspond to the roast] 
Roast: [2 to 3 funny, knowing, specific sentences about the tools] 
Tip: [1 expertly worded actionable improvement tip based on the stack] 

You will receive a number of software tools and the company's size, and you need to evaluate the tech stack and give a roast relative to what is appropriate for the company size and other context you may glean.

Their brand foundations are as follows: Purpose: We believe access to effortless IT makes space for people to do
their best work. Mission: We are reinventing managed IT, pairing the latest technology with
steadfast human support. Our Values: 1 No Smoke, No Mirrors, 2 Clients over Contracts, 3 Uncommon Sense. 
Personality: Rebel with Empathy A principled “outlaw.ˮ A protector who challenges the system—not for ego, but for others. PRMT doesnʼt break rules for the sake of rebellion. It breaks norms that no longer
serve people. This isnʼt chaos—itʼs conviction. The “Rebel with Empathyˮ questions authority, rejects convention, and brings fire to the people whoʼve been
left out in the cold.
Voice: Confident, visionary, fearless`;

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
      <div class="nav-logo" aria-label="PRMT logo"><img src="/img/prmt-logo-white.png"></div>
      <a href="https://prmt.com/contact"><button type="button" class="nav-cta">Talk to an expert</button></a>
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
            <span>Business name</span>
            <input
              id="company-name"
              name="companyName"
              type="text"
              placeholder="Acme Corp"
              autocomplete="organization"
              required
            />
          </label>
          <label class="text-input" for="company-size">
            <span>Company size</span>
            <select
              id="company-size"
              name="companySize"
              autocomplete="organization"
              aria-label="Company size"
              required
            >
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
            <input
              id="company-email"
              name="companyEmail"
              type="email"
              placeholder="you@company.com"
              autocomplete="email"
              required
            />
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
      <div id="roast-output" class="roast-output" role="presentation"></div>
      <div class="roast-actions">
        <button id="share-roast" type="button" class="secondary-button hidden">Copy / Share</button>
        <a
          id="expert-cta"
          class="expert-button hidden"
          href="https://prmt.com/contact"
          target="_blank"
          rel="noreferrer"
        >
          Speak to an expert
        </a>
      </div>
    </section>

    <section id="share-modal" class="share-modal hidden" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
      <div class="share-modal__panel">
        <button id="close-share-modal" type="button" class="share-modal__close" aria-label="Close share options">&times;</button>
        <h3 id="share-modal-title">Share your roast</h3>
        <p class="share-modal__intro">Grab a roast-ready caption or download a branded card for LinkedIn, Twitter, or anywhere else you thrive.</p>
        <div class="share-modal__preview" role="presentation">
          <img id="share-preview" alt="Roast share card preview" />
        </div>
        <label class="share-modal__label" for="share-text">Suggested caption</label>
        <textarea id="share-text" class="share-modal__textarea" rows="4" readonly></textarea>
        <div class="share-modal__actions">
          <button id="copy-share-text" type="button" class="secondary-button">Copy caption</button>
          <button id="download-share-image" type="button" class="primary-button">Download card</button>
        </div>
      </div>
    </section>
  </main>
`;

const form = document.querySelector('#stack-form');
const statusEl = document.querySelector('#status');
const roastCard = document.querySelector('#roast-card');
const roastOutput = document.querySelector('#roast-output');
const shareButton = document.querySelector('#share-roast');
const expertButton = document.querySelector('#expert-cta');
const otherToolsInput = document.querySelector('#other-tools');
const companyNameInput = document.querySelector('#company-name');
const companySizeSelect = document.querySelector('#company-size');
const companyEmailInput = document.querySelector('#company-email');
const shareModal = document.querySelector('#share-modal');
const closeShareModalButton = document.querySelector('#close-share-modal');
const sharePreviewImage = document.querySelector('#share-preview');
const shareTextArea = document.querySelector('#share-text');
const copyShareTextButton = document.querySelector('#copy-share-text');
const downloadShareImageButton = document.querySelector('#download-share-image');

let latestRoastShareData = null;
let latestShareImageUrl = '';

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

const parseRoastResponse = (roastText) => {
  const sections = {
    scoreRaw: '',
    roast: '',
    tip: '',
    extras: [],
  };

  const lines = roastText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

  let activeKey = '';

  lines.forEach((line) => {
    const normalized = line.toLowerCase();

    if (normalized.startsWith('score:')) {
      sections.scoreRaw = line.replace(/^[^:]+:/i, '').trim();
      activeKey = '';
      return;
    }

    if (normalized.startsWith('roast:')) {
      sections.roast = line.replace(/^[^:]+:/i, '').trim();
      activeKey = 'roast';
      return;
    }

    if (normalized.startsWith('tip:')) {
      sections.tip = line.replace(/^[^:]+:/i, '').trim();
      activeKey = 'tip';
      return;
    }

    if (activeKey) {
      sections[activeKey] = `${sections[activeKey]}${sections[activeKey] ? '\n' : ''}${line}`;
    } else {
      sections.extras.push(line);
    }
  });

  return sections;
};

const createParagraphs = (text) =>
  text
    .split(/\n{2,}|\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`)
    .join('');

const buildRoastHtml = (sections, companyDetails) => {
  const scoreMatch = sections.scoreRaw.match(/(\d{1,3})(?:\s*\/\s*(\d{1,3}))?/);
  const scoreValue = scoreMatch ? Number.parseInt(scoreMatch[1], 10) : undefined;
  const scoreDenominator = scoreMatch && scoreMatch[2] ? scoreMatch[2] : '100';
  const scoreText = sections.scoreRaw || '—';

  const companyMeta = [companyDetails.name, companyDetails.size]
    .map((item) => item && escapeHtml(item))
    .filter(Boolean)
    .join(' • ');

  const extrasHtml = sections.extras.length
    ? `<div class="roast-section"><h3>Bonus banter</h3>${createParagraphs(sections.extras.join('\n'))}</div>`
    : '';

  return `
    ${companyMeta ? `<p class="roast-meta">${companyMeta}</p>` : ''}
    <div class="roast-score" aria-label="Stack sanity score">
      <span class="roast-score-value">${
        Number.isFinite(scoreValue) ? escapeHtml(`${scoreValue}`) : escapeHtml(scoreText)
      }</span>
      <span class="roast-score-denominator">out of ${escapeHtml(scoreDenominator)}</span>
    </div>
    <div class="roast-section">
      <h3>Roast</h3>
      ${sections.roast ? createParagraphs(sections.roast) : '<p>OpenAI sent back a mysterious silence.</p>'}
    </div>
    <div class="roast-section">
      <h3>Glow-up tip</h3>
      ${sections.tip ? createParagraphs(sections.tip) : '<p>No tip this time—try again for more wisdom.</p>'}
    </div>
    ${extrasHtml}
  `;
};

const buildShareCaption = (sections, companyDetails) => {
  const scoreText = sections.scoreRaw || '—/100';
  const snippet = sections.roast?.split(/(?<=\.)\s+/)?.[0] ?? '';
  const companyName = companyDetails.name || 'Our stack';

  const parts = [
    `${companyName} just scored ${scoreText} in PRMT's Roast My Tech Stack.`,
    snippet,
    'Think you can handle the truth? https://prmt.com/roast',
    '#RoastMyStack #PRMT #TechStack',
  ];

  return parts.filter(Boolean).join('\n\n');
};

const wrapText = (ctx, text, x, y, maxWidth, lineHeight) => {
  const words = text.split(' ');
  let line = '';

  words.forEach((word) => {
    const testLine = `${line}${word} `;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, y);
      line = `${word} `;
      y += lineHeight;
    } else {
      line = testLine;
    }
  });

  if (line) {
    ctx.fillText(line, x, y);
  }
};

const createShareImageDataUrl = (sections, companyDetails) => {
  const canvas = document.createElement('canvas');
  const width = 1200;
  const height = 630;
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#030712');
  gradient.addColorStop(0.5, '#0e1b2b');
  gradient.addColorStop(1, '#ff552b');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = -height; i < width; i += 120) {
    ctx.beginPath();
    ctx.ellipse(i + 200, height / 2, 260, 420, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  const companyName = companyDetails.name || 'Your stack';
  const scoreMatch = sections.scoreRaw?.match(/(\d{1,3})/);
  const scoreValue = scoreMatch ? scoreMatch[1] : '—';
  const snippet = sections.roast?.split(/(?<=\.)\s+/)?.[0] ?? 'PRMT just dragged my stack—politely.';

  ctx.fillStyle = '#ffffff';
  ctx.font = '700 60px "Space Grotesk", "Inter", sans-serif';
  ctx.fillText('Roast My Tech Stack', 80, 120);

  ctx.font = '600 42px "Space Grotesk", "Inter", sans-serif';
  ctx.fillText(companyName, 80, 200);

  ctx.font = '400 34px "Space Grotesk", "Inter", sans-serif';
  wrapText(ctx, snippet, 80, 260, width - 160, 48);

  ctx.font = '700 210px "Space Grotesk", "Inter", sans-serif';
  ctx.textAlign = 'right';
  ctx.fillText(scoreValue, width - 80, height - 140);

  ctx.font = '600 36px "Space Grotesk", "Inter", sans-serif';
  ctx.fillText('out of 100', width - 80, height - 90);

  ctx.textAlign = 'left';
  ctx.font = '500 28px "Space Grotesk", "Inter", sans-serif';
  ctx.fillText('Roasted by PRMT', 80, height - 90);

  return canvas.toDataURL('image/png');
};

const displayRoast = (roastText, companyDetails = {}) => {
  if (!roastText) {
    roastCard.classList.add('hidden');
    roastOutput.innerHTML = '';
    shareButton.classList.add('hidden');
    expertButton.classList.add('hidden');
    latestRoastShareData = null;
    return;
  }

  const sections = parseRoastResponse(roastText);
  roastOutput.innerHTML = buildRoastHtml(sections, companyDetails);
  roastCard.classList.remove('hidden');
  shareButton.classList.remove('hidden');
  expertButton.classList.remove('hidden');
  latestRoastShareData = { sections, companyDetails };
};

const updateShareModalContent = () => {
  if (!latestRoastShareData) {
    return;
  }

  const { sections, companyDetails } = latestRoastShareData;
  const caption = buildShareCaption(sections, companyDetails);
  shareTextArea.value = caption;
  latestShareImageUrl = createShareImageDataUrl(sections, companyDetails);
  sharePreviewImage.src = latestShareImageUrl;
  sharePreviewImage.alt = `${companyDetails.name || 'Your stack'} roast share card`;
};

const openShareModal = () => {
  if (!latestRoastShareData) {
    return;
  }

  updateShareModalContent();
  shareModal.classList.remove('hidden');
  document.body.classList.add('modal-open');
  closeShareModalButton?.focus();
};

const closeShareModal = () => {
  shareModal.classList.add('hidden');
  document.body.classList.remove('modal-open');
  shareButton?.focus();
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

  if (companyDetails.size) {
    detailSnippets.push(`Company size: ${companyDetails.size}.`);
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
          content: [
            `Here’s the tech stack: ${toolSummary}.`,
            detailSnippets.filter(Boolean).join(' '),
          ]
            .filter(Boolean)
            .join(' ')
            .trim(),
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
    displayRoast('', companyDetails);
    return;
  }

  showStatus('Analyzing your tech stack... sharpening the knives 🔪…');
  toggleFormDisabled(true);

  try {
    // 1️⃣ CALL OPENAI FIRST
    const roast = await callOpenAI({
      toolSummary: toolList.join(', '),
      companyDetails,
    });

    // 2️⃣ DISPLAY ROAST
    displayRoast(roast, companyDetails);
    showStatus('');

    // 3️⃣ SEND TO GOOGLE DOCS VIA NETLIFY FUNCTION
    const googleDocsResponse = await fetch('/.netlify/functions/google-docs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: companyDetails.email,
        companyName: companyDetails.name,
        companySize: companyDetails.size,
        techStack: toolList.join(', '),
        roast,
      }),
    });

    if (!googleDocsResponse.ok) {
      throw new Error('Google Docs integration failed');
    }

  } catch (error) {
    console.error(error);
    displayRoast('', companyDetails);
    showStatus('The Roast Bot is taking a break. Try again in a minute.');
  } finally {
    toggleFormDisabled(false);
  }
});



console.log('API key loaded:', !!import.meta.env.VITE_OPENAI_API_KEY);

shareButton.addEventListener('click', () => {
  if (!latestRoastShareData) {
    return;
  }
  openShareModal();
});

closeShareModalButton.addEventListener('click', closeShareModal);

shareModal.addEventListener('click', (event) => {
  if (event.target === shareModal) {
    closeShareModal();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !shareModal.classList.contains('hidden')) {
    closeShareModal();
  }
});

copyShareTextButton.addEventListener('click', async () => {
  if (!shareTextArea.value) {
    return;
  }

  const original = copyShareTextButton.textContent;

  try {
    await navigator.clipboard.writeText(shareTextArea.value);
    copyShareTextButton.textContent = 'Copied!';
  } catch (error) {
    console.error(error);
    copyShareTextButton.textContent = 'Copy failed';
  } finally {
    setTimeout(() => {
      copyShareTextButton.textContent = original;
    }, 2000);
  }
});

downloadShareImageButton.addEventListener('click', () => {
  if (!latestShareImageUrl) {
    return;
  }

  const link = document.createElement('a');
  link.href = latestShareImageUrl;
  link.download = `prmt-roast-${Date.now()}.png`;
  link.click();
  downloadShareImageButton.textContent = 'Card saved!';
  setTimeout(() => {
    downloadShareImageButton.textContent = 'Download card';
  }, 2000);
});
