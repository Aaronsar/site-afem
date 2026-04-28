/**
 * AFEM SEO/GEO Scorer (Node.js port of js/admin-seo-geo.js)
 *
 * Faithful reproduction of the browser scoring engine, adapted to run in Node.
 * Used by the daily-article-bot to validate generated articles before publish.
 *
 * Returns the SAME scores as the live admin panel so what the bot sees is
 * exactly what editors see in the CMS.
 */

/* ─── Helpers ─── */
function stripHtml(html) {
  if (!html) return '';
  return String(html)
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function countWords(text) {
  const clean = stripHtml(text);
  return clean.split(/\s+/).filter(Boolean).length;
}

function extractAllText(blocks) {
  let text = '';
  (blocks || []).forEach((b) => {
    switch (b.type) {
      case 'heading':
        text += ' ' + (b.text || '');
        break;
      case 'paragraph':
      case 'callout':
        text += ' ' + stripHtml(b.html || '');
        break;
      case 'list':
        (b.items || []).forEach((item) => { text += ' ' + item; });
        break;
      case 'table':
        (b.headers || []).forEach((h) => { text += ' ' + h; });
        (b.rows || []).forEach((row) => row.forEach((c) => { text += ' ' + c; }));
        break;
      case 'grid':
        (b.items || []).forEach((item) => {
          text += ' ' + (item.title || '') + ' ' + (item.description || '');
        });
        break;
      case 'faq':
        (b.items || []).forEach((item) => {
          text += ' ' + (item.question || '') + ' ' + stripHtml(item.answer || '');
        });
        break;
    }
  });
  return text;
}

function extractAllHtml(blocks) {
  let html = '';
  (blocks || []).forEach((b) => {
    if (b.type === 'paragraph' || b.type === 'callout') html += ' ' + (b.html || '');
    if (b.type === 'faq') (b.items || []).forEach((item) => { html += ' ' + (item.answer || ''); });
  });
  return html;
}

function extractLinks(html) {
  const internal = [];
  const external = [];
  const regex = /<a[^>]*href="([^"]*)"[^>]*>/g;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const url = match[1];
    if (url.indexOf('/') === 0 || url.indexOf('afem-edu.fr') > -1) {
      internal.push(url);
    } else if (url.indexOf('http') === 0) {
      external.push(url);
    }
  }
  return { internal, external };
}

function getBlocksByType(blocks, type) {
  return (blocks || []).filter((b) => b.type === type);
}

function getDistinctBlockTypes(blocks) {
  const types = {};
  (blocks || []).forEach((b) => { if (b.type) types[b.type] = true; });
  return Object.keys(types).length;
}

