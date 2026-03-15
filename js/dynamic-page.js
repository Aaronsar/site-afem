/* ─── Dynamic Page Renderer ─── */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://jhopwqpbaiyjfoggvcaf.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3B3cXBiYWl5amZvZ2d2Y2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI2OTEsImV4cCI6MjA4ODYyODY5MX0.rz3TJZryPxEf3P5kQgpzQkwN9aF8_F4eo4F03CEYVPs';

  var path = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '');
  // Fallback: query param ?p=slug
  var params = new URLSearchParams(window.location.search);
  if (params.get('p')) path = params.get('p');
  if (!path || path.endsWith('/_template')) return;

  function apiGet(table, query) {
    return fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + query, {
      headers: { 'apikey': SUPABASE_KEY, 'Accept': 'application/json' }
    }).then(function (r) { return r.json(); });
  }

  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }

  function formatDate(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  // Fetch page content
  apiGet('page_content', 'page_slug=eq.' + encodeURIComponent(path) + '&select=*')
    .then(function (rows) {
      if (!rows || !rows.length) {
        document.getElementById('dynamic-content').innerHTML =
          '<div style="text-align:center;padding:80px 20px;max-width:600px;margin:0 auto;">' +
          '<h1 style="font-size:28px;margin-bottom:12px;">Page non trouvée</h1>' +
          '<p style="color:#666;">Cette page n\'existe pas encore.</p>' +
          '<a href="/" style="display:inline-block;margin-top:20px;padding:10px 24px;background:#198754;color:#fff;border-radius:8px;text-decoration:none;">Retour à l\'accueil</a></div>';
        return;
      }
      var page = rows[0];

      // Update document
      if (page.title) document.title = page.title + ' | AFEM';
      var metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && page.meta_description) metaDesc.setAttribute('content', page.meta_description);

      var type = page.page_type;
      if (type === 'article') renderArticle(page);
      else if (type === 'prepa') renderPrepa(page);
      else if (type === 'faculte') renderFaculte(page);
      else renderGeneric(page);
    })
    .catch(function () {
      document.getElementById('dynamic-content').innerHTML =
        '<div style="text-align:center;padding:80px 20px;"><h1>Erreur</h1><p>Impossible de charger la page.</p></div>';
    });

  function renderArticle(page) {
    var html = '<article class="blog-article"><div class="container blog-container">';
    if (page.subtitle) html += '<span class="blog-category">' + esc(page.subtitle) + '</span>';
    html += '<h1>' + esc(page.title || '') + '</h1>';
    html += '<div class="blog-meta"><span class="blog-date">' + formatDate(page.created_at) + '</span>';
    html += '<span class="blog-author">Par l\'équipe AFEM</span></div>';

    if (page.sections && page.sections.length) {
      html += '<div class="blog-content">';
      page.sections.forEach(function (sec) {
        if (sec.heading) html += '<h2>' + sec.heading + '</h2>';
        if (sec.html) html += sec.html;
      });
      html += '</div>';
    }

    if (page.faq && page.faq.length) {
      html += '<div class="fac-faq" style="margin-top:48px;"><h2>Questions fréquentes</h2>';
      page.faq.forEach(function (item) {
        html += '<div class="fac-faq-item">';
        html += '<button class="fac-faq-question" onclick="this.parentElement.classList.toggle(\'open\')">' + esc(item.question);
        html += ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><polyline points="6 9 12 15 18 9"></polyline></svg></button>';
        html += '<div class="fac-faq-answer"><div class="fac-faq-answer-inner">' + (item.answer || '') + '</div></div>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div></article>';
    document.getElementById('dynamic-content').innerHTML = html;
  }

  function renderPrepa(page) {
    var html = '<section class="page-header"><div class="container">';
    html += '<h1>' + esc(page.title || '') + '</h1>';
    if (page.subtitle) html += '<p class="fac-subtitle">' + esc(page.subtitle) + '</p>';
    html += '</div></section>';

    if (page.sections && page.sections.length) {
      page.sections.forEach(function (sec) {
        html += '<section class="fac-section"><div class="container">';
        if (sec.heading) html += '<h2>' + sec.heading + '</h2>';
        if (sec.html) html += sec.html;
        html += '</div></section>';
      });
    }

    // Load prepas
    apiGet('prepas', 'page_slug=eq.' + encodeURIComponent(path) + '&order=sort_order')
      .then(function (prepas) {
        if (!prepas || !prepas.length) return;

        // Comparison table
        var tableHtml = '<section class="fac-section"><div class="container">';
        tableHtml += '<h2>Comparatif des prépas</h2>';
        tableHtml += '<div class="fac-table-wrapper"><table class="fac-table"><thead><tr><th>Prépa</th><th>Tarif annuel</th><th>Pré-rentrée</th><th>Notre avis</th></tr></thead><tbody>';
        prepas.forEach(function (p) {
          tableHtml += '<tr><td>' + esc(p.name) + '</td><td>' + esc(p.price || '') + '</td><td>' + esc(p.price_prerentree || '-') + '</td>';
          tableHtml += '<td>' + (p.is_featured ? '<strong>Notre coup de coeur</strong>' : esc(p.notes || '')) + '</td></tr>';
        });
        tableHtml += '</tbody></table></div></div></section>';

        // Prepa cards
        tableHtml += '<section class="fac-section"><div class="container"><h2>Détail des prépas</h2>';
        prepas.forEach(function (p) {
          tableHtml += '<div class="prepa-card"><h3>' + esc(p.name) + '</h3>';
          tableHtml += '<span class="prepa-type">' + esc(p.type || 'Présentiel') + '</span>';
          if (p.description) tableHtml += '<p>' + p.description + '</p>';
          if (p.points && p.points.length) {
            tableHtml += '<ul class="prepa-points">';
            p.points.forEach(function (pt) { tableHtml += '<li>' + esc(pt) + '</li>'; });
            tableHtml += '</ul>';
          }
          if (p.price) tableHtml += '<span class="prepa-tarif">' + esc(p.price) + '</span>';
          tableHtml += '</div>';
        });
        tableHtml += '</div></section>';

        document.getElementById('dynamic-content').insertAdjacentHTML('beforeend', tableHtml);
      });

    if (page.faq && page.faq.length) {
      html += '<section class="fac-section fac-faq"><div class="container"><h2>Questions fréquentes</h2>';
      page.faq.forEach(function (item) {
        html += '<div class="fac-faq-item">';
        html += '<button class="fac-faq-question" onclick="this.parentElement.classList.toggle(\'open\')">' + esc(item.question);
        html += ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><polyline points="6 9 12 15 18 9"></polyline></svg></button>';
        html += '<div class="fac-faq-answer"><div class="fac-faq-answer-inner">' + (item.answer || '') + '</div></div>';
        html += '</div>';
      });
      html += '</div></section>';
    }

    document.getElementById('dynamic-content').innerHTML = html;
  }

  function renderFaculte(page) {
    var html = '<section class="page-header"><div class="container">';
    html += '<h1>' + esc(page.title || '') + '</h1>';
    if (page.subtitle) html += '<p class="fac-subtitle">' + esc(page.subtitle) + '</p>';
    html += '</div></section>';

    // Stats will be loaded separately
    html += '<section class="fac-section"><div class="container"><div class="fac-stats-grid" id="fac-stats-grid"></div></div></section>';

    if (page.sections && page.sections.length) {
      page.sections.forEach(function (sec) {
        html += '<section class="fac-section"><div class="container">';
        if (sec.heading) html += '<h2>' + sec.heading + '</h2>';
        if (sec.html) html += sec.html;
        html += '</div></section>';
      });
    }

    if (page.faq && page.faq.length) {
      html += '<section class="fac-section fac-faq"><div class="container"><h2>Questions fréquentes</h2>';
      page.faq.forEach(function (item) {
        html += '<div class="fac-faq-item">';
        html += '<button class="fac-faq-question" onclick="this.parentElement.classList.toggle(\'open\')">' + esc(item.question);
        html += ' <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px;"><polyline points="6 9 12 15 18 9"></polyline></svg></button>';
        html += '<div class="fac-faq-answer"><div class="fac-faq-answer-inner">' + (item.answer || '') + '</div></div>';
        html += '</div>';
      });
      html += '</div></section>';
    }

    document.getElementById('dynamic-content').innerHTML = html;

    // Load fac stats
    apiGet('fac_stats', 'page_slug=eq.' + encodeURIComponent(path))
      .then(function (rows) {
        if (!rows || !rows.length) return;
        var s = rows[0];
        var grid = document.getElementById('fac-stats-grid');
        if (!grid) return;
        var statsHtml = '';
        if (s.etudiants_pass) statsHtml += '<div class="fac-stat"><div class="fac-stat-value">' + s.etudiants_pass + '</div><div class="fac-stat-label">Étudiants PASS</div></div>';
        if (s.places_2e_annee) statsHtml += '<div class="fac-stat"><div class="fac-stat-value">' + s.places_2e_annee + '</div><div class="fac-stat-label">Places 2e année</div></div>';
        if (s.taux_reussite_pass) statsHtml += '<div class="fac-stat"><div class="fac-stat-value">' + s.taux_reussite_pass + '%</div><div class="fac-stat-label">Taux réussite PASS</div></div>';
        if (s.voeux_parcoursup) statsHtml += '<div class="fac-stat"><div class="fac-stat-value">' + s.voeux_parcoursup + '</div><div class="fac-stat-label">Voeux Parcoursup</div></div>';
        grid.innerHTML = statsHtml;
      });
  }

  function renderGeneric(page) {
    var html = '<section class="page-header"><div class="container">';
    html += '<h1>' + esc(page.title || '') + '</h1>';
    if (page.subtitle) html += '<p>' + esc(page.subtitle) + '</p>';
    html += '</div></section>';

    if (page.sections && page.sections.length) {
      page.sections.forEach(function (sec) {
        html += '<section class="fac-section"><div class="container">';
        if (sec.heading) html += '<h2>' + sec.heading + '</h2>';
        if (sec.html) html += sec.html;
        html += '</div></section>';
      });
    }

    document.getElementById('dynamic-content').innerHTML = html;
  }
})();
