#!/usr/bin/env node
/**
 * AFEM — Daily Article Bot
 *
 * Tous les jours :
 *  1. Choisit un sujet non encore publie depuis topics.json
 *  2. Demande a Claude (Opus 4.6, adaptive thinking) de generer un article
 *     en blocs editoriaux (heading / paragraph / callout / list / faq …)
 *  3. Verifie SEO >= 80 ET GEO >= 80 avec le scorer mirror de l'admin
 *  4. Si l'un des scores < 80, renvoie a Claude la liste des manques pour
 *     correction (max 3 essais)
 *  5. Lance une passe d'humanisation (varie la longueur des phrases, evite
 *     les tics IA, ajoute des cas concrets)
 *  6. Re-score apres humanisation. Si toujours OK, publie dans Supabase
 *     (page_content) avec visible = true et publication_date = aujourd'hui.
 *  7. Si KO apres 3 essais, sauvegarde quand meme en brouillon (visible=false)
 *     et logge clairement.
 *
 * Variables d'environnement requises :
 *   - ANTHROPIC_API_KEY
 *   - SUPABASE_URL                  (ex: https://xxx.supabase.co)
 *   - SUPABASE_SERVICE_ROLE_KEY     (cle service, JAMAIS la cle anon)
 *
 * Lancement local :
 *   node scripts/daily-article-bot.mjs
 *   node scripts/daily-article-bot.mjs --dry-run
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { analyzeSEO, analyzeGEO, failuresHumanReadable } from './seo-geo-scorer.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TOPICS_PATH = path.join(__dirname, 'topics.json');
const MIN_SCORE = 80;
const MAX_ATTEMPTS = 3;
const MODEL = 'claude-opus-4-6';
const DRY_RUN = process.argv.includes('--dry-run');

/* ─── Helpers ─── */
function todayIso() {
  return new Date().toISOString();
}
function todayDate() {
  return new Date().toISOString().slice(0, 10);
}
function log(...a) { console.log('[bot]', ...a); }
function warn(...a) { console.warn('[bot][warn]', ...a); }
function err(...a) { console.error('[bot][error]', ...a); }

function requireEnv(name) {
  const v = process.env[name];
  if (!v) {
    err(`Variable d'environnement manquante : ${name}`);
    process.exit(1);
  }
  return v;
}

/* ─── Pick next topic ─── */
async function pickTopic(supabase) {
  const raw = await fs.readFile(TOPICS_PATH, 'utf8');
  const data = JSON.parse(raw);
  const topics = data.topics || [];
  if (!topics.length) throw new Error('topics.json vide');

  const slugs = topics.map((t) => t.slug);
  const { data: existing, error } = await supabase
    .from('page_content')
    .select('page_slug')
    .in('page_slug', slugs);
  if (error) throw error;
  const taken = new Set((existing || []).map((r) => r.page_slug));

  const remaining = topics.filter((t) => !taken.has(t.slug));
  if (!remaining.length) {
    warn('Tous les sujets de topics.json sont deja publies. Ajoute-en de nouveaux.');
    return null;
  }
  // Light shuffle to avoid always taking the first one in fixed order
  const idx = Math.floor(Math.random() * Math.min(remaining.length, 8));
  return remaining[idx];
}