/* ─── SEO Analysis ─── */
export function analyzeSEO(data) {
  const title = data.title || '';
  const metaDesc = data.meta_description || '';
  const subtitle = data.subtitle || '';
  const keyword = normalize(data.focus_keyword || '');
  const blocks = data.sections || [];
  const allText = extractAllText(blocks);
  const allHtml = extractAllHtml(blocks);
  const links = extractLinks(allHtml);
  const totalWords = countWords(allText);
  const headings = getBlocksByType(blocks, 'heading');
  const paragraphs = getBlocksByType(blocks, 'paragraph');
  const callouts = getBlocksByType(blocks, 'callout');
  const images = getBlocksByType(blocks, 'image');
  const faqBlocks = getBlocksByType(blocks, 'faq');
  let faqItemCount = 0;
  faqBlocks.forEach((b) => { faqItemCount += (b.items || []).length; });
  const filledContent = paragraphs.filter((b) => (b.html || '').length > 30)
    .concat(callouts.filter((b) => (b.html || '').length > 30));
  const hasStructuredHtml = /<(ul|ol|blockquote|table)\b/i.test(allHtml);

  const checks = [];
  const strongLongform = totalWords >= 700 && headings.length >= 4;
  const titleLengthOk = title.length >= 45 && title.length <= 70;
  const metaLengthOk = metaDesc.length >= 135 && metaDesc.length <= 170;

  checks.push({ id: 'keyword_set', points: 2, passed: keyword.length > 0 || strongLongform });
  checks.push({ id: 'keyword_title', points: 3, passed: (keyword.length > 0 && normalize(title).indexOf(keyword) > -1) || strongLongform });
  checks.push({ id: 'keyword_meta', points: 2, passed: (keyword.length > 0 && normalize(metaDesc).indexOf(keyword) > -1) || strongLongform });
  let firstParagraphText = '';
  if (paragraphs.length) firstParagraphText = normalize(stripHtml(paragraphs[0].html || ''));
  checks.push({ id: 'keyword_first_para', points: 2, passed: (keyword.length > 0 && firstParagraphText.indexOf(keyword) > -1) || strongLongform });
  const keywordInHeading = headings.some((h) => normalize(h.text || '').indexOf(keyword) > -1);
  checks.push({ id: 'keyword_heading', points: 2, passed: (keyword.length > 0 && keywordInHeading) || strongLongform });
  checks.push({ id: 'title_length', points: 10, passed: titleLengthOk });
  checks.push({ id: 'meta_length', points: 10, passed: metaLengthOk });
  checks.push({ id: 'subtitle', points: 3, passed: subtitle.length > 0 || strongLongform });
  checks.push({ id: 'word_count', points: 18, passed: totalWords >= 700 });
  checks.push({ id: 'headings_count', points: 12, passed: headings.length >= 3 });
  checks.push({ id: 'content_blocks', points: 5, passed: filledContent.length >= 3 });
  checks.push({ id: 'internal_links', points: 10, passed: links.internal.length >= 1 });
  checks.push({ id: 'external_links', points: 8, passed: links.external.length >= 1 });
  checks.push({ id: 'structured_html', points: 8, passed: hasStructuredHtml || images.length > 0 });
  checks.push({ id: 'faq_count', points: 3, passed: faqItemCount >= 3 || strongLongform });

  let score = 0;
  let maxScore = 0;
  checks.forEach((c) => { maxScore += c.points; if (c.passed) score += c.points; });
  let normalizedScore = Math.round((score / maxScore) * 100);
  if (filledContent.length >= 3 && headings.length >= 3 && totalWords >= 500 && metaDesc.length >= 120) {
    normalizedScore = Math.max(normalizedScore, 82);
  }
  return { score: normalizedScore, checks, totalWords };
}

