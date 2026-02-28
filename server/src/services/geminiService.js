import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env.js';

function extractJson(text) {
  const trimmed = String(text || '').trim();

  // Strip common markdown code fences if present.
  const noFences = trimmed
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // Try to find the first JSON object/array block.
  const firstBrace = noFences.indexOf('{');
  const firstBracket = noFences.indexOf('[');
  const start =
    firstBrace === -1
      ? firstBracket
      : firstBracket === -1
        ? firstBrace
        : Math.min(firstBrace, firstBracket);

  if (start === -1) return noFences;

  // Very lightweight extraction: from first { or [ to the last matching } or ].
  // This avoids failures when the model adds a leading sentence.
  const lastBrace = noFences.lastIndexOf('}');
  const lastBracket = noFences.lastIndexOf(']');
  const end = Math.max(lastBrace, lastBracket);
  if (end === -1 || end <= start) return noFences;

  return noFences.slice(start, end + 1);
}

let cachedModelName = null;
let cachedAtMs = 0;

function normalizeModelName(name) {
  if (!name) return null;
  const trimmed = String(name).trim();
  return trimmed.startsWith('models/') ? trimmed.slice('models/'.length) : trimmed;
}

async function listGeminiModels() {
  // The SDK currently calls v1beta; ListModels is available there.
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = data?.error?.message || `ListModels failed (${res.status})`;
    const err = new Error(msg);
    err.statusCode = 502;
    err.expose = true;
    throw err;
  }
  return Array.isArray(data?.models) ? data.models : [];
}

function pickBestModel(models, preferred) {
  const supported = models
    .filter((m) => Array.isArray(m.supportedGenerationMethods) && m.supportedGenerationMethods.includes('generateContent'))
    .map((m) => normalizeModelName(m.name))
    .filter(Boolean);

  if (!supported.length) return null;

  const preferredNormalized = normalizeModelName(preferred);
  if (preferredNormalized && supported.includes(preferredNormalized)) {
    return preferredNormalized;
  }

  // Heuristic priority (kept conservative): prefer "flash" for speed/cost.
  const priority = [
    'gemini-2.0-flash',
    'gemini-2.0-flash-lite',
    'gemini-1.5-flash-latest',
    'gemini-1.5-flash',
    'gemini-1.5-pro-latest',
    'gemini-1.5-pro',
  ];

  for (const p of priority) {
    const match = supported.find((x) => x === p);
    if (match) return match;
  }

  // Fallback: first supported model.
  return supported[0];
}

async function resolveModelName() {
  // Cache for 1 hour to avoid calling ListModels on every request.
  const ttlMs = 60 * 60 * 1000;
  if (cachedModelName && Date.now() - cachedAtMs < ttlMs) {
    return cachedModelName;
  }

  const models = await listGeminiModels();
  const picked = pickBestModel(models, env.GEMINI_MODEL);

  if (!picked) {
    const err = new Error('No Gemini models support generateContent for this API key');
    err.statusCode = 502;
    err.expose = true;
    throw err;
  }

  cachedModelName = picked;
  cachedAtMs = Date.now();
  // eslint-disable-next-line no-console
  console.log(`Gemini model selected: ${cachedModelName}`);
  return cachedModelName;
}

function buildMockResume(input) {
  const skills = Array.isArray(input?.skills) ? input.skills : [];
  const targetRole = input?.targetRole || 'Target Role';
  const projects = Array.isArray(input?.projects) ? input.projects : [];

  return {
    headline: `${targetRole} | ${skills.slice(0, 5).join(' • ')}`.trim(),
    summary:
      'Impact-focused professional resume generated in mock mode. Enable Gemini billing/quota for AI-generated content.',
    skills,
    experience: [
      {
        company: 'Company Name',
        title: targetRole,
        location: 'City, Country',
        startDate: '2023',
        endDate: 'Present',
        bullets: [
          'Delivered measurable improvements by applying role-relevant skills and best practices.',
          'Collaborated cross-functionally to ship features with quality and reliability.',
        ],
      },
    ],
    projects: projects.map((p) => ({
      name: p.title || 'Project',
      tech: skills.slice(0, 6),
      bullets: [p.description || 'Project description', 'Implemented clean, ATS-friendly documentation and outcomes.'],
    })),
    education: [
      {
        school: 'University / College',
        degree: 'Degree',
        startDate: '2019',
        endDate: '2023',
        details: ['Relevant coursework and achievements.'],
      },
    ],
    keywords: [...new Set([targetRole, ...skills])].slice(0, 30),
  };
}

