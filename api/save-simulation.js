// Vercel Serverless Function — /api/save-simulation
//
// Reçoit le lead du simulateur Parcoursup (/simulateur) : coordonnées +
// profil scolaire + top 10 des formations simulées, et le transmet au CRM
// Diploma (même webhook que /api/save-parcoursup).
//
// Env vars :
//   AFEM_WEBHOOK_TOKEN   (REQUIS) — Bearer token du CRM Diploma
//   CRM_WEBHOOK_URL      (optionnel) — override de l'URL CRM

const CRM_URL_DEFAULT = 'https://hub.diploma-sante.fr/api/webhooks/afem-form';

const CLASSE_MAP = {
  terminale: 'Terminale',
  premiere: 'Autres', // libellé non garanti côté CRM : on reste prudent
  reorientation: 'Etudes Sup.',
  autre: 'Autres',
};

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
  const s = String(v).trim();
  return s ? s.slice(0, max || 200) : null;
}
function grade(v) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 && n <= 20 ? Math.round(n * 10) / 10 : null;
}

// Niveau du meilleur résultat → pronostic CRM (même échelle que save-parcoursup)
function pronostic(top) {
  const best = top.filter((t) => t.probabilite >= 50).length;
  if (best >= 3) return { score: 95, niveau: 'top', label: 'Profil solide' };
  if (best >= 1) return { score: 70, niveau: 'jouable', label: 'Jouable avec une stratégie' };
  return { score: 42, niveau: 'expert', label: 'À accompagner' };
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const cors = corsHeaders(isAllowedOrigin(origin) ? origin : '');
  Object.entries(cors).forEach(([k, v]) => res.setHeader(k, v));

  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
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
    try { body = JSON.parse(body); } catch { res.status(400).json({ error: 'Invalid JSON' }); return; }
  }
  if (!body || typeof body !== 'object') { res.status(400).json({ error: 'Missing body' }); return; }

  const prenom = str(body.prenom, 80);
  const nom = str(body.nom, 80);
  const email = str(body.email, 200);
  const telephone = str(body.telephone, 30);
  if (!prenom || !nom) { res.status(400).json({ error: 'prenom/nom requis' }); return; }
  if (!isEmail(email)) { res.status(400).json({ error: 'email invalide' }); return; }
  if (!telephone || telephone.replace(/\D/g, '').length < 9) { res.status(400).json({ error: 'telephone invalide' }); return; }

  const p = body.profil && typeof body.profil === 'object' ? body.profil : {};
  const top = (Array.isArray(body.top) ? body.top : []).slice(0, 10).map((t, i) => ({
    ordre: i + 1,
    libelle: str(t?.formation, 300) || '',
    mineure: str(t?.option, 200) || '',
    cod_parcoursup: str(t?.cod, 20),
    probabilite: Number.isFinite(+t?.probabilite) ? Math.max(0, Math.min(100, Math.round(+t.probabilite))) : null,
    rang_dernier_admis: Number.isFinite(+t?.rang_dernier_appele) ? +t.rang_dernier_appele : null,
  }));
  const pron = pronostic(top);
  const classe = str(body.classe_actuelle, 40);
  const utm = body.utm && typeof body.utm === 'object' ? body.utm : {};

  const crmPayload = {
    firstname: prenom,
    lastname: nom,
    email: email.toLowerCase(),
    phone: telephone,
    classe_actuelle: classe ? (CLASSE_MAP[classe] || 'Autres') : null,
    departement: str(body.departement, 12),
    parcoursup_voeux: top,
    pronostic: { score: pron.score, label: pron.label, niveau: pron.niveau, details: null },
    source_url: req.headers.referer || 'https://www.afem-edu.fr/simulateur',
    meta: {
      form_version: 'afem-simulateur-2026',
      moyenne_generale: grade(p.gen),
      moyenne_specialites: grade(p.spe),
      doublette: str(p.doublette, 20),
      option_maths: str(p.maths, 20),
      academie: str(p.aca, 40),
      filtre_filiere: str(body.filtres?.type, 10),
      filtre_zone: str(body.filtres?.zone, 10),
      utm_source: str(utm.source, 120),
      utm_medium: str(utm.medium, 120),
      utm_campaign: str(utm.campaign, 120),
    },
  };

  try {
    const crmRes = await fetch(CRM_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + CRM_TOKEN },
      body: JSON.stringify(crmPayload),
      signal: AbortSignal.timeout(8000),
    });
    const text = await crmRes.text();
    let json = {};
    try { json = text ? JSON.parse(text) : {}; } catch { /* réponse non-JSON */ }
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