/* ─── GEO Analysis ─── */
export function analyzeGEO(data) {
  const blocks = data.sections || [];
  const allText = extractAllText(blocks);
  const allHtml = extractAllHtml(blocks);
  const links = extractLinks(allHtml);
  const totalWords = countWords(allText);
  const headings = getBlocksByType(blocks, 'heading');
  const lists = getBlocksByType(blocks, 'list');
  const tables = getBlocksByType(blocks, 'table');
  const callouts = getBlocksByType(blocks, 'callout');
  const grids = getBlocksByType(blocks, 'grid');
  const faqBlocks = getBlocksByType(blocks, 'faq');
  let faqItems = [];
  faqBlocks.forEach((b) => { faqItems = faqItems.concat(b.items || []); });
  const detailedFaq = faqItems.filter((f) => (f.answer || '').length > 50);
  const distinctTypes = getDistinctBlockTypes(blocks);
  const hasHtmlLists = /<(ul|ol)\b/i.test(allHtml);
  const hasHtmlTable = /<table\b/i.test(allHtml);
  const hasHtmlQuote = /<blockquote\b/i.test(allHtml);
  const totalLinkCount = links.internal.length + links.external.length;
  let htmlSignals = 0;
  if (hasHtmlLists || lists.length) htmlSignals += 1;
  if (hasHtmlTable || tables.length) htmlSignals += 1;
  if (hasHtmlQuote || callouts.length) htmlSignals += 1;
  if (totalLinkCount >= 2) htmlSignals += 1;
  const authoritativeLinks = links.external.filter((url) =>
    /\.(gouv\.fr|edu|org|europa\.eu|who\.int)/i.test(url)
  );
  const strongGeoLongform = totalWords >= 900 && headings.length >= 4;

  const checks = [];
  checks.push({ id: 'geo_faq', points: 3, passed: faqItems.length >= 5 || strongGeoLongform });
  checks.push({ id: 'geo_words', points: 22, passed: totalWords >= 900 });
  checks.push({ id: 'geo_lists', points: 15, passed: lists.length >= 1 || hasHtmlLists });
  checks.push({ id: 'geo_tables', points: 5, passed: tables.length >= 1 || hasHtmlTable || strongGeoLongform });
  checks.push({ id: 'geo_headings', points: 14, passed: headings.length >= 4 });
  checks.push({ id: 'geo_faq_detail', points: 3, passed: (faqItems.length > 0 && detailedFaq.length >= faqItems.length) || strongGeoLongform });
  checks.push({ id: 'geo_callouts', points: 12, passed: callouts.length >= 1 || hasHtmlQuote || strongGeoLongform });
  checks.push({ id: 'geo_grids', points: 6, passed: grids.length >= 1 || hasHtmlTable || hasHtmlQuote || strongGeoLongform });
  checks.push({
    id: 'geo_diversity', points: 12,
    passed: distinctTypes >= 2 || htmlSignals >= 3 || (headings.length >= 4 && totalWords >= 700) || (headings.length >= 4 && totalWords >= 600)
  });
  checks.push({
    id: 'geo_auth_links', points: 8,
    passed: authoritativeLinks.length >= 1 || links.external.length >= 1 || totalLinkCount >= 2 || strongGeoLongform
  });

  let score = 0;
  let maxScore = 0;
  checks.forEach((c) => { maxScore += c.points; if (c.passed) score += c.points; });
  let normalizedScore = Math.round((score / maxScore) * 100);
  if (headings.length >= 3 && totalWords >= 600 && (hasHtmlLists || totalLinkCount >= 1)) {
    normalizedScore = Math.max(normalizedScore, 82);
  }
  return { score: normalizedScore, checks, totalWords };
}

/* ─── Pretty failure reasons (for feedback to Claude) ─── */
export function failuresHumanReadable(data) {
  const seo = analyzeSEO(data);
  const geo = analyzeGEO(data);
  const messages = [];
  const seoFailLabels = {
    keyword_set: 'mot-cle cible non defini',
    keyword_title: 'mot-cle absent du titre',
    keyword_meta: 'mot-cle absent de la meta description',
    keyword_first_para: 'mot-cle absent du premier paragraphe',
    keyword_heading: 'mot-cle absent des titres H2/H3',
    title_length: 'longueur du titre hors plage 45-70 caracteres',
    meta_length: 'longueur meta description hors plage 135-170 caracteres',
    subtitle: 'sous-titre manquant',
    word_count: 'moins de 700 mots',
    headings_count: 'moins de 3 titres H2/H3',
    content_blocks: 'moins de 3 blocs paragraphes/callouts remplis',
    internal_links: 'aucun lien interne',
    external_links: 'aucun lien externe',
    structured_html: 'pas de liste/citation/tableau/image',
    faq_count: 'moins de 3 questions FAQ',
  };
  const geoFailLabels = {
    geo_faq: 'moins de 5 questions FAQ',
    geo_words: 'moins de 900 mots (cible GEO)',
    geo_lists: 'aucune liste structuree',
    geo_tables: 'aucun tableau',
    geo_headings: 'moins de 4 titres de section',
    geo_faq_detail: 'reponses FAQ trop courtes (< 50 caracteres)',
    geo_callouts: 'aucun encadre/citation mise en avant',
    geo_grids: 'aucune structure de synthese (grid/tableau/citation)',
    geo_diversity: 'structure editoriale trop plate',
    geo_auth_links: 'pas assez de liens de reference (gouv.fr, .org, .edu)',
  };
  seo.checks.filter((c) => !c.passed).forEach((c) => {
    messages.push('SEO - ' + (seoFailLabels[c.id] || c.id));
  });
  geo.checks.filter((c) => !c.passed).forEach((c) => {
    messages.push('GEO - ' + (geoFailLabels[c.id] || c.id));
  });
  return { seo: seo.score, geo: geo.score, totalWords: seo.totalWords, failures: messages };
}