/* ─── Prompt builders ─── */
function buildGenerationSystemPrompt() {
  return `Tu es un redacteur senior d'AFEM (afem-edu.fr), site francais d'orientation pour les etudes de medecine (PASS, LAS, prepa, Parcoursup).

Tu dois rediger un article complet en francais, format CMS bloc, optimise pour le SEO (Google) ET le GEO (citations par les moteurs IA type ChatGPT, Perplexity).

REGLES STRICTES DE STRUCTURE :
- Tu retournes UNIQUEMENT du JSON valide, sans aucun texte avant ni apres, sans bloc markdown.
- Schema strict :
  {
    "title":           string (45-70 caracteres),
    "meta_description": string (135-170 caracteres),
    "subtitle":        string (10-150 caracteres),
    "excerpt":         string (100-200 caracteres, resume editorial accrocheur),
    "sections":        array de blocs (voir ci-dessous)
  }

BLOCS AUTORISES dans "sections" :
  { "type": "heading",  "level": 2|3, "text": "..." }
  { "type": "paragraph", "html": "<p>...</p>" }     // peut contenir <strong>, <em>, <a href>, <ul>, <ol>, <li>, <blockquote>
  { "type": "callout",   "html": "<p>...</p>" }     // encadre type "bon a savoir"
  { "type": "list",      "items": ["...", "..."] }  // liste de points
  { "type": "table",     "headers": ["..."], "rows": [["..."], ["..."]] }
  { "type": "grid",      "items": [{"title": "...", "description": "..."}] }
  { "type": "faq",       "items": [{"question": "...", "answer": "<p>...</p>"}] }

EXIGENCES MINIMALES (absolument respecter pour scorer 80+ SEO/GEO) :
- Au moins 1100 mots de contenu (paragraphes + callouts + items + faq cumules).
- Au moins 5 blocs "heading" (level 2 ou 3) repartis dans l'article.
- Au moins 5 blocs "paragraph" remplis (> 60 mots chacun).
- Au moins 1 bloc "callout" (encadre type conseil/attention).
- Au moins 1 bloc "list" structure.
- Au moins 1 bloc "faq" avec 5 questions, chaque reponse > 60 mots.
- IMPORTANT — au moins UN paragraphe OU une reponse FAQ doit contenir une balise HTML <ul><li>…</li></ul> a l'interieur de son champ "html" (en plus du bloc "list" structure). Cela compte pour le check SEO "structured_html".
- IMPORTANT — au moins UN bloc "table" (avec headers et rows) OU un bloc "grid" (3-4 items title+description) pour le check GEO "geo_grids" / "geo_tables".
- Au moins 2 liens internes vers d'autres pages AFEM dans les paragraphes : utilise des href en "/" (ex: <a href="/articles/...">) ou contenant "afem-edu.fr". Tu PEUX inventer des slugs plausibles vers /facultes, /prepas-medecine, /parcoursup, /pass-las, /articles/...
- Au moins 1 lien externe vers une source d'autorite (terminaison .gouv.fr, .org, .edu, europa.eu, who.int) dans un paragraphe ou une reponse FAQ. Privilegie : solidarites-sante.gouv.fr, education.gouv.fr, parcoursup.fr (.fr donc precise un .gouv.fr a la place), enseignementsup-recherche.gouv.fr, who.int.
- Le mot-cle cible doit apparaitre : dans le titre, dans la meta description, dans le premier paragraphe, et dans au moins un "heading".

QUALITE EDITORIALE :
- Ton naturel, pedagogique, francais courant. Tu peux tutoyer le lecteur (cible : lyceens / etudiants 17-22 ans).
- Pas de phrases creuses ("dans cet article nous allons voir", "il est important de noter", "en conclusion"…).
- Donne des chiffres concrets (ordres de grandeur, pourcentages, ratios) quand c'est pertinent. Si tu n'es pas certain d'un chiffre, formule-le comme un ordre de grandeur ("environ", "autour de").
- Pas d'em-dash (—). Utilise virgule, deux-points ou parentheses.
- Pas d'emoji.
- Pas de promesses irrealistes ni de garanties commerciales.`;
}

function buildGenerationUserPrompt(topic) {
  return `Sujet a traiter : "${topic.title}"
Slug cible : ${topic.slug}
Mot-cle cible (focus_keyword) : ${topic.focus_keyword}
Categorie : ${topic.category}

Redige l'article complet en respectant SCRUPULEUSEMENT le schema JSON et les exigences minimales (1100+ mots, 5+ headings, 5+ paragraphs, callout, list, FAQ 5 items, 2+ liens internes, 1+ lien externe d'autorite, mot-cle place correctement).

Retourne UNIQUEMENT l'objet JSON.`;
}

function buildRetryPrompt(topic, lastFailures) {
  return `L'article precedent n'a pas atteint le seuil 80/80 SEO+GEO. Manques detectes :
- ${lastFailures.join('\n- ')}

Reprends entierement la generation pour le sujet "${topic.title}" (slug ${topic.slug}, mot-cle "${topic.focus_keyword}") en CORRIGEANT chaque manque ci-dessus. Conserve le meme schema JSON strict. Retourne uniquement le JSON.`;
}

