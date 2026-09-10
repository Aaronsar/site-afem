// Vercel Serverless Function — /api/submit-refuse-pass
//
// Relais du formulaire "/refuse-pass-las-2026" vers le CRM Diploma.
//
// Env vars :
//   AFEM_WEBHOOK_TOKEN   (REQUIS) — Bearer token du CRM Diploma
//   CRM_WEBHOOK_URL      (optionnel) — override de l'URL CRM

const CRM_URL_DEFAULT = 'https://hub.diploma-sante.fr/api/webhooks/afem-form';

const SITUATIONS = [
  'Sortie de PASS',
  'Sortie de LAS',
  'Sortie de LSPS',
  'Encore en attente',
  "Parent d'élève",
  'Parent d’élève',
];

function corsHeaders(origin) {
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    'Vary': 'Origin',
  };
}

function isAllowedOrigin(origin) {
  if (!origin) return true;
  return /^https?:\/\/(localhost(:\d+)?|(.*\.)?afem-edu\.fr|.*\.vercel\.app)$/.test(origin);
}

function isEmail(v) {
  return typeof v === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) && v.length < 200;
}

function str(v, max) {
  if (v === undefined || v === null) return null;
  var s = String(v).trim();
  return s ? s.slice(0, max || 200) : null;
}

function normalizeSituation(v) {
  var s = str(v, 80);
  if (!s) return null;
  var folded = s.replace(/[\u2019\u2018]/g, "'");
  var match = SITUATIONS.find(function (item) {
    return item.replace(/[\u2019\u2018]/g, "'") === folded;
  });
  return match ? folded : null;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const cors = corsHeaders(isAllowedOrigin(origin) ? origin : '');

  if (req.method === 'OPTIONS') {
    Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
    res.status(204).end();
    return;
  }
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  if (!isAllowedOrigin(origin)) { res.status(403).json({ error: 'Origin not allowed' }); return; }

  const CRM_TOKEN = process.env.AFEM_WEBHOOK_TOKEN;
  const CRM_URL = process.env.CRM_WEBHOOK_URL || CRM_URL_DEFAULT;
  if (!CRM_TOKEN) {
    console.error('Missing AFEM_WEBHOOK_TOKEN');
    res.status(500).json({ error: 'Server misconfigured (token CRM manquant)' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch { res.status(400).json({ error: 'Invalid JSON body' }); return; }
  }
  if (!body || typeof body !== 'object') { res.status(400).json({ error: 'Missing body' }); return; }

  const email = str(body.email, 200);
  const phone = str(body.phone, 40);
  const firstname = str(body.firstname, 80);
  const lastname = str(body.lastname, 80);
  const departement = str(body.departement, 12);
  const situation = normalizeSituation(body.situation);

  if (!firstname) { res.status(400).json({ error: 'Prénom requis' }); return; }
  if (!lastname) { res.status(400).json({ error: 'Nom requis' }); return; }
  if (!email && !phone) { res.status(400).json({ error: 'Email or phone required' }); return; }
  if (email && !isEmail(email)) { res.status(400).json({ error: 'Email invalide' }); return; }
  if (!phone) { res.status(400).json({ error: 'Téléphone requis' }); return; }
  if (!departement) { res.status(400).json({ error: 'Département requis' }); return; }
  if (!situation) { res.status(400).json({ error: 'Situation requise' }); return; }

  const crmPayload = {
    firstname: firstname,
    lastname: lastname,
    email: email ? email.toLowerCase() : null,
    phone: phone,
    departement: departement,
    classe_actuelle: 'Etudes Sup.',
    source_url: 'https://www.afem-edu.fr/refuse-pass-las-2026',
    meta: {
      form_id: 'refuse-pass-las-2026',
      situation: situation,
      utm_source: str(body.utm_source, 120),
      utm_medium: str(body.utm_medium, 120),
      utm_campaign: str(body.utm_campaign, 120) || 'refuse-pass-las-2026',
    },
  };

  try {
    const crmRes = await fetch(CRM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + CRM_TOKEN,
      },
      body: JSON.stringify(crmPayload),
      signal: AbortSignal.timeout(8000),
    });
    const text = await crmRes.text();
    let json = {};
    try { json = text ? JSON.parse(text) : {}; } catch { /* non-JSON */ }
    if (!crmRes.ok) {
      console.error('CRM error', crmRes.status, text);
      res.status(502).json({ error: 'CRM upstream', status: crmRes.status });
      return;
    }
    res.status(200).json({ ok: true, contact_id: json.contact_id || null, action: json.action || null });
  } catch (e) {
    console.error('CRM forward failed:', e?.message || e);
    res.status(502).json({ error: 'CRM injoignable' });
  }
}
