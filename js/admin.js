/* ═══════════════════════════════════════════════════
   AFEM Admin Panel — WordPress-inspired CMS
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://jhopwqpbaiyjfoggvcaf.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3B3cXBiYWl5amZvZ2d2Y2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI2OTEsImV4cCI6MjA4ODYyODY5MX0.rz3TJZryPxEf3P5kQgpzQkwN9aF8_F4eo4F03CEYVPs';

  var sb;
  var state = { view: 'dashboard', currentSlug: null, pageData: null, prepasData: [], facStatsData: null, unsaved: false };

  /* ─── Page Registry ─── */
  var CATEGORIES = [
    { id: 'dashboard', label: 'Tableau de bord', icon: '&#9776;' },
    { id: 'prepas', label: 'Prépas médecine', icon: '&#127891;', type: 'prepa', pages: [
      { slug: 'prepas-medecine/paris', label: 'Paris' },
      { slug: 'prepas-medecine/lyon', label: 'Lyon' },
      { slug: 'prepas-medecine/marseille', label: 'Marseille' },
      { slug: 'prepas-medecine/lille', label: 'Lille' },
      { slug: 'prepas-medecine/bordeaux', label: 'Bordeaux' },
      { slug: 'prepas-medecine/toulouse', label: 'Toulouse' },
      { slug: 'prepas-medecine/grenoble', label: 'Grenoble' },
      { slug: 'prepas-medecine/nancy', label: 'Nancy' },
      { slug: 'prepas-medecine/nice', label: 'Nice' },
      { slug: 'prepas-medecine/strasbourg', label: 'Strasbourg' },
      { slug: 'prepas-medecine/montpellier', label: 'Montpellier' },
      { slug: 'prepas-medecine/nantes', label: 'Nantes' },
      { slug: 'prepas-medecine/rennes', label: 'Rennes' },
      { slug: 'prepas-medecine/poitiers', label: 'Poitiers' },
      { slug: 'prepas-medecine/rouen', label: 'Rouen' },
      { slug: 'prepas-medecine/reims', label: 'Reims' },
      { slug: 'prepas-medecine/angers', label: 'Angers' },
      { slug: 'prepas-medecine/dijon', label: 'Dijon' },
      { slug: 'prepas-medecine/besancon', label: 'Besançon' },
      { slug: 'prepas-medecine/clermont-ferrand', label: 'Clermont-Ferrand' },
      { slug: 'prepas-medecine/amiens', label: 'Amiens' }
    ]},
    { id: 'facultes', label: 'Facultés', icon: '&#127979;', type: 'faculte', pages: [
      { slug: 'facultes/paris-cite', label: 'Paris Cité' },
      { slug: 'facultes/sorbonne-universite', label: 'Sorbonne Université' },
      { slug: 'facultes/paris-saclay', label: 'Paris-Saclay' },
      { slug: 'facultes/versailles-uvsq', label: 'UVSQ (Versailles)' },
      { slug: 'facultes/sorbonne-nord', label: 'Sorbonne Paris Nord' },
      { slug: 'facultes/lyon', label: 'Lyon' },
      { slug: 'facultes/aix-marseille', label: 'Aix-Marseille' },
      { slug: 'facultes/bordeaux', label: 'Bordeaux' },
      { slug: 'facultes/toulouse', label: 'Toulouse' },
      { slug: 'facultes/montpellier', label: 'Montpellier' },
      { slug: 'facultes/lille', label: 'Lille' },
      { slug: 'facultes/nantes', label: 'Nantes' },
      { slug: 'facultes/rennes', label: 'Rennes' },
      { slug: 'facultes/grenoble-alpes', label: 'Grenoble Alpes' },
      { slug: 'facultes/nancy', label: 'Nancy' },
      { slug: 'facultes/rouen', label: 'Rouen' },
      { slug: 'facultes/tours', label: 'Tours' },
      { slug: 'facultes/angers', label: 'Angers' },
      { slug: 'facultes/besancon', label: 'Besançon' },
      { slug: 'facultes/clermont-ferrand', label: 'Clermont-Ferrand' },
      { slug: 'facultes/dijon', label: 'Dijon' },
      { slug: 'facultes/limoges', label: 'Limoges' },
      { slug: 'facultes/orleans', label: 'Orléans' },
      { slug: 'facultes/saint-etienne', label: 'Saint-Étienne' },
      { slug: 'facultes/brest', label: 'Brest' },
      { slug: 'facultes/amiens', label: 'Amiens' },
      { slug: 'facultes/reunion', label: 'Réunion' },
      { slug: 'facultes/antilles', label: 'Antilles' },
      { slug: 'facultes/guyane', label: 'Guyane' },
      { slug: 'facultes/corse', label: 'Corse' }
    ]},
    { id: 'articles', label: 'Articles', icon: '&#128196;', type: 'article', pages: [
      { slug: 'articles/5-conseils-rentree-pass', label: '5 conseils rentrée PASS' },
      { slug: 'articles/anki-pass-guide', label: 'Guide Anki PASS' },
      { slug: 'articles/choisir-mineure-pass', label: 'Choisir sa mineure' },
      { slug: 'articles/choisir-sa-fac-de-medecine', label: 'Choisir sa fac' },
      { slug: 'articles/debouches-etudes-sante', label: 'Débouchés santé' },
      { slug: 'articles/faut-il-prepa-medecine', label: 'Faut-il une prépa ?' },
      { slug: 'articles/gerer-vie-sociale-pass', label: 'Vie sociale PASS' },
      { slug: 'articles/lettre-motivation-parcoursup', label: 'Lettre motivation' },
      { slug: 'articles/matieres-programme-pass-las', label: 'Matières PASS/LAS' },
      { slug: 'articles/methode-des-j-memorisation-pass', label: 'Méthode des J' },
      { slug: 'articles/parcoursup-dates-cles-2026', label: 'Dates Parcoursup 2026' },
      { slug: 'articles/pass-ou-las-comment-choisir', label: 'PASS ou LAS' },
      { slug: 'articles/qcm-pass-las-guide-complet', label: 'Guide QCM' },
      { slug: 'articles/quelle-moyenne-pour-medecine', label: 'Quelle moyenne ?' },
      { slug: 'articles/rattraper-retard-pass', label: 'Rattraper son retard' },
      { slug: 'articles/reussir-pass-conseils', label: 'Réussir PASS' },
      { slug: 'articles/specialites-lycee-medecine', label: 'Spécialités lycée' }
    ]},
    { id: 'pages', label: 'Pages', icon: '&#128195;', type: 'root', pages: [
      { slug: 'index', label: 'Accueil' },
      { slug: 'coaching', label: 'Coaching' },
      { slug: 'simulateur', label: 'Simulateur Parcoursup' },
      { slug: 'quizz', label: 'Quizz Orientation' },
      { slug: 'qcm-medecine', label: 'QCM Médecine' },
      { slug: 'calculateur-reussite', label: 'Calculateur de réussite' },
      { slug: 'qui-sommes-nous', label: 'Qui sommes-nous' },
      { slug: 'blog', label: 'Blog' },
      { slug: 'prepas-medecine', label: 'Page listing prépas' },
      { slug: 'facultes', label: 'Page listing facultés' },
      { slug: 'prepa-diploma-sante', label: 'Fiche Diploma Santé' }
    ]}
  ];

  var allPages = [];
  var hardcodedSlugs = {};
  CATEGORIES.forEach(function (cat) {
    if (cat.pages) cat.pages.forEach(function (p) {
      allPages.push({ slug: p.slug, label: p.label, type: cat.type, category: cat.label });
      hardcodedSlugs[p.slug] = true;
    });
  });
  var dynamicPagesLoaded = false;

  /* ─── Slug prefix mapping ─── */
  var TYPE_TO_CAT = { 'prepa': 'prepas', 'faculte': 'facultes', 'article': 'articles', 'root': 'pages' };
  var CAT_TO_PREFIX = { 'prepas': 'prepas-medecine/', 'facultes': 'facultes/', 'articles': 'articles/', 'pages': '' };

  /* ─── Load dynamic pages from Supabase ─── */
  async function loadDynamicPages() {
    if (dynamicPagesLoaded) return;
    dynamicPagesLoaded = true;

    var r = await sb.from('page_content').select('page_slug, page_type, title');
    var rows = r.data || [];

    rows.forEach(function (row) {
      if (hardcodedSlugs[row.page_slug]) return;

      var catId = TYPE_TO_CAT[row.page_type];
      if (!catId) return;
      var cat = CATEGORIES.find(function (c) { return c.id === catId; });
      if (!cat || !cat.pages) return;

      // Avoid duplicates
      if (cat.pages.some(function (p) { return p.slug === row.page_slug; })) return;

      var label = row.title || row.page_slug.split('/').pop().replace(/-/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);

      cat.pages.push({ slug: row.page_slug, label: label, dynamic: true });
      allPages.push({ slug: row.page_slug, label: label, type: row.page_type, category: cat.label, dynamic: true });
    });
  }

  /* ─── Init ─── */
  function init() {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    checkSession();
  }

  async function checkSession() {
    var r = await sb.auth.getSession();
    if (r.data.session) {
      var email = r.data.session.user.email;
      document.getElementById('admin-user-email').textContent = email;
      showDashboard();
    } else {
      showLogin();
    }
  }

  /* ─── Login ─── */
  function showLogin() {
    document.getElementById('admin-login').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('login-form').onsubmit = async function (e) {
      e.preventDefault();
      var email = document.getElementById('login-email').value;
      var pass = document.getElementById('login-password').value;
      var btn = this.querySelector('.btn-login');
      var err = document.getElementById('login-error');
      btn.disabled = true; err.style.display = 'none';

      var result = await sb.auth.signInWithPassword({ email: email, password: pass });
      if (result.error) {
        if (email === 'aaron@diploma-sante.fr') {
          var sr = await sb.auth.signUp({ email: email, password: pass });
          if (!sr.error && sr.data.session) { document.getElementById('admin-user-email').textContent = email; showDashboard(); return; }
        }
        err.textContent = 'Identifiants incorrects'; err.style.display = 'block'; btn.disabled = false; return;
      }
      document.getElementById('admin-user-email').textContent = email;
      showDashboard();
    };
  }

  /* ─── Dashboard ─── */
  async function showDashboard() {
    document.getElementById('admin-login').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'flex';
    await loadDynamicPages();
    renderSidebar();
    navigate('dashboard');
  }

  /* ─── Sidebar ─── */
  var openSidebar = {}; // track which sidebar categories are open

  function renderSidebar() {
    var html = '';
    CATEGORIES.forEach(function (cat) {
      var isEditing = cat.pages && cat.pages.some(function (p) { return p.slug === state.currentSlug; });
      var isActive = state.view === cat.id || isEditing;
      // Auto-open only when editing a page inside the category
      if (isEditing && cat.pages) openSidebar[cat.id] = true;
      var isOpen = !!openSidebar[cat.id];

      if (cat.pages) {
        html += '<button class="admin-nav-item' + (isActive ? ' active' : '') + '" onclick="toggleSidebar(\'' + cat.id + '\')">';
      } else {
        html += '<button class="admin-nav-item' + (isActive ? ' active' : '') + '" onclick="navigate(\'' + cat.id + '\')">';
      }
      html += '<span class="nav-icon">' + cat.icon + '</span>';
      html += cat.label;
      if (cat.pages) {
        html += '<span class="nav-count">' + cat.pages.length + '</span>';
        html += '<span class="nav-chevron' + (isOpen ? ' open' : '') + '">&#9662;</span>';
      }
      html += '</button>';

      if (cat.pages) {
        html += '<div class="admin-subnav' + (isOpen ? ' open' : '') + '" id="subnav-' + cat.id + '">';
        cat.pages.forEach(function (p) {
          html += '<button class="admin-subnav-item' + (state.currentSlug === p.slug ? ' active' : '') + '" onclick="editPage(\'' + p.slug + '\',\'' + cat.type + '\')">' + p.label + '</button>';
        });
        html += '</div>';
      }
    });
    document.getElementById('admin-sidebar').innerHTML = html;
  }

  window.toggleSidebar = function (catId) {
    if (state.unsaved && !confirm('Modifications non sauvegardées. Continuer ?')) return;
    state.unsaved = false;

    if (openSidebar[catId] && state.view === catId) {
      // Already open AND viewing this category: just close the subnav
      openSidebar[catId] = false;
      renderSidebar();
      return;
    }
    // Open it and navigate to the list
    openSidebar[catId] = true;
    state.view = catId;
    state.currentSlug = null;
    var cat = CATEGORIES.find(function (c) { return c.id === catId; });
    if (cat && cat.pages) renderPageList(cat);
    renderSidebar();
  };

  /* ─── Navigation ─── */
  window.navigate = function (viewId) {
    if (state.unsaved && !confirm('Modifications non sauvegardées. Continuer ?')) return;
    state.unsaved = false;
    state.view = viewId;
    state.currentSlug = null;

    var cat = CATEGORIES.find(function (c) { return c.id === viewId; });
    if (viewId === 'dashboard') {
      renderDashboardHome();
    } else if (cat && cat.pages) {
      renderPageList(cat);
    }
    renderSidebar();
  };

  window.editPage = function (slug, type) {
    if (state.unsaved && !confirm('Modifications non sauvegardées. Continuer ?')) return;
    state.unsaved = false;
    state.currentSlug = slug;
    state.view = 'editor';
    loadPageData(slug, type);
    renderSidebar();
  };

  window.adminLogout = async function () {
    await sb.auth.signOut();
    location.reload();
  };

  /* ─── Dashboard Home ─── */
  async function renderDashboardHome() {
    var main = document.getElementById('admin-main');
    var totalPages = allPages.length;
    var prepasCount = CATEGORIES.find(function (c) { return c.id === 'prepas'; }).pages.length;
    var facCount = CATEGORIES.find(function (c) { return c.id === 'facultes'; }).pages.length;
    var artCount = CATEGORIES.find(function (c) { return c.id === 'articles'; }).pages.length;

    // Fetch configured pages count
    var r = await sb.from('page_content').select('page_slug, updated_at', { count: 'exact' });
    var configured = r.data || [];
    var configuredSlugs = {};
    configured.forEach(function (p) { configuredSlugs[p.page_slug] = p.updated_at; });

    var html = '<div class="admin-dashboard-home">';

    // Welcome
    html += '<div class="admin-welcome">';
    html += '<h2>Bienvenue sur le backoffice AFEM</h2>';
    html += '<p>Gérez le contenu de votre site depuis cette interface. Sélectionnez une catégorie dans le menu de gauche pour commencer.</p>';
    html += '</div>';

    // Stats
    html += '<div class="admin-stats-grid">';
    html += statCard(prepasCount, 'Prépas médecine', 'prepas');
    html += statCard(facCount, 'Facultés', 'facultes');
    html += statCard(artCount, 'Articles', 'articles');
    html += statCard(configured.length, 'Pages configurées', null);
    html += '</div>';

    // Recently modified
    var recent = configured.sort(function (a, b) { return new Date(b.updated_at) - new Date(a.updated_at); }).slice(0, 8);
    if (recent.length) {
      html += '<div class="admin-recent">';
      html += '<div class="admin-recent-header">Pages récemment modifiées</div>';
      recent.forEach(function (r) {
        var page = allPages.find(function (p) { return p.slug === r.page_slug; });
        if (!page) return;
        html += '<div class="admin-recent-item" onclick="editPage(\'' + page.slug + '\',\'' + page.type + '\')">';
        html += '<span class="ri-icon">&#128196;</span>';
        html += '<span class="ri-title">' + esc(page.label) + '</span>';
        html += '<span class="ri-type">' + page.category + '</span>';
        html += '<span class="ri-date">' + formatDate(r.updated_at) + '</span>';
        html += '</div>';
      });
      html += '</div>';
    }

    html += '</div>';
    main.innerHTML = html;
  }

  function statCard(num, label, navId) {
    var onclick = navId ? ' onclick="navigate(\'' + navId + '\')"' : '';
    return '<div class="admin-stat-card"' + onclick + '><div class="stat-number">' + num + '</div><div class="stat-label">' + label + '</div></div>';
  }

  /* ─── Page List ─── */
  async function renderPageList(cat) {
    var main = document.getElementById('admin-main');

    // Fetch which pages have content
    var slugs = cat.pages.map(function (p) { return p.slug; });
    var r = await sb.from('page_content').select('page_slug, updated_at').in('page_slug', slugs);
    var configured = {};
    (r.data || []).forEach(function (p) { configured[p.page_slug] = p.updated_at; });

    var html = '<div class="admin-page-list">';
    html += '<div class="admin-page-list-header">';
    html += '<h2>' + cat.label + '</h2>';
    html += '<div class="admin-page-list-actions">';
    html += '<button class="btn-primary" onclick="showAddModal(\'' + cat.id + '\',\'' + cat.type + '\')">+ Ajouter</button>';
    html += '<span class="list-count">' + cat.pages.length + ' pages</span>';
    html += '</div></div>';

    html += '<table class="admin-table">';
    html += '<thead><tr><th>Page</th><th>Statut</th><th>Dernière modification</th><th>Actions</th></tr></thead>';
    html += '<tbody>';
    cat.pages.forEach(function (p) {
      var hasData = configured[p.slug];
      var viewUrl = p.dynamic ? '/' + p.slug : '/' + p.slug + '.html';
      html += '<tr>';
      html += '<td class="page-title-cell" onclick="editPage(\'' + p.slug + '\',\'' + cat.type + '\')">' + esc(p.label) + '</td>';
      html += '<td><span class="status-dot ' + (hasData ? 'configured' : 'empty') + '"></span>' + (hasData ? 'Configuré' : 'Non configuré') + '</td>';
      html += '<td>' + (hasData ? formatDate(configured[p.slug]) : '—') + '</td>';
      html += '<td class="row-actions"><a href="javascript:void(0)" onclick="editPage(\'' + p.slug + '\',\'' + cat.type + '\')">Modifier</a>';
      html += '<a href="' + viewUrl + '" target="_blank">Voir</a>';
      if (p.dynamic) html += '<a href="javascript:void(0)" class="action-delete" onclick="deletePage(\'' + p.slug + '\',\'' + cat.id + '\')">Supprimer</a>';
      html += '</td></tr>';
    });
    html += '</tbody></table></div>';

    main.innerHTML = html;
  }

  /* ─── Load page data ─── */
  async function loadPageData(slug, type) {
    var main = document.getElementById('admin-main');
    main.innerHTML = '<div style="padding:60px;text-align:center;color:#787c82;">Chargement...</div>';

    var r = await sb.from('page_content').select('*').eq('page_slug', slug).maybeSingle();
    state.pageData = r.data;
    state.prepasData = [];
    state.facStatsData = null;

    if (type === 'prepa') {
      var pr = await sb.from('prepas').select('*').eq('page_slug', slug).order('sort_order');
      state.prepasData = pr.data || [];
    }
    if (type === 'faculte') {
      var sr = await sb.from('fac_stats').select('*').eq('page_slug', slug).maybeSingle();
      state.facStatsData = sr.data;
    }

    renderEditor(slug, type);
  }

  /* ─── Render Editor ─── */
  function renderEditor(slug, type) {
    var d = state.pageData || {};
    var page = allPages.find(function (p) { return p.slug === slug; }) || { label: slug };
    var cat = CATEGORIES.find(function (c) { return c.pages && c.pages.some(function (p) { return p.slug === slug; }); });
    var main = document.getElementById('admin-main');

    var html = '<div class="admin-editor">';

    // Breadcrumb
    html += '<div class="admin-editor-breadcrumb">';
    html += '<a href="javascript:void(0)" onclick="navigate(\'dashboard\')">Tableau de bord</a> &rsaquo; ';
    if (cat) html += '<a href="javascript:void(0)" onclick="navigate(\'' + cat.id + '\')">' + cat.label + '</a> &rsaquo; ';
    html += esc(page.label);
    html += '</div>';

    // Header
    html += '<div class="admin-editor-header">';
    html += '<h2>Modifier : ' + esc(page.label) + '</h2>';
    if (cat) html += '<button class="btn-back" onclick="navigate(\'' + cat.id + '\')">&#8592; Retour</button>';
    var isDynamic = page.dynamic || false;
    var viewUrl = isDynamic ? '/' + slug : '/' + slug + '.html';
    html += '<a class="btn-preview" href="' + viewUrl + '" target="_blank">Voir la page &#8599;</a>';
    html += '</div>';

    // Layout: content + sidebar
    html += '<div class="admin-editor-layout">';

    // === LEFT COLUMN (content) ===
    html += '<div class="admin-editor-content">';

    // Title box
    html += metaBoxOpen('Informations générales', false);
    html += field('title', 'Titre (H1)', d.title || '', 'text');
    html += field('meta_description', 'Description SEO', d.meta_description || '', 'textarea', 'Apparaît dans les résultats Google. 150-160 caractères recommandés.');
    html += field('subtitle', 'Sous-titre', d.subtitle || '', 'text');
    html += metaBoxClose();

    // Sections
    var sections = d.sections || [];
    html += metaBoxOpen('Contenu des sections', false);
    html += '<div id="sections-list">';
    sections.forEach(function (sec, i) { html += renderSectionBlock(i, sec); });
    html += '</div>';
    html += '<button class="btn-add" onclick="addSection()">+ Ajouter une section</button>';
    html += metaBoxClose();

    // Prepas (prepa pages only)
    if (type === 'prepa') {
      html += metaBoxOpen('Prépas (' + state.prepasData.length + ')', false);
      html += '<div id="prepas-list">';
      state.prepasData.forEach(function (p, i) { html += renderPrepaCard(i, p); });
      html += '</div>';
      html += '<button class="btn-add" onclick="addPrepa()">+ Ajouter une prépa</button>';
      html += metaBoxClose();
    }

    // Fac stats (faculte pages only)
    if (type === 'faculte') {
      var s = state.facStatsData || {};
      html += metaBoxOpen('Statistiques de la faculté', false);
      html += '<div class="admin-field-row-4">';
      html += field('stat_etudiants', 'Étudiants PASS', s.etudiants_pass || '', 'number');
      html += field('stat_places', 'Places 2e année', s.places_2e_annee || '', 'number');
      html += field('stat_taux', 'Taux réussite (%)', s.taux_reussite_pass || '', 'number');
      html += field('stat_voeux', 'Voeux Parcoursup', s.voeux_parcoursup || '', 'number');
      html += '</div>';
      html += '<p style="margin:12px 0 8px;font-weight:600;font-size:12px;">Places par filière (PASS / LAS)</p>';
      var filieres = [['medecine','Médecine'],['pharmacie','Pharmacie'],['odonto','Odontologie'],['maieutique','Maïeutique'],['kine','Kinésithérapie']];
      filieres.forEach(function (f) {
        html += '<div class="admin-field-row" style="margin-bottom:6px;">';
        html += '<div class="admin-field"><label>' + f[1] + ' (PASS)</label><input type="number" name="stat_' + f[0] + '_pass" value="' + (s['places_' + f[0] + '_pass'] || '') + '" oninput="markUnsaved()"></div>';
        html += '<div class="admin-field"><label>' + f[1] + ' (LAS)</label><input type="number" name="stat_' + f[0] + '_las" value="' + (s['places_' + f[0] + '_las'] || '') + '" oninput="markUnsaved()"></div>';
        html += '</div>';
      });
      html += metaBoxClose();
    }

    // FAQ
    var faq = d.faq || [];
    html += metaBoxOpen('FAQ (' + faq.length + ' questions)', true);
    html += '<div id="faq-list">';
    faq.forEach(function (item, i) { html += renderFaqBlock(i, item); });
    html += '</div>';
    html += '<button class="btn-add" onclick="addFaq()">+ Ajouter une question</button>';
    html += metaBoxClose();

    html += '</div>'; // end content

    // === RIGHT COLUMN (sidebar) ===
    html += '<div class="admin-editor-sidebar">';

    // Publish box
    html += '<div class="admin-publish-box">';
    html += '<div class="admin-publish-box-header">Publier</div>';
    html += '<div class="admin-publish-box-body">';
    html += '<div class="pub-info">Statut : <strong>' + (state.pageData ? 'Configuré' : 'Brouillon') + '</strong></div>';
    if (d.updated_at) html += '<div class="pub-info">Modifié : <strong>' + formatDate(d.updated_at) + '</strong></div>';
    html += '<div class="pub-info">Type : <strong>' + type + '</strong></div>';
    html += '</div>';
    html += '<div class="admin-publish-box-footer">';
    html += '<button class="btn-primary" onclick="savePage(\'' + type + '\')" id="btn-save">Mettre à jour</button>';
    html += '</div></div>';

    // Coup de coeur (prepa only)
    if (type === 'prepa') {
      var cdc = d.coup_de_coeur || {};
      html += '<div class="admin-meta-box">';
      html += '<div class="admin-meta-box-header">Coup de coeur</div>';
      html += '<div class="admin-meta-box-body">';
      html += field('cdc_title', 'Titre', cdc.title || '', 'text');
      html += field('cdc_description', 'Description', cdc.description || '', 'textarea');
      html += field('cdc_link', 'Lien', cdc.link || '', 'text');
      html += '</div></div>';
    }

    html += '</div>'; // end sidebar
    html += '</div>'; // end layout
    html += '</div>'; // end editor

    main.innerHTML = html;
    main.scrollTop = 0;
  }

  /* ─── Meta Box helpers ─── */
  function metaBoxOpen(title, collapsed) {
    return '<div class="admin-meta-box' + (collapsed ? ' collapsed' : '') + '">' +
      '<div class="admin-meta-box-header' + (collapsed ? ' collapsed' : '') + '" onclick="this.classList.toggle(\'collapsed\');this.parentElement.classList.toggle(\'collapsed\')">' +
      title + '<span class="toggle-icon">&#9660;</span></div>' +
      '<div class="admin-meta-box-body">';
  }
  function metaBoxClose() { return '</div></div>'; }

  /* ─── Field ─── */
  function field(name, label, value, type, hint) {
    var h = '<div class="admin-field">';
    if (label) h += '<label>' + label + '</label>';
    if (type === 'textarea') {
      h += '<textarea name="' + name + '" oninput="markUnsaved()">' + esc(value) + '</textarea>';
    } else {
      h += '<input type="' + (type || 'text') + '" name="' + name + '" value="' + escAttr(value) + '" oninput="markUnsaved()">';
    }
    if (hint) h += '<div class="admin-field-hint">' + hint + '</div>';
    h += '</div>';
    return h;
  }

  /* ─── Section Block ─── */
  function renderSectionBlock(idx, sec) {
    return '<div class="admin-content-section" data-idx="' + idx + '">' +
      '<button class="btn-rm-section" onclick="removeBlock(\'sections-list\',' + idx + ')">&#10005;</button>' +
      field('section_heading_' + idx, 'Titre', sec.heading || '', 'text') +
      field('section_html_' + idx, 'Contenu (HTML)', sec.html || '', 'textarea') +
      '</div>';
  }

  /* ─── Prepa Card ─── */
  function renderPrepaCard(idx, p) {
    var h = '<div class="admin-prepa-card' + (p.is_featured ? ' featured' : '') + '" data-idx="' + idx + '">';
    h += '<div class="admin-prepa-header">';
    h += '<span><span class="prepa-num">' + (idx + 1) + '</span><strong>' + esc(p.name || 'Nouvelle prépa') + '</strong></span>';
    h += '<div class="admin-prepa-actions">';
    h += '<button class="btn-featured' + (p.is_featured ? ' active' : '') + '" onclick="toggleFeatured(' + idx + ')">&#9733; Coup de coeur</button>';
    h += '<button class="btn-remove" onclick="removeBlock(\'prepas-list\',' + idx + ')">Supprimer</button>';
    h += '</div></div>';
    h += '<div class="admin-field-row">';
    h += field('prepa_name_' + idx, 'Nom', p.name || '', 'text');
    h += field('prepa_type_' + idx, 'Type', p.type || 'Présentiel', 'text');
    h += '</div>';
    h += '<div class="admin-field-row">';
    h += field('prepa_price_' + idx, 'Tarif', p.price || '', 'text');
    h += field('prepa_notes_' + idx, 'Notes', p.notes || '', 'text');
    h += '</div>';
    h += field('prepa_desc_' + idx, 'Description', p.description || '', 'textarea');
    h += '<div class="admin-field"><label>Points forts</label>';
    h += '<ul class="admin-points-list" id="prepa-points-' + idx + '">';
    (p.points || []).forEach(function (pt, pi) {
      h += '<li class="admin-point-item"><input type="text" name="prepa_point_' + idx + '_' + pi + '" value="' + escAttr(pt) + '" oninput="markUnsaved()"><button class="btn-rm-point" onclick="this.parentElement.remove();markUnsaved()">&#10005;</button></li>';
    });
    h += '</ul>';
    h += '<button class="btn-add" onclick="addPoint(' + idx + ')">+ Point</button></div>';
    h += '</div>';
    return h;
  }

  /* ─── FAQ Block ─── */
  function renderFaqBlock(idx, item) {
    return '<div class="admin-faq-item" data-idx="' + idx + '">' +
      '<button class="admin-faq-remove" onclick="removeBlock(\'faq-list\',' + idx + ')">&#10005;</button>' +
      field('faq_q_' + idx, 'Question', item.question || '', 'text') +
      field('faq_a_' + idx, 'Réponse', item.answer || '', 'textarea') +
      '</div>';
  }

  /* ─── Dynamic add/remove ─── */
  window.addSection = function () {
    var list = document.getElementById('sections-list');
    list.insertAdjacentHTML('beforeend', renderSectionBlock(list.children.length, {}));
    markUnsaved();
  };
  window.addFaq = function () {
    var list = document.getElementById('faq-list');
    list.insertAdjacentHTML('beforeend', renderFaqBlock(list.children.length, {}));
    markUnsaved();
  };
  window.addPrepa = function () {
    var list = document.getElementById('prepas-list');
    list.insertAdjacentHTML('beforeend', renderPrepaCard(list.children.length, { name: '', type: 'Présentiel', points: [] }));
    markUnsaved();
  };
  window.removeBlock = function (listId, idx) {
    var list = document.getElementById(listId);
    if (list && list.children[idx]) { list.children[idx].remove(); markUnsaved(); }
  };
  window.toggleFeatured = function (idx) {
    var card = document.querySelectorAll('#prepas-list .admin-prepa-card')[idx];
    if (!card) return;
    card.classList.toggle('featured');
    card.querySelector('.btn-featured').classList.toggle('active');
    markUnsaved();
  };
  window.addPoint = function (i) {
    var list = document.getElementById('prepa-points-' + i);
    var pi = list.children.length;
    list.insertAdjacentHTML('beforeend', '<li class="admin-point-item"><input type="text" name="prepa_point_' + i + '_' + pi + '" value="" oninput="markUnsaved()"><button class="btn-rm-point" onclick="this.parentElement.remove();markUnsaved()">&#10005;</button></li>');
    markUnsaved();
  };
  window.markUnsaved = function () { state.unsaved = true; };

  /* ─── Add page modal ─── */
  window.showAddModal = function (catId, type) {
    var catLabels = { 'prepas': 'une prépa', 'facultes': 'une faculté', 'articles': 'un article', 'pages': 'une page' };
    var html = '<div class="admin-modal-overlay" id="add-modal" onclick="if(event.target===this)closeAddModal()">';
    html += '<div class="admin-modal">';
    html += '<h3>Ajouter ' + (catLabels[catId] || 'une page') + '</h3>';
    html += '<div class="admin-field"><label>Titre</label><input type="text" id="new-page-title" placeholder="Ex: Mon nouvel article" autofocus></div>';
    html += '<div class="admin-field"><label>Slug (URL)</label><input type="text" id="new-page-slug" placeholder="Auto-généré depuis le titre"><div class="admin-field-hint">Sera ajouté après /' + (CAT_TO_PREFIX[catId] || '') + '</div></div>';
    html += '<div class="admin-modal-actions">';
    html += '<button class="btn-secondary" onclick="closeAddModal()">Annuler</button>';
    html += '<button class="btn-primary" onclick="createNewPage(\'' + catId + '\',\'' + type + '\')">Créer la page</button>';
    html += '</div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('new-page-title').oninput = function () {
      var slug = this.value.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
      document.getElementById('new-page-slug').value = slug;
    };
    document.getElementById('new-page-title').focus();
  };

  window.closeAddModal = function () {
    var m = document.getElementById('add-modal');
    if (m) m.remove();
  };

  window.createNewPage = async function (catId, type) {
    var title = document.getElementById('new-page-title').value.trim();
    var slug = document.getElementById('new-page-slug').value.trim();
    if (!title || !slug) { showToast('Titre et slug requis', 'error'); return; }

    var prefix = CAT_TO_PREFIX[catId] || '';
    var fullSlug = prefix + slug;

    // Check duplicates
    if (allPages.some(function (p) { return p.slug === fullSlug; })) {
      showToast('Ce slug existe déjà', 'error'); return;
    }

    var btn = document.querySelector('#add-modal .btn-primary');
    btn.disabled = true; btn.textContent = 'Création...';

    try {
      var r = await sb.from('page_content').insert({ page_slug: fullSlug, page_type: type, title: title });
      if (r.error) throw r.error;

      // Add to local state
      var cat = CATEGORIES.find(function (c) { return c.id === catId; });
      cat.pages.push({ slug: fullSlug, label: title, dynamic: true });
      allPages.push({ slug: fullSlug, label: title, type: type, category: cat.label, dynamic: true });

      closeAddModal();
      showToast('Page "' + title + '" créée', 'success');
      editPage(fullSlug, type);
    } catch (err) {
      showToast('Erreur : ' + (err.message || 'Échec'), 'error');
      btn.disabled = false; btn.textContent = 'Créer la page';
    }
  };

  window.deletePage = async function (slug, catId) {
    if (!confirm('Supprimer cette page ? Cette action est irréversible.')) return;

    try {
      var r = await sb.from('page_content').delete().eq('page_slug', slug);
      if (r.error) throw r.error;

      // Remove from local state
      var cat = CATEGORIES.find(function (c) { return c.id === catId; });
      if (cat) cat.pages = cat.pages.filter(function (p) { return p.slug !== slug; });
      allPages = allPages.filter(function (p) { return p.slug !== slug; });

      showToast('Page supprimée', 'success');
      navigate(catId);
    } catch (err) {
      showToast('Erreur : ' + (err.message || 'Échec'), 'error');
    }
  };

  /* ─── Collect & Save ─── */
  function getVal(n) { var el = document.querySelector('[name="' + n + '"]'); return el ? el.value.trim() : ''; }

  window.savePage = async function (type) {
    var btn = document.getElementById('btn-save');
    btn.disabled = true; btn.textContent = 'Sauvegarde...';

    try {
      // page_content
      var data = {
        page_slug: state.currentSlug, page_type: type,
        title: getVal('title') || null,
        meta_description: getVal('meta_description') || null,
        subtitle: getVal('subtitle') || null,
        sections: [], faq: [], coup_de_coeur: {}
      };
      document.querySelectorAll('#sections-list .admin-content-section').forEach(function (el) {
        var h = el.querySelector('[name^="section_heading_"]');
        var c = el.querySelector('[name^="section_html_"]');
        if (h || c) data.sections.push({ heading: h ? h.value.trim() : '', html: c ? c.value.trim() : '' });
      });
      document.querySelectorAll('#faq-list .admin-faq-item').forEach(function (el) {
        var q = el.querySelector('[name^="faq_q_"]');
        var a = el.querySelector('[name^="faq_a_"]');
        if (q && a && (q.value.trim() || a.value.trim())) data.faq.push({ question: q.value.trim(), answer: a.value.trim() });
      });
      if (type === 'prepa') {
        data.coup_de_coeur = { title: getVal('cdc_title') || null, description: getVal('cdc_description') || null, link: getVal('cdc_link') || null };
      }
      var r = await sb.from('page_content').upsert(data, { onConflict: 'page_slug' });
      if (r.error) throw r.error;

      // prepas
      if (type === 'prepa') {
        await sb.from('prepas').delete().eq('page_slug', state.currentSlug);
        var prepas = [];
        document.querySelectorAll('#prepas-list .admin-prepa-card').forEach(function (card, i) {
          var points = [];
          card.querySelectorAll('.admin-points-list input').forEach(function (inp) { if (inp.value.trim()) points.push(inp.value.trim()); });
          prepas.push({
            page_slug: state.currentSlug,
            name: card.querySelector('[name^="prepa_name_"]').value.trim(),
            type: card.querySelector('[name^="prepa_type_"]').value.trim() || 'Présentiel',
            price: card.querySelector('[name^="prepa_price_"]').value.trim(),
            notes: card.querySelector('[name^="prepa_notes_"]').value.trim(),
            description: card.querySelector('[name^="prepa_desc_"]').value.trim(),
            points: points, is_featured: card.classList.contains('featured'), sort_order: i
          });
        });
        if (prepas.length) { var pr = await sb.from('prepas').insert(prepas); if (pr.error) throw pr.error; }
      }

      // fac stats
      if (type === 'faculte') {
        var sd = { page_slug: state.currentSlug, etudiants_pass: parseInt(getVal('stat_etudiants')) || null, places_2e_annee: parseInt(getVal('stat_places')) || null, taux_reussite_pass: parseFloat(getVal('stat_taux')) || null, voeux_parcoursup: parseInt(getVal('stat_voeux')) || null };
        ['medecine','pharmacie','odonto','maieutique','kine'].forEach(function (f) {
          sd['places_' + f + '_pass'] = parseInt(getVal('stat_' + f + '_pass')) || null;
          sd['places_' + f + '_las'] = parseInt(getVal('stat_' + f + '_las')) || null;
        });
        var sr = await sb.from('fac_stats').upsert(sd, { onConflict: 'page_slug' }); if (sr.error) throw sr.error;
      }

      state.unsaved = false;
      showToast('Modifications enregistrées', 'success');
    } catch (err) {
      console.error(err);
      showToast('Erreur : ' + (err.message || 'Échec'), 'error');
    }
    btn.disabled = false; btn.textContent = 'Mettre à jour';
  };

  /* ─── Helpers ─── */
  function esc(s) { var d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
  function escAttr(s) { return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function formatDate(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  function showToast(msg, type) {
    var t = document.getElementById('admin-toast');
    t.textContent = msg; t.className = 'admin-toast' + (type ? ' ' + type : '');
    setTimeout(function () { t.classList.add('show'); }, 10);
    setTimeout(function () { t.classList.remove('show'); }, 3000);
  }

  /* ─── Start ─── */
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