function buildHumanizeSystemPrompt() {
  return `Tu es un editeur senior. Tu reecris un article CMS pour qu'il sonne ECRIT PAR UN HUMAIN, pas par une IA, sans changer le sens, sans degrader le SEO ni le GEO.

Regles d'humanisation :
- Varie la longueur des phrases : alterne phrases courtes (5-8 mots), moyennes, et plus longues. Pas de rythme robotique.
- Supprime les tics IA : "il est important de noter", "il convient de", "en conclusion", "en resume", "cela dit", "par ailleurs" en debut de paragraphe systematique, "n'hesitez pas a", "dans le monde d'aujourd'hui".
- Garde un ton direct, pedagogique, francais naturel. Tutoiement OK si l'article tutoyait.
- Ajoute 2-3 details concrets credibles (chiffres approximatifs, exemples de fac, anecdotes types) la ou c'est pertinent, sans inventer de fausses statistiques precises.
- Pas d'em-dash (—). Utilise virgule, deux-points, parentheses.
- Pas d'emoji.
- Conserve TOUS les liens (internes et externes) deja presents.
- Conserve la structure exacte (memes blocs, memes types, meme ordre, memes "heading" textes a peu pres).
- Conserve title, meta_description, subtitle, excerpt et le mot-cle cible (focus_keyword s'il est present).
- Ne reduis pas le nombre de mots : reformule, ajoute si besoin, mais ne coupe pas.

Tu retournes UNIQUEMENT l'objet JSON complet humanise, meme schema que l'entree, sans aucun texte avant ni apres.`;
}

function buildHumanizeUserPrompt(article) {
  return `Article a humaniser (JSON) :

${JSON.stringify(article, null, 2)}

Renvoie le JSON entier humanise, schema identique.`;
}

/* ─── Claude calls ─── */
function extractJson(text) {
  if (!text) throw new Error('Reponse Claude vide');
  // Tolere un eventuel ```json ... ```
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = (fenced ? fenced[1] : text).trim();
  // Cherche le premier { et le dernier } pour decouper
  const first = candidate.indexOf('{');
  const last = candidate.lastIndexOf('}');
  if (first === -1 || last === -1) throw new Error('Aucun objet JSON detecte dans la reponse');
  const sliced = candidate.slice(first, last + 1);
  return JSON.parse(sliced);
}

async function callClaudeForJson(client, { system, user }) {
  const stream = await client.messages.stream({
    model: MODEL,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    output_config: { effort: 'high' },
    system,
    messages: [{ role: 'user', content: user }],
  });
  // Drain the stream (we don't need per-token output for this batch job)
  for await (const _ of stream) { /* noop */ }
  const finalMessage = await stream.finalMessage();
  const textBlocks = (finalMessage.content || []).filter((b) => b.type === 'text');
  if (!textBlocks.length) throw new Error('Aucun bloc texte dans la reponse Claude');
  const fullText = textBlocks.map((b) => b.text).join('\n');
  return extractJson(fullText);
}

/* ─── Validate / coerce article shape ─── */
function ensureArticleShape(art) {
  if (!art || typeof art !== 'object') throw new Error('Article : objet invalide');
  const required = ['title', 'meta_description', 'sections'];
  for (const k of required) {
    if (art[k] === undefined || art[k] === null) throw new Error(`Article : champ requis manquant "${k}"`);
  }
  if (!Array.isArray(art.sections)) throw new Error('Article : "sections" doit etre un tableau');
  art.subtitle = art.subtitle || '';
  art.excerpt = art.excerpt || '';
  // Filtre les blocs sans type
  art.sections = art.sections.filter((b) => b && typeof b === 'object' && typeof b.type === 'string');
  return art;
}

/* ─── Generation loop with score gating ─── */
async function generateScoredArticle(claude, topic) {
  let lastArticle = null;
  let lastReport = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    log(`Generation : tentative ${attempt}/${MAX_ATTEMPTS}…`);
    const userPrompt = attempt === 1
      ? buildGenerationUserPrompt(topic)
      : buildRetryPrompt(topic, lastReport.failures);
    const raw = await callClaudeForJson(claude, {
      system: buildGenerationSystemPrompt(),
      user: userPrompt,
    });
    const article = ensureArticleShape(raw);
    article.focus_keyword = topic.focus_keyword;
    const report = failuresHumanReadable(article);
    log(`  -> SEO ${report.seo} / GEO ${report.geo} / mots ${report.totalWords}`);
    lastArticle = article;
    lastReport = report;
    if (report.seo >= MIN_SCORE && report.geo >= MIN_SCORE) {
      return { article, report, attempt, ok: true };
    }
    log('  -> seuil 80/80 non atteint, manques :', report.failures.slice(0, 6).join(' | '));
  }
  return { article: lastArticle, report: lastReport, attempt: MAX_ATTEMPTS, ok: false };
}

