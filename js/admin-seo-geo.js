/* ═══════════════════════════════════════════════════
   AFEM Advanced SEO & GEO Scoring — Block-aware
   15 SEO checks + 10 GEO checks with focus keyword
   ═══════════════════════════════════════════════════ */

(function () {
  'use strict';

  /* ─── Helpers ─── */
  function stripHtml(html) {
    if (!html) return '';
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || '').trim();
  }

  function normalize(text) {
    return (text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
  }

  function countWords(text) {
    var clean = stripHtml(text);
    return clean.split(/\s+/).filter(Boolean).length;
  }

  function extractAllText(blocks) {
    var text = '';
    (blocks || []).forEach(function (b) {
      switch (b.type) {
        case 'heading':
          text += ' ' + (b.text || '');
          break;
        case 'paragraph':
        case 'callout':
          text += ' ' + stripHtml(b.html || '');
          break;
        case 'list':
          (b.items || []).forEach(function (item) { text += ' ' + item; });
          break;
        case 'table':
          (b.headers || []).forEach(function (h) { text += ' ' + h; });
          (b.rows || []).forEach(function (row) { row.forEach(function (c) { text += ' ' + c; }); });
          break;
        case 'grid':
          (b.items || []).forEach(function (item) { text += ' ' + (item.title || '') + ' ' + (item.description || ''); });
          break;
        case 'faq':
          (b.items || []).forEach(function (item) { text += ' ' + (item.question || '') + ' ' + stripHtml(item.answer || ''); });
          break;
      }
    });
    return text;
  }

  function extractAllHtml(blocks) {
    var html = '';
    (blocks || []).forEach(function (b) {
      if (b.type === 'paragraph' || b.type === 'callout') html += ' ' + (b.html || '');
      if (b.type === 'faq') (b.items || []).forEach(function (item) { html += ' ' + (item.answer || ''); });
    });
    return html;
  }

  function extractLinks(html) {
    var internal = [];
    var external = [];
    var regex = /<a[^>]*href="([^"]*)"[^>]*>/g;
    var match;
    while ((match = regex.exec(html)) !== null) {
      var url = match[1];
      if (url.indexOf('/') === 0 || url.indexOf('afem-edu.fr') > -1) {
        internal.push(url);
      } else if (url.indexOf('http') === 0) {
        external.push(url);
      }
    }
    return { internal: internal, external: external };
  }

  function getBlocksByType(blocks, type) {
    return (blocks || []).filter(function (b) { return b.type === type; });
  }

  function getDistinctBlockTypes(blocks) {
    var types = {};
    (blocks || []).forEach(function (b) { if (b.type) types[b.type] = true; });
    return Object.keys(types).length;
  }

  /* ─── SEO Analysis (15 checks, 100 pts) ─── */
  function analyzeSEO(data) {
    var title = data.title || '';
    var metaDesc = data.meta_description || '';
    var subtitle = data.subtitle || '';
    var keyword = normalize(data.focus_keyword || '');
    var blocks = data.sections || [];
    var allText = extractAllText(blocks);
    var allHtml = extractAllHtml(blocks);
    var links = extractLinks(allHtml);
    var totalWords = countWords(allText);
    var headings = getBlocksByType(blocks, 'heading');
    var paragraphs = getBlocksByType(blocks, 'paragraph');
    var callouts = getBlocksByType(blocks, 'callout');
    var images = getBlocksByType(blocks, 'image');
    var faqBlocks = getBlocksByType(blocks, 'faq');
    var faqItemCount = 0;
    faqBlocks.forEach(function (b) { faqItemCount += (b.items || []).length; });
    var filledContent = paragraphs.filter(function (b) { return (b.html || '').length > 30; })
      .concat(callouts.filter(function (b) { return (b.html || '').length > 30; }));

    var checks = [];

    // 1. Focus keyword set (5pt)
    checks.push({
      id: 'keyword_set', category: 'basic', points: 5,
      passed: keyword.length > 0,
      good: 'Mot-clé cible défini',
      bad: 'Mot-clé cible non défini'
    });

    // 2. Keyword in title (8pt)
    checks.push({
      id: 'keyword_title', category: 'basic', points: 8,
      passed: keyword.length > 0 && normalize(title).indexOf(keyword) > -1,
      good: 'Mot-clé présent dans le titre',
      bad: keyword.length > 0 ? 'Mot-clé absent du titre' : 'Définir un mot-clé cible'
    });

    // 3. Keyword in meta description (5pt)
    checks.push({
      id: 'keyword_meta', category: 'basic', points: 5,
      passed: keyword.length > 0 && normalize(metaDesc).indexOf(keyword) > -1,
      good: 'Mot-clé dans la meta description',
      bad: keyword.length > 0 ? 'Mot-clé absent de la meta description' : 'Définir un mot-clé cible'
    });

    // 4. Keyword in first paragraph (5pt)
    var firstParagraphText = '';
    if (paragraphs.length) firstParagraphText = normalize(stripHtml(paragraphs[0].html || ''));
    checks.push({
      id: 'keyword_first_para', category: 'content', points: 5,
      passed: keyword.length > 0 && firstParagraphText.indexOf(keyword) > -1,
      good: 'Mot-clé dans le premier paragraphe',
      bad: keyword.length > 0 ? 'Mot-clé absent du premier paragraphe' : 'Définir un mot-clé cible'
    });

    // 5. Keyword in headings (5pt)
    var keywordInHeading = headings.some(function (h) { return normalize(h.text || '').indexOf(keyword) > -1; });
    checks.push({
      id: 'keyword_heading', category: 'content', points: 5,
      passed: keyword.length > 0 && keywordInHeading,
      good: 'Mot-clé dans un titre H2/H3',
      bad: keyword.length > 0 ? 'Mot-clé absent des titres H2/H3' : 'Définir un mot-clé cible'
    });

    // 6. Title length 50-65 chars (8pt)
    checks.push({
      id: 'title_length', category: 'basic', points: 8,
      passed: title.length >= 50 && title.length <= 65,
      good: 'Titre ' + title.length + ' car. (50-65)',
      bad: title.length > 0 ? 'Titre ' + title.length + ' car. (idéal 50-65)' : 'Titre manquant'
    });

    // 7. Meta description 140-160 chars (8pt)
    checks.push({
      id: 'meta_length', category: 'basic', points: 8,
      passed: metaDesc.length >= 140 && metaDesc.length <= 160,
      good: 'Meta ' + metaDesc.length + ' car. (140-160)',
      bad: metaDesc.length > 0 ? 'Meta ' + metaDesc.length + ' car. (idéal 140-160)' : 'Meta description manquante'
    });

    // 8. Subtitle present (3pt)
    checks.push({
      id: 'subtitle', category: 'basic', points: 3,
      passed: subtitle.length > 0,
      good: 'Sous-titre présent',
      bad: 'Sous-titre manquant'
    });

    // 9. Word count >= 800 (10pt)
    checks.push({
      id: 'word_count', category: 'content', points: 10,
      passed: totalWords >= 800,
      good: totalWords + ' mots (min. 800)',
      bad: totalWords + ' mots (min. 800 recommandé)'
    });

    // 10. >= 3 heading blocks (8pt)
    checks.push({
      id: 'headings_count', category: 'content', points: 8,
      passed: headings.length >= 3,
      good: headings.length + ' titres H2/H3',
      bad: headings.length + '/3 titres minimum'
    });

    // 11. >= 3 filled content blocks (5pt)
    checks.push({
      id: 'content_blocks', category: 'content', points: 5,
      passed: filledContent.length >= 3,
      good: filledContent.length + ' blocs de contenu remplis',
      bad: filledContent.length + '/3 blocs minimum'
    });

    // 12. Internal links present (8pt)
    checks.push({
      id: 'internal_links', category: 'links', points: 8,
      passed: links.internal.length >= 2,
      good: links.internal.length + ' liens internes',
      bad: links.internal.length + '/2 liens internes minimum'
    });

    // 13. External links present (5pt)
    checks.push({
      id: 'external_links', category: 'links', points: 5,
      passed: links.external.length >= 1,
      good: links.external.length + ' lien(s) externe(s)',
      bad: 'Pas de liens externes'
    });

    // 14. Images with alt text (5pt)
    var imagesWithAlt = images.filter(function (img) { return (img.alt || '').length > 0; });
    checks.push({
      id: 'images_alt', category: 'links', points: 5,
      passed: images.length === 0 || imagesWithAlt.length === images.length,
      good: images.length > 0 ? imagesWithAlt.length + '/' + images.length + ' images avec alt' : 'Pas d\'images (OK)',
      bad: imagesWithAlt.length + '/' + images.length + ' images avec texte alt'
    });

    // 15. FAQ with 3+ items (12pt)
    checks.push({
      id: 'faq_count', category: 'content', points: 12,
      passed: faqItemCount >= 3,
      good: faqItemCount + ' questions FAQ',
      bad: faqItemCount + '/3 questions FAQ minimum'
    });

    // Calculate total
    var score = 0;
    var maxScore = 0;
    checks.forEach(function (c) {
      maxScore += c.points;
      if (c.passed) score += c.points;
    });

    return { score: Math.round((score / maxScore) * 100), checks: checks };
  }

  /* ─── GEO Analysis (10 checks, 100 pts) ─── */
  function analyzeGEO(data) {
    var blocks = data.sections || [];
    var allText = extractAllText(blocks);
    var allHtml = extractAllHtml(blocks);
    var links = extractLinks(allHtml);
    var totalWords = countWords(allText);
    var headings = getBlocksByType(blocks, 'heading');
    var lists = getBlocksByType(blocks, 'list');
    var tables = getBlocksByType(blocks, 'table');
    var callouts = getBlocksByType(blocks, 'callout');
    var grids = getBlocksByType(blocks, 'grid');
    var faqBlocks = getBlocksByType(blocks, 'faq');
    var faqItems = [];
    faqBlocks.forEach(function (b) { faqItems = faqItems.concat(b.items || []); });
    var detailedFaq = faqItems.filter(function (f) { return (f.answer || '').length > 50; });
    var distinctTypes = getDistinctBlockTypes(blocks);
    var authoritativeLinks = links.external.filter(function (url) {
      return /\.(gouv\.fr|edu|org|europa\.eu|who\.int)/i.test(url);
    });

    var checks = [];

    // 1. FAQ 5+ items (15pt)
    checks.push({
      id: 'geo_faq', category: 'structure', points: 15,
      passed: faqItems.length >= 5,
      good: faqItems.length + ' questions FAQ',
      bad: faqItems.length + '/5 questions FAQ minimum'
    });

    // 2. Word count >= 1500 (15pt)
    checks.push({
      id: 'geo_words', category: 'content', points: 15,
      passed: totalWords >= 1500,
      good: totalWords + ' mots (min. 1500)',
      bad: totalWords + '/1500 mots minimum'
    });

    // 3. Lists present (10pt)
    checks.push({
      id: 'geo_lists', category: 'structure', points: 10,
      passed: lists.length >= 1,
      good: lists.length + ' liste(s) structurée(s)',
      bad: 'Pas de liste structurée'
    });

    // 4. Tables present (10pt)
    checks.push({
      id: 'geo_tables', category: 'structure', points: 10,
      passed: tables.length >= 1,
      good: tables.length + ' tableau(x)',
      bad: 'Pas de tableau'
    });

    // 5. >= 5 headings (10pt)
    checks.push({
      id: 'geo_headings', category: 'structure', points: 10,
      passed: headings.length >= 5,
      good: headings.length + ' titres de section',
      bad: headings.length + '/5 titres minimum'
    });

    // 6. FAQ answers detailed >50 chars (10pt)
    checks.push({
      id: 'geo_faq_detail', category: 'content', points: 10,
      passed: faqItems.length > 0 && detailedFaq.length >= faqItems.length,
      good: 'Réponses FAQ détaillées (' + detailedFaq.length + '/' + faqItems.length + ')',
      bad: detailedFaq.length + '/' + faqItems.length + ' réponses FAQ détaillées (>50 car.)'
    });

    // 7. Callout present (5pt)
    checks.push({
      id: 'geo_callouts', category: 'structure', points: 5,
      passed: callouts.length >= 1,
      good: callouts.length + ' encadré(s)',
      bad: 'Pas d\'encadré (info/attention)'
    });

    // 8. Grid present (5pt)
    checks.push({
      id: 'geo_grids', category: 'structure', points: 5,
      passed: grids.length >= 1,
      good: grids.length + ' grille(s)',
      bad: 'Pas de grille'
    });

    // 9. Content diversity 4+ block types (10pt)
    checks.push({
      id: 'geo_diversity', category: 'content', points: 10,
      passed: distinctTypes >= 4,
      good: distinctTypes + ' types de blocs utilisés',
      bad: distinctTypes + '/4 types de blocs minimum'
    });

    // 10. Authoritative external links (10pt)
    checks.push({
      id: 'geo_auth_links', category: 'links', points: 10,
      passed: authoritativeLinks.length >= 1,
      good: authoritativeLinks.length + ' lien(s) autoritaire(s) (.gouv, .edu, .org)',
      bad: 'Pas de liens vers sources officielles'
    });

    // Calculate total
    var score = 0;
    var maxScore = 0;
    checks.forEach(function (c) {
      maxScore += c.points;
      if (c.passed) score += c.points;
    });

    return { score: Math.round((score / maxScore) * 100), checks: checks };
  }

  /* ─── Score Badge ─── */
  function scoreBadge(score) {
    var cls = score >= 75 ? 'score-green' : score >= 50 ? 'score-orange' : 'score-red';
    return '<span class="score-badge ' + cls + '">' + score + '</span>';
  }

  /* ─── Render Advanced Score Panel ─── */
  window.renderAdvancedScorePanel = function () {
    var d = window._pageData || {};
    var html = '<div class="admin-score-panel" id="score-panel">';
    html += '<div class="admin-meta-box-header">Optimisation</div>';
    html += '<div class="score-panel-body">';

    // Focus keyword field
    html += '<div class="admin-field" style="margin-bottom:12px;">';
    html += '<label>Mot-clé cible (focus keyword)</label>';
    html += '<input type="text" name="focus_keyword" value="' + (d.focus_keyword ? String(d.focus_keyword).replace(/"/g, '&quot;') : '') + '" placeholder="Ex: prépa médecine" oninput="markUnsaved()">';
    html += '</div>';

    // Score summary
    html += '<div class="score-summary" id="score-summary"></div>';

    // AI improve button
    html += '<button class="btn-improve" onclick="improveArticle()">&#10024; Améliorer avec l\'IA</button>';

    // Score checks
    html += '<div class="score-checks" id="score-checks"></div>';

    html += '</div></div>';
    return html;
  };

  /* ─── Collect Form Data from Blocks for Scoring ─── */
  window.collectFormDataFromBlocks = function () {
    var getVal = function (n) { var el = document.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; };
    return {
      title: getVal('title'),
      meta_description: getVal('meta_description'),
      subtitle: getVal('subtitle'),
      focus_keyword: getVal('focus_keyword'),
      sections: window.collectAllBlocks ? window.collectAllBlocks() : [],
      faq: [] // FAQ is now inside blocks
    };
  };

  /* ─── Update Score Panel ─── */
  window.updateAdvancedScorePanel = function () {
    var panel = document.getElementById('score-panel');
    if (!panel) return;

    var d = window.collectFormDataFromBlocks();
    var seo = analyzeSEO(d);
    var geo = analyzeGEO(d);

    // Store scores for saving
    window._lastSEOScore = seo.score;
    window._lastGEOScore = geo.score;

    // Summary
    var summaryEl = document.getElementById('score-summary');
    if (summaryEl) {
      summaryEl.innerHTML =
        '<div class="score-row"><span>SEO</span>' + scoreBadge(seo.score) + '</div>' +
        '<div class="score-row"><span>GEO</span>' + scoreBadge(geo.score) + '</div>';
    }

    // Checks
    var checksEl = document.getElementById('score-checks');
    if (checksEl) {
      var html = '';

      // SEO checks
      html += '<div class="score-check-label">SEO — Référencement</div>';
      seo.checks.forEach(function (c) {
        html += '<div class="score-check ' + (c.passed ? 'pass' : 'fail') + '">' +
          '<span>' + (c.passed ? '&#10003;' : '&#10007;') + '</span>' +
          '<span>' + (c.passed ? c.good : c.bad) + '</span></div>';
      });

      // GEO checks
      html += '<div class="score-check-label" style="margin-top:12px;">GEO — Moteurs IA</div>';
      geo.checks.forEach(function (c) {
        html += '<div class="score-check ' + (c.passed ? 'pass' : 'fail') + '">' +
          '<span>' + (c.passed ? '&#10003;' : '&#10007;') + '</span>' +
          '<span>' + (c.passed ? c.good : c.bad) + '</span></div>';
      });

      checksEl.innerHTML = html;
    }
  };

  /* ─── Bind Score Updates (real-time) ─── */
  var _advScoreTimer = null;

  window.bindAdvancedScoreUpdates = function () {
    var content = document.querySelector('.admin-editor-content');
    var sidebar = document.querySelector('.admin-editor-sidebar');

    function debounceUpdate() {
      clearTimeout(_advScoreTimer);
      _advScoreTimer = setTimeout(window.updateAdvancedScorePanel, 500);
    }

    if (content) content.addEventListener('input', debounceUpdate);
    if (sidebar) sidebar.addEventListener('input', debounceUpdate);

    // Observe block additions/removals
    var blocksList = document.getElementById('blocks-list');
    if (blocksList) {
      new MutationObserver(function () {
        clearTimeout(_advScoreTimer);
        _advScoreTimer = setTimeout(window.updateAdvancedScorePanel, 300);
      }).observe(blocksList, { childList: true, subtree: true });
    }
  };

  /* ─── Legacy-compatible SEO/GEO calculation (for savePage scores) ─── */
  window.calculateAdvancedSEO = function (d) { return analyzeSEO(d).score; };
  window.calculateAdvancedGEO = function (d) { return analyzeGEO(d).score; };

})();
