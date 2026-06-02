// Vercel Serverless Function — /api/save-parcoursup
//
// Reçoit la soumission du formulaire AFEM "Résultats Parcoursup", la
// transmet au CRM Diploma (cible principale), et — si configuré — la
// stocke aussi dans Supabase comme filet de sécurité / audit.
//
// Env vars :
//   AFEM_WEBHOOK_TOKEN           (REQUIS) — Bearer token du CRM Diploma
//   CRM_WEBHOOK_URL              (optionnel) — override de l'URL CRM
//   SUPABASE_URL                 (optionnel) — filet de sécurité
//   SUPABASE_SERVICE_ROLE_KEY    (optionnel) — filet de sécurité
//
// Si Supabase n'est pas configuré, on envoie uniquement au CRM.

const CRM_URL_DEFAULT = 'https://hub.diploma-sante.fr/api/webhooks/afem-form';

// Mapping classe interne AFEM → libellés reconnus par le CRM
const CLASSE_MAP = {
  terminale: 'Terminale',
  cesure: 'Autres',
  reorientation: 'Etudes Sup.',
  autre: 'Autres',
};

// Mapping niveau de pronostic → score numérique pour le CRM
const PRON_SCORE = { top: 95, good: 85, jouable: 70, analyse: 55, expert: 42 };

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

function isStr(v, max) {
  return typeof v === 'string' && v.trim().length > 0 && v.length <= (max || 200);
}

function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string') return xf.split(',')[0].trim();
  return req.socket?.remoteAddress || null;
}

