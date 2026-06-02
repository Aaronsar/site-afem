// Vercel Serverless Function — /api/save-parcoursup
//
// Receives the AFEM Parcoursup form submission, stores it in Supabase,
// and (optionally) forwards it as a webhook to the AFEM internal CRM.
//
// Env vars required (set in Vercel project settings):
//   SUPABASE_URL                 — same as the rest of the site
//   SUPABASE_SERVICE_ROLE_KEY    — secret, server-side only
//   CRM_WEBHOOK_URL              — optional, AFEM internal CRM endpoint
//   CRM_WEBHOOK_TOKEN            — optional, sent as `Authorization: Bearer ...`
//
// Endpoint contract (POST application/json):
//   {
//     subject_id?: string,
//     prenom: string, nom: string, email: string, telephone?: string,
//     utm?: { source, medium, campaign },
//     data: {
//       q1: { proposition: 'oui'|'non', formations: string[], va_valider: string|null },
//       q3: { voeux: [{ formation, mineure, rang, rang_dernier_admis }] },
//       submission_mode: 'early'|'full',
//       submitted_at: string
//     }
//   }

import { createClient } from '@supabase/supabase-js';

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

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing Supabase env vars');
    res.status(500).json({ error: 'Server misconfigured' });
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

  // Validation
  const { subject_id, prenom, nom, email, telephone, utm, data } = body;
  if (!isStr(prenom, 80)) { res.status(400).json({ error: 'prenom invalide' }); return; }
  if (!isStr(nom, 80)) { res.status(400).json({ error: 'nom invalide' }); return; }
  if (!isEmail(email)) { res.status(400).json({ error: 'email invalide' }); return; }
  if (telephone !== undefined && telephone !== null && telephone !== '' && !isStr(telephone, 30)) {
    res.status(400).json({ error: 'telephone invalide' }); return;
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

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const row = {
    subject_id: subject_id || null,
    prenom: prenom.trim().slice(0, 80),
    nom: nom.trim().slice(0, 80),
    email: email.trim().toLowerCase().slice(0, 200),
    telephone: telephone ? String(telephone).trim().slice(0, 30) : null,
    source: 'afem-edu.fr',
    utm_source: utm?.source ? String(utm.source).slice(0, 80) : null,
    utm_medium: utm?.medium ? String(utm.medium).slice(0, 80) : null,
    utm_campaign: utm?.campaign ? String(utm.campaign).slice(0, 120) : null,
    q1_proposition: q1.proposition || null,
    q1_formations: q1.formations.slice(0, 3),
    q1_va_valider: q1.va_valider ? String(q1.va_valider).slice(0, 300) : null,
    q3_voeux: q3.voeux.slice(0, 10).map((v) => ({
      formation: String(v?.formation || '').slice(0, 300),
      mineure: String(v?.mineure || '').slice(0, 200),
      rang: Number.isFinite(+v?.rang) ? +v.rang : null,
      rang_dernier_admis: Number.isFinite(+v?.rang_dernier_admis) ? +v.rang_dernier_admis : null,
    })),
    submission_mode: data.submission_mode === 'early' ? 'early' : 'full',
    user_agent: (req.headers['user-agent'] || '').slice(0, 500) || null,
    ip_address: clientIp(req),
  };

  const { data: inserted, error: insertError } = await supabase
    .from('parcoursup_submissions')
    .insert(row)
    .select('id')
    .single();

  if (insertError) {
    console.error('Supabase insert error:', insertError);
    res.status(500).json({ error: 'Erreur enregistrement' });
    return;
  }

  // Optional CRM forward (fire and forget, but track success)
  let crmStatus = 'skipped';
  const crmUrl = process.env.CRM_WEBHOOK_URL;
  if (crmUrl) {
    try {
      const crmPayload = { submission_id: inserted.id, ...row };
      const headers = { 'Content-Type': 'application/json' };
      if (process.env.CRM_WEBHOOK_TOKEN) {
        headers['Authorization'] = 'Bearer ' + process.env.CRM_WEBHOOK_TOKEN;
      }
      const crmRes = await fetch(crmUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(crmPayload),
        signal: AbortSignal.timeout(5000),
      });
      crmStatus = crmRes.ok ? 'ok' : `http_${crmRes.status}`;
      if (crmRes.ok) {
        await supabase
          .from('parcoursup_submissions')
          .update({ forwarded_to_crm: true, forwarded_at: new Date().toISOString() })
          .eq('id', inserted.id);
      }
    } catch (e) {
      console.error('CRM forward failed:', e?.message || e);
      crmStatus = 'error';
    }
  }

  res.status(200).json({ ok: true, id: inserted.id, crm: crmStatus });
}