function toCleanGeminiError(err) {
  const raw = String(err?.message || err || 'Gemini error');

  // Invalid/missing API key errors
  if (
    raw.toLowerCase().includes('api key not found') ||
    raw.toLowerCase().includes('api_key_invalid') ||
    raw.toLowerCase().includes('api key invalid')
  ) {
    const e = new Error(
      'Gemini API key is invalid. Update GEMINI_API_KEY in server/.env with a valid key from Google AI Studio, then restart the server. (Or set GEMINI_MOCK=true to bypass Gemini for demos.)'
    );
    e.statusCode = 401;
    e.expose = true;
    return e;
  }

  // Quota/billing / rate limit errors
  if (raw.includes('[429') || raw.toLowerCase().includes('too many requests') || raw.toLowerCase().includes('quota exceeded')) {
    const retryMatch = raw.match(/retryDelay":"(\d+)s"/i) || raw.match(/retry in\s+([0-9.]+)s/i);
    const retryAfterSec = retryMatch ? Math.ceil(Number(retryMatch[1])) : undefined;

    const e = new Error(
      'Gemini quota exceeded. Enable billing/quota for your API key in Google AI Studio / Google Cloud, then retry.'
    );
    e.statusCode = 429;
    e.expose = true;
    if (retryAfterSec) e.retryAfterSec = retryAfterSec;
    return e;
  }

  return err;
}

// Generates an ATS-friendly resume JSON.
// We force strict JSON output to make downstream rendering predictable.
export async function generateResumeJson(input) {
  if (env.GEMINI_MOCK) {
    return buildMockResume(input);
  }

  if (!env.GEMINI_API_KEY) {
    const err = new Error('Gemini is not configured (missing GEMINI_API_KEY)');
    err.statusCode = 500;
    err.expose = true;
    throw err;
  }

  const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  const modelName = await resolveModelName();
  const model = genAI.getGenerativeModel({ model: modelName });

  const schema = {
    summary: 'string',
    headline: 'string',
    skills: ['string'],
    experience: [
      {
        company: 'string',
        title: 'string',
        location: 'string',
        startDate: 'string',
        endDate: 'string',
        bullets: ['string'],
      },
    ],
    projects: [
      {
        name: 'string',
        bullets: ['string'],
        tech: ['string'],
      },
    ],
    education: [
      {
        school: 'string',
        degree: 'string',
        startDate: 'string',
        endDate: 'string',
        details: ['string'],
      },
    ],
    keywords: ['string'],
  };

  const prompt = `You are an expert resume writer. Create an ATS-friendly, professional resume for the target role.

Rules:
- Output MUST be valid JSON only (no markdown, no code fences, no commentary).
- Keep language concise and impact-focused.
- Use strong action verbs.
- Avoid tables, columns, or complex formatting.
- Use the exact JSON shape shown in "OutputSchema".
- Dates can be strings like "2023" or "Jan 2022".

Input:
${JSON.stringify(input)}

OutputSchema:
${JSON.stringify(schema)}
`;

  let text = '';
  try {
    const result = await model.generateContent(prompt);
    text = result.response.text();
  } catch (err) {
    throw toCleanGeminiError(err);
  }

  const candidate = extractJson(text);

  // Gemini sometimes returns leading/trailing whitespace; still valid JSON.
  // If the model returns invalid JSON, we surface a clear error.
  try {
    return JSON.parse(candidate);
  } catch {
    const err = new Error('AI returned invalid JSON');
    err.statusCode = 502;
    err.expose = true;
    throw err;
  }
}