// "PASS - Sorbonne Université (Paris)" → { formation, etablissement, ville }
function parseFormation(label) {
  const s = String(label || '').trim();
  const m = s.match(/^([\wÀ-ÿ]+)\s*-\s*(.+?)(?:\s*\(([^)]*)\))?$/);
  if (!m) return { formation: '', etablissement: s, ville: '' };
  return { formation: m[1], etablissement: (m[2] || '').trim(), ville: m[3] || '' };
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

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  if (!isAllowedOrigin(origin)) {
    res.status(403).json({ error: 'Origin not allowed' });
    return;
  }

  const CRM_TOKEN = process.env.AFEM_WEBHOOK_TOKEN;
  const CRM_URL = process.env.CRM_WEBHOOK_URL || CRM_URL_DEFAULT;
  if (!CRM_TOKEN) {
    console.error('Missing AFEM_WEBHOOK_TOKEN');
    res.status(500).json({ error: 'Server misconfigured (token CRM manquant)' });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); }
    catch { res.status(400).json({ error: 'Invalid JSON' }); return; }
  }
  if (!body || typeof body !== 'object') {
    res.status(400).json({ error: 'Missing body' });
    return;
  }

  // ─── Validation ───
  const { subject_id, prenom, nom, email, telephone, classe_actuelle, departement, utm, pronostic, data } = body;
  if (!isStr(prenom, 80)) { res.status(400).json({ error: 'prenom invalide' }); return; }
  if (!isStr(nom, 80)) { res.status(400).json({ error: 'nom invalide' }); return; }
  if (!isEmail(email)) { res.status(400).json({ error: 'email invalide' }); return; }
  if (telephone !== undefined && telephone !== null && telephone !== '' && !isStr(telephone, 30)) {
    res.status(400).json({ error: 'telephone invalide' }); return;
  }
  if (classe_actuelle !== undefined && classe_actuelle !== null && classe_actuelle !== '' && !isStr(classe_actuelle, 40)) {
    res.status(400).json({ error: 'classe_actuelle invalide' }); return;
  }
  if (departement !== undefined && departement !== null && departement !== '' && !isStr(departement, 12)) {
    res.status(400).json({ error: 'departement invalide' }); return;
  }
  if (!data || typeof data !== 'object') { res.status(400).json({ error: 'data manquant' }); return; }
  const q1 = data.q1 || {};
  const q3 = data.q3 || {};
  if (q1.proposition && !['oui', 'non'].includes(q1.proposition)) {
    res.status(400).json({ error: 'q1.proposition invalide' }); return;
  }
  if (!Array.isArray(q1.formations)) { res.status(400).json({ error: 'q1.formations invalide' }); return; }
  if (!Array.isArray(q3.voeux)) { res.status(400).json({ error: 'q3.voeux invalide' }); return; }
  if (q3.voeux.length > 10) { res.status(400).json({ error: 'trop de voeux' }); return; }

  // ─── Normalisation des données ───
  const cleanVoeux = q3.voeux.slice(0, 10).map((v, i) => {
    const parsed = parseFormation(v?.formation);
    return {
      rang: Number.isFinite(+v?.rang) ? +v.rang : null,
      rang_dernier_admis: Number.isFinite(+v?.rang_dernier_admis) ? +v.rang_dernier_admis : null,
      etablissement: parsed.etablissement,
      formation: parsed.formation,
      ville: parsed.ville,
      mineure: String(v?.mineure || '').slice(0, 200),
      libelle: String(v?.formation || '').slice(0, 300),
      ordre: i + 1,
    };
  });

  // Pronostic → format CRM { score, label, details }
  let crmPronostic = null;
  if (pronostic && typeof pronostic === 'object') {
    crmPronostic = {
      score: PRON_SCORE[pronostic.level] ?? null,
      label: pronostic.title || null,
      details: pronostic.message || null,
      niveau: pronostic.level || null,
    };
  }

  const classeLabel = classe_actuelle ? (CLASSE_MAP[classe_actuelle] || 'Autres') : null;

  // ─── Payload CRM Diploma ───
  const crmPayload = {
    firstname: prenom.trim().slice(0, 80),
    lastname: nom.trim().slice(0, 80),
    email: email.trim().toLowerCase().slice(0, 200),
    phone: telephone ? String(telephone).trim().slice(0, 30) : null,
    classe_actuelle: classeLabel,
    departement: departement ? String(departement).trim().slice(0, 12) : null,
    parcoursup_voeux: cleanVoeux,
    pronostic: crmPronostic,
    source_url: req.headers.referer || 'https://www.afem-edu.fr/resultats-parcoursup-2026',
    meta: {
      form_version: 'afem-parcoursup-2026',
      submission_mode: data.submission_mode === 'early' ? 'early' : 'full',
      q1_proposition: q1.proposition || null,
      q1_formations: q1.formations.slice(0, 3),
      q1_va_valider: q1.va_valider || null,
      utm_source: utm?.source || null,
      utm_medium: utm?.medium || null,
      utm_campaign: utm?.campaign || null,
      subject_id: subject_id || null,
    },
  };

  // ─── Envoi au CRM (cible principale, obligatoire) ───
  let crmResult;
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
    try { json = text ? JSON.parse(text) : {}; } catch { /* réponse non-JSON */ }
    if (!crmRes.ok) {
      console.error('CRM error', crmRes.status, text);
      res.status(502).json({ error: 'CRM upstream', status: crmRes.status });
      return;
    }
    crmResult = json;
  } catch (e) {
    console.error('CRM forward failed:', e?.message || e);
    res.status(502).json({ error: 'CRM injoignable' });
    return;
  }

  // ─── Filet Supabase (best-effort, uniquement si configuré) ───
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
      await supabase.from('parcoursup_submissions').insert({
        subject_id: subject_id || null,
        prenom: crmPayload.firstname,
        nom: crmPayload.lastname,
        email: crmPayload.email,
        telephone: crmPayload.phone,
        classe_actuelle: classe_actuelle || null,
        departement: crmPayload.departement,
        source: 'afem-edu.fr',
        utm_source: utm?.source || null,
        utm_medium: utm?.medium || null,
        utm_campaign: utm?.campaign || null,
        pronostic: (pronostic && typeof pronostic === 'object') ? pronostic : null,
        q1_proposition: q1.proposition || null,
        q1_formations: q1.formations.slice(0, 3),
        q1_va_valider: q1.va_valider ? String(q1.va_valider).slice(0, 300) : null,
        q3_voeux: cleanVoeux,
        submission_mode: data.submission_mode === 'early' ? 'early' : 'full',
        user_agent: (req.headers['user-agent'] || '').slice(0, 500) || null,
        ip_address: clientIp(req),
        forwarded_to_crm: true,
        forwarded_at: new Date().toISOString(),
      });
    } catch (e) {
      // Le CRM a déjà reçu la donnée : on ne bloque pas la réponse.
      console.error('Supabase backup failed (non bloquant):', e?.message || e);
    }
  }

  res.status(200).json({
    ok: true,
    contact_id: crmResult?.contact_id || null,
    action: crmResult?.action || null,
  });
}
