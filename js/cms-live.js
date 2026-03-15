/* ─── CMS Live Content Injection ─── */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://jhopwqpbaiyjfoggvcaf.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3B3cXBiYWl5amZvZ2d2Y2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI2OTEsImV4cCI6MjA4ODYyODY5MX0.rz3TJZryPxEf3P5kQgpzQkwN9aF8_F4eo4F03CEYVPs';

  // Determine page slug from URL
  var path = window.location.pathname.replace(/^\//, '').replace(/\.html$/, '');
  if (!path) path = 'index';

  // REST API helper
  function apiGet(table, query) {
    return fetch(SUPABASE_URL + '/rest/v1/' + table + '?' + query, {
      headers: { 'apikey': SUPABASE_KEY, 'Accept': 'application/json' }
    }).then(function (r) { return r.json(); });
  }

  // Patch page content
  apiGet('page_content', 'page_slug=eq.' + encodeURIComponent(path) + '&select=*')
    .then(function (rows) {
      if (!rows || !rows.length) return;
      var page = rows[0];

      // Title
      if (page.title) {
        var h1 = document.querySelector('h1');
        if (h1) h1.innerHTML = page.title;
      }

      // Meta description
      if (page.meta_description) {
        var meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute('content', page.meta_description);
        document.title = (page.title || document.title.split('|')[0].trim()) + ' | AFEM';
      }

      // Subtitle
      if (page.subtitle) {
        var sub = document.querySelector('.fac-subtitle, .page-header p, .blog-meta');
        if (sub) sub.innerHTML = page.subtitle;
      }

      // Sections
      if (page.sections && page.sections.length) {
        var sectionEls = document.querySelectorAll('.fac-section');
        page.sections.forEach(function (sec, i) {
          if (!sectionEls[i]) return;
          if (sec.heading) {
            var h2 = sectionEls[i].querySelector('h2');
            if (h2) h2.innerHTML = sec.heading;
          }
          if (sec.html) {
            var h2el = sectionEls[i].querySelector('h2');
            if (h2el) {
              // Remove content after h2 and replace
              while (h2el.nextSibling) h2el.nextSibling.remove();
              var wrapper = document.createElement('div');
              wrapper.innerHTML = sec.html;
              while (wrapper.firstChild) {
                h2el.parentNode.appendChild(wrapper.firstChild);
              }
            }
          }
        });
      }

      // FAQ
      if (page.faq && page.faq.length) {
        var faqItems = document.querySelectorAll('.fac-faq-item');
        page.faq.forEach(function (item, i) {
          if (!faqItems[i]) return;
          var btn = faqItems[i].querySelector('.fac-faq-question');
          var answer = faqItems[i].querySelector('.fac-faq-answer-inner');
          if (btn && item.question) {
            var svg = btn.querySelector('svg');
            btn.textContent = item.question + ' ';
            if (svg) btn.appendChild(svg);
          }
          if (answer && item.answer) answer.innerHTML = item.answer;
        });
      }
    })
    .catch(function () { /* Silent fail - original HTML stays */ });

  // Patch prepas for prepa pages
  if (path.indexOf('prepas-medecine/') === 0) {
    apiGet('prepas', 'page_slug=eq.' + encodeURIComponent(path) + '&order=sort_order')
      .then(function (prepas) {
        if (!prepas || !prepas.length) return;

        // Rebuild comparison table
        var table = document.querySelector('.prepa-comparison-table tbody, .fac-table tbody');
        if (table) {
          var tbody = '';
          prepas.forEach(function (p) {
            tbody += '<tr>';
            tbody += '<td>' + esc(p.name) + '</td>';
            tbody += '<td>' + esc(p.price || '') + '</td>';
            tbody += '<td>' + esc(p.price_prerentree || '-') + '</td>';
            tbody += '<td>' + (p.is_featured ? '<strong>Notre coup de coeur</strong>' : (esc(p.notes || ''))) + '</td>';
            tbody += '</tr>';
          });
          table.innerHTML = tbody;
        }

        // Rebuild prepa detail cards
        var cardsContainer = document.querySelector('.fac-section:last-of-type');
        if (!cardsContainer) return;
        var existingCards = cardsContainer.querySelectorAll('.prepa-card');
        if (existingCards.length === 0) return;

        // Clear existing cards
        existingCards.forEach(function (c) { c.remove(); });

        // Insert new cards
        var h2 = cardsContainer.querySelector('h2');
        prepas.forEach(function (p) {
          var card = document.createElement('div');
          card.className = 'prepa-card';
          var html = '<h3>' + esc(p.name) + '</h3>';
          html += '<span class="prepa-type">' + esc(p.type || 'Présentiel') + '</span>';
          if (p.description) html += '<p>' + p.description + '</p>';
          if (p.points && p.points.length) {
            html += '<ul class="prepa-points">';
            p.points.forEach(function (pt) { html += '<li>' + esc(pt) + '</li>'; });
            html += '</ul>';
          }
          if (p.price) html += '<span class="prepa-tarif">' + esc(p.price) + '</span>';
          card.innerHTML = html;
          cardsContainer.appendChild(card);
        });
      })
      .catch(function () {});
  }

  // Patch fac stats for faculte pages
  if (path.indexOf('facultes/') === 0) {
    apiGet('fac_stats', 'page_slug=eq.' + encodeURIComponent(path))
      .then(function (rows) {
        if (!rows || !rows.length) return;
        var s = rows[0];

        // Update stats grid
        var statValues = document.querySelectorAll('.fac-stat-value, .stat-value');
        var statLabels = document.querySelectorAll('.fac-stat-label, .stat-label');
        var statsMap = [
          { val: s.etudiants_pass, label: 'Étudiants PASS' },
          { val: s.places_2e_annee, label: 'Places 2e année' },
          { val: s.taux_reussite_pass ? s.taux_reussite_pass + '%' : null, label: 'Taux réussite PASS' },
          { val: s.voeux_parcoursup, label: 'Voeux Parcoursup' }
        ];
        statsMap.forEach(function (item, i) {
          if (item.val && statValues[i]) statValues[i].textContent = item.val;
        });
      })
      .catch(function () {});
  }

  function esc(s) {
    var d = document.createElement('div');
    d.textContent = s;
    return d.innerHTML;
  }
})();