async function humanizeArticle(claude, article) {
  log('Humanisation de l\'article…');
  const raw = await callClaudeForJson(claude, {
    system: buildHumanizeSystemPrompt(),
    user: buildHumanizeUserPrompt(article),
  });
  const humanized = ensureArticleShape(raw);
  humanized.focus_keyword = article.focus_keyword || humanized.focus_keyword || '';
  return humanized;
}

/* ─── Persist ─── */
async function saveToSupabase(supabase, topic, article, scores, visible) {
  const row = {
    page_slug: topic.slug,
    page_type: 'article',
    title: article.title,
    meta_description: article.meta_description,
    subtitle: article.subtitle || '',
    category: topic.category,
    excerpt: article.excerpt || '',
    sections: article.sections,
    faq: [],
    focus_keyword: article.focus_keyword || topic.focus_keyword,
    seo_score: scores.seo,
    geo_score: scores.geo,
    published_at: visible ? todayIso() : null,
    published: visible,
    updated_at: todayIso(),
  };
  if (DRY_RUN) {
    log('[DRY RUN] Insertion simulee :', { slug: row.page_slug, published: row.published, seo: row.seo_score, geo: row.geo_score });
    return row;
  }
  const { data, error } = await supabase
    .from('page_content')
    .upsert(row, { onConflict: 'page_slug' })
    .select()
    .single();
  if (error) throw error;
  return data;
}

/* ─── Main ─── */
async function main() {
  const ANTHROPIC_API_KEY = requireEnv('ANTHROPIC_API_KEY');
  const SUPABASE_URL = requireEnv('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = requireEnv('SUPABASE_SERVICE_ROLE_KEY');

  const claude = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  log(`Mode : ${DRY_RUN ? 'DRY RUN (aucune ecriture Supabase)' : 'PROD'}`);

  const topic = await pickTopic(supabase);
  if (!topic) {
    log('Aucun sujet disponible. Sortie.');
    return;
  }
  log(`Sujet choisi : "${topic.title}" (${topic.slug})`);

  // 1+2+3+4 : generation avec score gating
  const gen = await generateScoredArticle(claude, topic);
  if (!gen.ok) {
    warn(`Score 80/80 non atteint apres ${MAX_ATTEMPTS} tentatives. Sauvegarde en brouillon.`);
    await saveToSupabase(supabase, topic, gen.article, { seo: gen.report.seo, geo: gen.report.geo }, false);
    log('Brouillon sauvegarde (visible=false). A revoir manuellement dans /admin.');
    return;
  }

  // 5 : humanisation
  let humanized;
  try {
    humanized = await humanizeArticle(claude, gen.article);
  } catch (e) {
    warn('Humanisation echouee, on garde la version brute :', e.message);
    humanized = gen.article;
  }

  // 6 : re-score apres humanisation
  const seoAfter = analyzeSEO(humanized).score;
  const geoAfter = analyzeGEO(humanized).score;
  log(`Apres humanisation -> SEO ${seoAfter} / GEO ${geoAfter}`);
  if (seoAfter < MIN_SCORE || geoAfter < MIN_SCORE) {
    warn('L\'humanisation a degrade les scores. Repli sur la version brute pre-humanisation.');
    humanized = gen.article;
  }

  const finalSeo = analyzeSEO(humanized).score;
  const finalGeo = analyzeGEO(humanized).score;
  const visible = finalSeo >= MIN_SCORE && finalGeo >= MIN_SCORE;

  const saved = await saveToSupabase(
    supabase,
    topic,
    humanized,
    { seo: finalSeo, geo: finalGeo },
    visible,
  );
  log(`Termine. Article ${visible ? 'PUBLIE' : 'EN BROUILLON'} : ${topic.slug} (SEO ${finalSeo} / GEO ${finalGeo})`);
  if (saved && saved.page_slug) {
    log(`URL : https://www.afem-edu.fr/${saved.page_slug}`);
  }
}

main().catch((e) => {
  err(e?.stack || e?.message || e);
  process.exit(1);
});
