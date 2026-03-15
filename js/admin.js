/* ─── AFEM Admin Panel ─── */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://jhopwqpbaiyjfoggvcaf.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3B3cXBiYWl5amZvZ2d2Y2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI2OTEsImV4cCI6MjA4ODYyODY5MX0.rz3TJZryPxEf3P5kQgpzQkwN9aF8_F4eo4F03CEYVPs';

  var sb; // supabase client
  var state = {
    currentSlug: null,
    pageData: null,
    prepasData: [],
    facStatsData: null,
    unsaved: false
  };

  // ─── Page registry ─────────────────────────────────
  var PAGES = {
    'Prépas médecine': [
      { slug: 'prepas-medecine/paris', label: 'Paris', type: 'prepa' },
      { slug: 'prepas-medecine/lyon', label: 'Lyon', type: 'prepa' },
      { slug: 'prepas-medecine/marseille', label: 'Marseille', type: 'prepa' },
      { slug: 'prepas-medecine/lille', label: 'Lille', type: 'prepa' },
      { slug: 'prepas-medecine/bordeaux', label: 'Bordeaux', type: 'prepa' },
      { slug: 'prepas-medecine/toulouse', label: 'Toulouse', type: 'prepa' },
      { slug: 'prepas-medecine/grenoble', label: 'Grenoble', type: 'prepa' },
      { slug: 'prepas-medecine/nancy', label: 'Nancy', type: 'prepa' },
      { slug: 'prepas-medecine/nice', label: 'Nice', type: 'prepa' },
      { slug: 'prepas-medecine/strasbourg', label: 'Strasbourg', type: 'prepa' },
      { slug: 'prepas-medecine/montpellier', label: 'Montpellier', type: 'prepa' },
      { slug: 'prepas-medecine/nantes', label: 'Nantes', type: 'prepa' },
      { slug: 'prepas-medecine/rennes', label: 'Rennes', type: 'prepa' },
      { slug: 'prepas-medecine/poitiers', label: 'Poitiers', type: 'prepa' },
      { slug: 'prepas-medecine/rouen', label: 'Rouen', type: 'prepa' },
      { slug: 'prepas-medecine/reims', label: 'Reims', type: 'prepa' },
      { slug: 'prepas-medecine/angers', label: 'Angers', type: 'prepa' },
      { slug: 'prepas-medecine/dijon', label: 'Dijon', type: 'prepa' },
      { slug: 'prepas-medecine/besancon', label: 'Besançon', type: 'prepa' },
      { slug: 'prepas-medecine/clermont-ferrand', label: 'Clermont-Ferrand', type: 'prepa' },
      { slug: 'prepas-medecine/amiens', label: 'Amiens', type: 'prepa' }
    ],
    'Facultés': [
      { slug: 'facultes/paris-cite', label: 'Paris Cité', type: 'faculte' },
      { slug: 'facultes/sorbonne-universite', label: 'Sorbonne Université', type: 'faculte' },
      { slug: 'facultes/paris-saclay', label: 'Paris-Saclay', type: 'faculte' },
      { slug: 'facultes/versailles-uvsq', label: 'UVSQ', type: 'faculte' },
      { slug: 'facultes/sorbonne-nord', label: 'Sorbonne Paris Nord', type: 'faculte' },
      { slug: 'facultes/lyon', label: 'Lyon', type: 'faculte' },
      { slug: 'facultes/aix-marseille', label: 'Aix-Marseille', type: 'faculte' },
      { slug: 'facultes/bordeaux', label: 'Bordeaux', type: 'faculte' },
      { slug: 'facultes/toulouse', label: 'Toulouse', type: 'faculte' },
      { slug: 'facultes/montpellier', label: 'Montpellier', type: 'faculte' },
      { slug: 'facultes/lille', label: 'Lille', type: 'faculte' },
      { slug: 'facultes/nantes', label: 'Nantes', type: 'faculte' },
      { slug: 'facultes/rennes', label: 'Rennes', type: 'faculte' },
      { slug: 'facultes/grenoble-alpes', label: 'Grenoble Alpes', type: 'faculte' },
      { slug: 'facultes/nancy', label: 'Nancy', type: 'faculte' },
      { slug: 'facultes/rouen', label: 'Rouen', type: 'faculte' },
      { slug: 'facultes/tours', label: 'Tours', type: 'faculte' },
      { slug: 'facultes/angers', label: 'Angers', type: 'faculte' },
      { slug: 'facultes/besancon', label: 'Besançon', type: 'faculte' },
      { slug: 'facultes/clermont-ferrand', label: 'Clermont-Ferrand', type: 'faculte' },
      { slug: 'facultes/dijon', label: 'Dijon', type: 'faculte' },
      { slug: 'facultes/limoges', label: 'Limoges', type: 'faculte' },
      { slug: 'facultes/orleans', label: 'Orléans', type: 'faculte' },
      { slug: 'facultes/saint-etienne', label: 'Saint-Étienne', type: 'faculte' },
      { slug: 'facultes/brest', label: 'Brest', type: 'faculte' },
      { slug: 'facultes/amiens', label: 'Amiens', type: 'faculte' },
      { slug: 'facultes/reunion', label: 'Réunion', type: 'faculte' },
      { slug: 'facultes/antilles', label: 'Antilles', type: 'faculte' },
      { slug: 'facultes/guyane', label: 'Guyane', type: 'faculte' },
      { slug: 'facultes/corse', label: 'Corse', type: 'faculte' }
    ],
    'Articles': [
      { slug: 'articles/5-conseils-rentree-pass', label: '5 conseils rentrée PASS', type: 'article' },
      { slug: 'articles/anki-pass-guide', label: 'Guide Anki PASS', type: 'article' },
      { slug: 'articles/choisir-mineure-pass', label: 'Choisir sa mineure', type: 'article' },
      { slug: 'articles/choisir-sa-fac-de-medecine', label: 'Choisir sa fac', type: 'article' },
      { slug: 'articles/debouches-etudes-sante', label: 'Débouchés études santé', type: 'article' },
      { slug: 'articles/faut-il-prepa-medecine', label: 'Faut-il une prépa ?', type: 'article' },
      { slug: 'articles/gerer-vie-sociale-pass', label: 'Vie sociale PASS', type: 'article' },
      { slug: 'articles/lettre-motivation-parcoursup', label: 'Lettre motivation', type: 'article' },
      { slug: 'articles/matieres-programme-pass-las', label: 'Matières PASS/LAS', type: 'article' },
      { slug: 'articles/methode-des-j-memorisation-pass', label: 'Méthode des J', type: 'article' },
      { slug: 'articles/parcoursup-dates-cles-2026', label: 'Dates Parcoursup 2026', type: 'article' },
      { slug: 'articles/pass-ou-las-comment-choisir', label: 'PASS ou LAS', type: 'article' },
      { slug: 'articles/qcm-pass-las-guide-complet', label: 'Guide QCM', type: 'article' },
      { slug: 'articles/quelle-moyenne-pour-medecine', label: 'Quelle moyenne ?', type: 'article' },
      { slug: 'articles/rattraper-retard-pass', label: 'Rattraper son retard', type: 'article' },
      { slug: 'articles/reussir-pass-conseils', label: 'Réussir PASS', type: 'article' },
      { slug: 'articles/specialites-lycee-medecine', label: 'Spécialités lycée', type: 'article' }
    ],
    'Pages principales': [
      { slug: 'index', label: 'Accueil', type: 'root' },
      { slug: 'coaching', label: 'Coaching', type: 'root' },
      { slug: 'simulateur', label: 'Simulateur', type: 'root' },
      { slug: 'quizz', label: 'Quizz', type: 'root' },
      { slug: 'qcm-medecine', label: 'QCM Médecine', type: 'root' },
      { slug: 'calculateur-reussite', label: 'Calculateur', type: 'root' },
      { slug: 'qui-sommes-nous', label: 'Qui sommes-nous', type: 'root' },
      { slug: 'blog', label: 'Blog', type: 'root' },
      { slug: 'prepas-medecine', label: 'Prépas (listing)', type: 'root' },
      { slug: 'facultes', label: 'Facultés (listing)', type: 'root' },
      { slug: 'prepa-diploma-sante', label: 'Diploma Santé', type: 'root' },
      { slug: 'prepa-medibox', label: 'Medibox', type: 'root' }
    ]
  };

  // ─── Init ─────────────────────────────────────────
  function init() {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    checkSession();
  }

  async function checkSession() {
    var result = await sb.auth.getSession();
    var session = result.data.session;
    if (session) {
      showDashboard();
    } else {
      showLogin();
    }
  }

  // ─── Login ────────────────────────────────────────
  function showLogin() {
    document.getElementById('admin-login').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';

    var form = document.getElementById('login-form');
    form.onsubmit = async function (e) {
      e.preventDefault();
      var email = document.getElementById('login-email').value;
      var pass = document.getElementById('login-password').value;
      var btn = form.querySelector('.btn-login');
      var err = document.getElementById('login-error');

      btn.disabled = true;
      err.style.display = 'none';

      var result = await sb.auth.signInWithPassword({ email: email, password: pass });
      if (result.error) {
        err.textContent = 'Identifiants incorrects';
        err.style.display = 'block';
        btn.disabled = false;
        return;
      }
      showDashboard();
    };
  }

  // ─── Dashboard ────────────────────────────────────
  function showDashboard() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'flex';
    renderSidebar();
  }

  function renderSidebar() {
    var container = document.getElementById('admin-sidebar-list');
    var html = '';

    Object.keys(PAGES).forEach(function (cat) {
      html += '<div class="admin-sidebar-category">';
      html += '<button class="admin-sidebar-category-btn" onclick="toggleCategory(this)">' + cat + ' <span class="chevron">&#9654;</span></button>';
      html += '<div class="admin-sidebar-pages">';
      PAGES[cat].forEach(function (p) {
        html += '<button class="admin-sidebar-page" data-slug="' + p.slug + '" data-type="' + p.type + '" onclick="loadPage(\'' + p.slug + '\', \'' + p.type + '\')">' + p.label + '</button>';
      });
      html += '</div></div>';
    });

    container.innerHTML = html;
  }

  // ─── Sidebar toggle ───────────────────────────────
  window.toggleCategory = function (btn) {
    btn.classList.toggle('open');
    var pages = btn.nextElementSibling;
    pages.classList.toggle('open');
  };

  // ─── Load page ────────────────────────────────────
  window.loadPage = async function (slug, type) {
    if (state.unsaved && !confirm('Modifications non sauvegardées. Continuer ?')) return;

    state.currentSlug = slug;
    state.unsaved = false;

    // Highlight active page in sidebar
    document.querySelectorAll('.admin-sidebar-page').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-slug') === slug);
    });

    var main = document.getElementById('admin-main-content');
    main.innerHTML = '<div style="text-align:center;padding:60px;color:#999;">Chargement...</div>';

    // Fetch page data
    var result = await sb.from('page_content').select('*').eq('page_slug', slug).maybeSingle();
    state.pageData = result.data;

    // Fetch prepas if prepa page
    state.prepasData = [];
    if (type === 'prepa') {
      var prepasResult = await sb.from('prepas').select('*').eq('page_slug', slug).order('sort_order');
      state.prepasData = prepasResult.data || [];
    }

    // Fetch fac stats if faculte page
    state.facStatsData = null;
    if (type === 'faculte') {
      var statsResult = await sb.from('fac_stats').select('*').eq('page_slug', slug).maybeSingle();
      state.facStatsData = statsResult.data;
    }

    renderEditor(slug, type);
  };

  // ─── Render editor ────────────────────────────────
  function renderEditor(slug, type) {
    var d = state.pageData || {};
    var main = document.getElementById('admin-main-content');
    var html = '<div class="admin-editor">';

    // Header
    html += '<h2>' + getPageLabel(slug) + ' <span class="page-type-badge">' + type + '</span></h2>';
    html += '<p class="page-slug">/' + slug + '.html</p>';

    // Meta section
    html += '<div class="admin-section">';
    html += '<h3><span class="icon">&#9881;</span> Informations générales</h3>';
    html += field('title', 'Titre (H1)', d.title || '', 'text');
    html += field('meta_description', 'Meta description (SEO)', d.meta_description || '', 'textarea');
    html += field('subtitle', 'Sous-titre', d.subtitle || '', 'text');
    html += '</div>';

    // Sections content
    var sections = d.sections || [];
    html += '<div class="admin-section">';
    html += '<h3><span class="icon">&#9998;</span> Sections de contenu</h3>';
    html += '<div id="sections-list">';
    sections.forEach(function (sec, i) {
      html += renderSectionBlock(i, sec);
    });
    html += '</div>';
    html += '<button class="btn-add" onclick="addSection()">+ Ajouter une section</button>';
    html += '</div>';

    // Prepa-specific: prepa cards
    if (type === 'prepa') {
      html += '<div class="admin-section">';
      html += '<h3><span class="icon">&#127891;</span> Prépas</h3>';
      html += '<div id="prepas-list">';
      state.prepasData.forEach(function (p, i) {
        html += renderPrepaCard(i, p);
      });
      html += '</div>';
      html += '<button class="btn-add" onclick="addPrepa()">+ Ajouter une prépa</button>';
      html += '</div>';
    }

    // Faculte-specific: stats
    if (type === 'faculte') {
      var s = state.facStatsData || {};
      html += '<div class="admin-section">';
      html += '<h3><span class="icon">&#128202;</span> Statistiques</h3>';
      html += '<div class="admin-field-row">';
      html += field('stat_etudiants', 'Étudiants PASS', s.etudiants_pass || '', 'number');
      html += field('stat_places', 'Places 2e année', s.places_2e_annee || '', 'number');
      html += '</div>';
      html += '<div class="admin-field-row">';
      html += field('stat_taux', 'Taux réussite (%)', s.taux_reussite_pass || '', 'number');
      html += field('stat_voeux', 'Voeux Parcoursup', s.voeux_parcoursup || '', 'number');
      html += '</div>';
      html += '<h4 style="margin-top:20px;font-size:14px;">Places par filière</h4>';
      html += '<div class="admin-field-row-3">';
      html += '<div></div><div style="text-align:center;font-weight:600;font-size:12px;">PASS</div><div style="text-align:center;font-weight:600;font-size:12px;">LAS</div>';
      html += '</div>';
      var filieres = ['medecine', 'pharmacie', 'odonto', 'maieutique', 'kine'];
      var filLabels = { medecine: 'Médecine', pharmacie: 'Pharmacie', odonto: 'Odontologie', maieutique: 'Maïeutique', kine: 'Kinésithérapie' };
      filieres.forEach(function (f) {
        html += '<div class="admin-field-row-3">';
        html += '<label style="padding-top:10px;font-size:13px;">' + filLabels[f] + '</label>';
        html += field('stat_' + f + '_pass', '', s['places_' + f + '_pass'] || '', 'number');
        html += field('stat_' + f + '_las', '', s['places_' + f + '_las'] || '', 'number');
        html += '</div>';
      });
      html += '</div>';
    }

    // FAQ section
    var faq = d.faq || [];
    html += '<div class="admin-section">';
    html += '<h3><span class="icon">&#10067;</span> FAQ</h3>';
    html += '<div id="faq-list">';
    faq.forEach(function (item, i) {
      html += renderFaqBlock(i, item);
    });
    html += '</div>';
    html += '<button class="btn-add" onclick="addFaq()">+ Ajouter une question</button>';
    html += '</div>';

    // Coup de coeur (prepa only)
    if (type === 'prepa') {
      var cdc = d.coup_de_coeur || {};
      html += '<div class="admin-section">';
      html += '<h3><span class="icon">&#10084;</span> Coup de coeur</h3>';
      html += field('cdc_title', 'Titre', cdc.title || '', 'text');
      html += field('cdc_description', 'Description', cdc.description || '', 'textarea');
      html += field('cdc_link', 'Lien', cdc.link || '', 'text');
      html += '</div>';
    }

    // Save button
    html += '<button class="btn-save" onclick="savePage()" id="btn-save">Sauvegarder</button>';
    html += '</div>';

    main.innerHTML = html;
  }

  // ─── Field helper ─────────────────────────────────
  function field(name, label, value, type) {
    var html = '<div class="admin-field">';
    if (label) html += '<label>' + label + '</label>';
    if (type === 'textarea') {
      html += '<textarea name="' + name + '" oninput="markUnsaved()">' + escapeHtml(value) + '</textarea>';
    } else {
      html += '<input type="' + (type || 'text') + '" name="' + name + '" value="' + escapeAttr(value) + '" oninput="markUnsaved()">';
    }
    html += '</div>';
    return html;
  }

  // ─── Section block ────────────────────────────────
  function renderSectionBlock(idx, sec) {
    return '<div class="admin-content-section" data-idx="' + idx + '">' +
      '<button class="btn-rm-section" onclick="removeSection(' + idx + ')">&#10005;</button>' +
      field('section_heading_' + idx, 'Titre de section', sec.heading || '', 'text') +
      field('section_html_' + idx, 'Contenu (HTML)', sec.html || '', 'textarea') +
      '</div>';
  }

  // ─── Prepa card ───────────────────────────────────
  function renderPrepaCard(idx, p) {
    var featured = p.is_featured ? ' featured' : '';
    var html = '<div class="admin-prepa-card' + featured + '" data-idx="' + idx + '">';
    html += '<div class="admin-prepa-header">';
    html += '<strong>Prépa #' + (idx + 1) + (p.name ? ' — ' + p.name : '') + '</strong>';
    html += '<div class="admin-prepa-actions">';
    html += '<button class="btn-featured' + (p.is_featured ? ' active' : '') + '" onclick="toggleFeatured(' + idx + ')">&#9733; Coup de coeur</button>';
    html += '<button class="btn-remove" onclick="removePrepa(' + idx + ')">Supprimer</button>';
    html += '</div></div>';
    html += '<div class="admin-field-row">';
    html += field('prepa_name_' + idx, 'Nom', p.name || '', 'text');
    html += field('prepa_type_' + idx, 'Type', p.type || 'Présentiel', 'text');
    html += '</div>';
    html += '<div class="admin-field-row">';
    html += field('prepa_price_' + idx, 'Tarif', p.price || '', 'text');
    html += field('prepa_notes_' + idx, 'Notes', p.notes || '', 'text');
    html += '</div>';
    html += field('prepa_desc_' + idx, 'Description', p.description || '', 'textarea');

    // Points
    html += '<div class="admin-field"><label>Points forts</label>';
    html += '<ul class="admin-points-list" id="prepa-points-' + idx + '">';
    (p.points || []).forEach(function (pt, pi) {
      html += '<li class="admin-point-item">';
      html += '<input type="text" name="prepa_point_' + idx + '_' + pi + '" value="' + escapeAttr(pt) + '" oninput="markUnsaved()">';
      html += '<button class="btn-rm-point" onclick="removePoint(' + idx + ',' + pi + ')">&#10005;</button>';
      html += '</li>';
    });
    html += '</ul>';
    html += '<button class="btn-add" onclick="addPoint(' + idx + ')" style="margin-top:4px;">+ Point</button>';
    html += '</div>';

    html += '</div>';
    return html;
  }

  // ─── FAQ block ────────────────────────────────────
  function renderFaqBlock(idx, item) {
    return '<div class="admin-faq-item" data-idx="' + idx + '">' +
      '<button class="admin-faq-remove" onclick="removeFaq(' + idx + ')">&#10005;</button>' +
      field('faq_q_' + idx, 'Question', item.question || '', 'text') +
      field('faq_a_' + idx, 'Réponse', item.answer || '', 'textarea') +
      '</div>';
  }

  // ─── Dynamic add/remove ───────────────────────────
  window.addSection = function () {
    var list = document.getElementById('sections-list');
    var idx = list.children.length;
    list.insertAdjacentHTML('beforeend', renderSectionBlock(idx, {}));
    markUnsaved();
  };

  window.removeSection = function (idx) {
    var items = document.querySelectorAll('#sections-list .admin-content-section');
    if (items[idx]) items[idx].remove();
    markUnsaved();
  };

  window.addFaq = function () {
    var list = document.getElementById('faq-list');
    var idx = list.children.length;
    list.insertAdjacentHTML('beforeend', renderFaqBlock(idx, {}));
    markUnsaved();
  };

  window.removeFaq = function (idx) {
    var items = document.querySelectorAll('#faq-list .admin-faq-item');
    if (items[idx]) items[idx].remove();
    markUnsaved();
  };

  window.addPrepa = function () {
    state.prepasData.push({ name: '', type: 'Présentiel', description: '', price: '', notes: '', points: [], is_featured: false, sort_order: state.prepasData.length });
    var list = document.getElementById('prepas-list');
    var idx = list.children.length;
    list.insertAdjacentHTML('beforeend', renderPrepaCard(idx, state.prepasData[state.prepasData.length - 1]));
    markUnsaved();
  };

  window.removePrepa = function (idx) {
    var items = document.querySelectorAll('#prepas-list .admin-prepa-card');
    if (items[idx]) items[idx].remove();
    markUnsaved();
  };

  window.toggleFeatured = function (idx) {
    var card = document.querySelectorAll('#prepas-list .admin-prepa-card')[idx];
    if (!card) return;
    card.classList.toggle('featured');
    var btn = card.querySelector('.btn-featured');
    btn.classList.toggle('active');
    markUnsaved();
  };

  window.addPoint = function (prepaIdx) {
    var list = document.getElementById('prepa-points-' + prepaIdx);
    var pi = list.children.length;
    list.insertAdjacentHTML('beforeend',
      '<li class="admin-point-item">' +
      '<input type="text" name="prepa_point_' + prepaIdx + '_' + pi + '" value="" oninput="markUnsaved()">' +
      '<button class="btn-rm-point" onclick="removePoint(' + prepaIdx + ',' + pi + ')">&#10005;</button>' +
      '</li>');
    markUnsaved();
  };

  window.removePoint = function (prepaIdx, pointIdx) {
    var list = document.getElementById('prepa-points-' + prepaIdx);
    if (list && list.children[pointIdx]) list.children[pointIdx].remove();
    markUnsaved();
  };

  window.markUnsaved = function () {
    state.unsaved = true;
  };

  // ─── Collect form data ────────────────────────────
  function getVal(name) {
    var el = document.querySelector('[name="' + name + '"]');
    return el ? el.value.trim() : '';
  }

  function collectPageData() {
    var data = {
      page_slug: state.currentSlug,
      page_type: getPageType(state.currentSlug),
      title: getVal('title') || null,
      meta_description: getVal('meta_description') || null,
      subtitle: getVal('subtitle') || null,
      sections: [],
      faq: [],
      coup_de_coeur: {}
    };

    // Collect sections
    document.querySelectorAll('#sections-list .admin-content-section').forEach(function (el, i) {
      var heading = el.querySelector('[name^="section_heading_"]');
      var html = el.querySelector('[name^="section_html_"]');
      if (heading || html) {
        data.sections.push({
          heading: heading ? heading.value.trim() : '',
          html: html ? html.value.trim() : ''
        });
      }
    });

    // Collect FAQ
    document.querySelectorAll('#faq-list .admin-faq-item').forEach(function (el) {
      var q = el.querySelector('[name^="faq_q_"]');
      var a = el.querySelector('[name^="faq_a_"]');
      if (q && a && (q.value.trim() || a.value.trim())) {
        data.faq.push({ question: q.value.trim(), answer: a.value.trim() });
      }
    });

    // Collect coup de coeur
    if (getPageType(state.currentSlug) === 'prepa') {
      data.coup_de_coeur = {
        title: getVal('cdc_title') || null,
        description: getVal('cdc_description') || null,
        link: getVal('cdc_link') || null
      };
    }

    return data;
  }

  function collectPrepas() {
    var prepas = [];
    document.querySelectorAll('#prepas-list .admin-prepa-card').forEach(function (card, i) {
      var points = [];
      card.querySelectorAll('.admin-points-list input').forEach(function (inp) {
        if (inp.value.trim()) points.push(inp.value.trim());
      });

      prepas.push({
        page_slug: state.currentSlug,
        name: card.querySelector('[name^="prepa_name_"]').value.trim(),
        type: card.querySelector('[name^="prepa_type_"]').value.trim() || 'Présentiel',
        price: card.querySelector('[name^="prepa_price_"]').value.trim(),
        notes: card.querySelector('[name^="prepa_notes_"]').value.trim(),
        description: card.querySelector('[name^="prepa_desc_"]').value.trim(),
        points: points,
        is_featured: card.classList.contains('featured'),
        sort_order: i
      });
    });
    return prepas;
  }

  function collectFacStats() {
    var filieres = ['medecine', 'pharmacie', 'odonto', 'maieutique', 'kine'];
    var data = {
      page_slug: state.currentSlug,
      etudiants_pass: parseInt(getVal('stat_etudiants')) || null,
      places_2e_annee: parseInt(getVal('stat_places')) || null,
      taux_reussite_pass: parseFloat(getVal('stat_taux')) || null,
      voeux_parcoursup: parseInt(getVal('stat_voeux')) || null
    };
    filieres.forEach(function (f) {
      data['places_' + f + '_pass'] = parseInt(getVal('stat_' + f + '_pass')) || null;
      data['places_' + f + '_las'] = parseInt(getVal('stat_' + f + '_las')) || null;
    });
    return data;
  }

  // ─── Save ─────────────────────────────────────────
  window.savePage = async function () {
    var btn = document.getElementById('btn-save');
    btn.disabled = true;
    btn.textContent = 'Sauvegarde...';

    try {
      var pageData = collectPageData();

      // Upsert page_content
      var result = await sb.from('page_content').upsert(pageData, { onConflict: 'page_slug' });
      if (result.error) throw result.error;

      // Save prepas if prepa page
      if (getPageType(state.currentSlug) === 'prepa') {
        // Delete existing prepas for this page
        await sb.from('prepas').delete().eq('page_slug', state.currentSlug);
        // Insert new ones
        var prepas = collectPrepas();
        if (prepas.length > 0) {
          var pResult = await sb.from('prepas').insert(prepas);
          if (pResult.error) throw pResult.error;
        }
      }

      // Save fac stats if faculte page
      if (getPageType(state.currentSlug) === 'faculte') {
        var statsData = collectFacStats();
        var sResult = await sb.from('fac_stats').upsert(statsData, { onConflict: 'page_slug' });
        if (sResult.error) throw sResult.error;
      }

      state.unsaved = false;
      showToast('Modifications enregistrées');
    } catch (err) {
      console.error(err);
      showToast('Erreur: ' + (err.message || 'Sauvegarde échouée'), true);
    }

    btn.disabled = false;
    btn.textContent = 'Sauvegarder';
  };

  // ─── Logout ───────────────────────────────────────
  window.adminLogout = async function () {
    await sb.auth.signOut();
    location.reload();
  };

  // ─── Helpers ──────────────────────────────────────
  function getPageLabel(slug) {
    var found = '';
    Object.keys(PAGES).forEach(function (cat) {
      PAGES[cat].forEach(function (p) {
        if (p.slug === slug) found = p.label;
      });
    });
    return found || slug;
  }

  function getPageType(slug) {
    var found = 'root';
    Object.keys(PAGES).forEach(function (cat) {
      PAGES[cat].forEach(function (p) {
        if (p.slug === slug) found = p.type;
      });
    });
    return found;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function escapeAttr(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function showToast(msg, isError) {
    var toast = document.getElementById('admin-toast');
    toast.textContent = msg;
    toast.className = 'admin-toast' + (isError ? ' error' : '');
    setTimeout(function () { toast.classList.add('show'); }, 10);
    setTimeout(function () { toast.classList.remove('show'); }, 3000);
  }

  // ─── Start ────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
