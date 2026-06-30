// Vercel Serverless Function — /api/submit-form
//
// Relaie la soumission du formulaire de re-qualification "/form"
// (campagne Last Chance Médecine) vers le CRM Diploma.
//
// Env vars :
//   AFEM_WEBHOOK_TOKEN   (REQUIS) — Bearer token du CRM Diploma
//   CRM_WEBHOOK_URL      (optionnel) — override de l'URL CRM

const CRM_URL_DEFAULT = 'https://hub.diploma-sante.fr/api/webhooks/afem-form';

const PREPA_CHOIX = ['medisup', 'diploma', 'antemed', 'cpcm', 'autre'];
const PREPA_RAISON = ['financier', 'pas_le_temps', 'pas_utile', 'autre'];

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
  if (!email && !phone) { res.status(400).json({ error: 'Email or phone required' }); return; }
  if (email && !isEmail(email)) { res.status(400).json({ error: 'Email invalide' }); return; }

  // Q0 : commence une annee de PASS/LAS a la rentree ?
  const commence = body.commence_pass_las === 'oui' ? 'oui' : (body.commence_pass_las === 'non' ? 'non' : null);
  if (!commence) { res.status(400).json({ error: 'commence_pass_las requis (oui|non)' }); return; }

  // Si l'eleve ne commence pas de PASS/LAS, les questions prepa sont ignorees.
  let prepaPrevue = null, prepaChoix = null, prepaChoixLibre = null, prepaNonRaison = null, prepaNonRaisonLibre = null;
  if (commence === 'oui') {
    prepaPrevue = body.prepa_prevue === 'oui' ? 'oui' : (body.prepa_prevue === 'non' ? 'non' : null);
    if (!prepaPrevue) { res.status(400).json({ error: 'prepa_prevue requis (oui|non)' }); return; }
    if (prepaPrevue === 'oui') {
      prepaChoix = PREPA_CHOIX.includes(body.prepa_choix) ? body.prepa_choix : null;
      if (!prepaChoix) { res.status(400).json({ error: 'prepa_choix requis' }); return; }
      if (prepaChoix === 'autre') prepaChoixLibre = str(body.prepa_choix_libre, 200);
    } else {
      prepaNonRaison = PREPA_RAISON.includes(body.prepa_non_raison) ? body.prepa_non_raison : null;
      if (!prepaNonRaison) { res.status(400).json({ error: 'prepa_non_raison requis' }); return; }
      if (prepaNonRaison === 'autre') prepaNonRaisonLibre = str(body.prepa_non_raison_libre, 300);
    }
  }

  const crmPayload = {
    firstname: str(body.firstname, 80),
    lastname: str(body.lastname, 80),
    email: email ? email.toLowerCase() : null,
    phone: phone,
    departement: str(body.departement, 12),
    classe_actuelle: str(body.classe_actuelle, 40),
    source_url: 'https://www.afem-edu.fr/form',
    commence_pass_las: commence,
    prepa_prevue: prepaPrevue,
    prepa_choix: prepaChoix,
    prepa_choix_libre: prepaChoixLibre,
    prepa_non_raison: prepaNonRaison,
    prepa_non_raison_libre: prepaNonRaisonLibre,
    meta: {
      form_id: 'requalification-prepa-idf',
      hubspot_contact_id: str(body.hubspot_contact_id, 60),
      utm_campaign: str(body.utm_campaign, 120) || 'last-chance-medecine',
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
