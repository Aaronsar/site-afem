/* ═══════════════════════════════════════════════════
   AFEM Admin Panel — WordPress-inspired CMS
   ═══════════════════════════════════════════════════ */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://jhopwqpbaiyjfoggvcaf.supabase.co';
  var SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impob3B3cXBiYWl5amZvZ2d2Y2FmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwNTI2OTEsImV4cCI6MjA4ODYyODY5MX0.rz3TJZryPxEf3P5kQgpzQkwN9aF8_F4eo4F03CEYVPs';

  var sb;
  var state = { view: 'dashboard', currentSlug: null, pageData: null, prepasData: [], facStatsData: null, unsaved: false };

  /* ─── SEO / GEO Scoring ─── */
  function countWords(html) {
    if (!html) return 0;
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return (tmp.textContent || '').split(/\s+/).filter(Boolean).length;
  }

  function calculateSEO(d) {
    if (!d) return 0;
    var score = 0;
    var t = d.title || '';
    var md = d.meta_description || '';
    var secs = d.sections || [];
    var faq = d.faq || [];

    // Title (20)
    if (t.length > 0) score += 5;
    if (t.length >= 50 && t.length <= 65) score += 15;
    else if (t.length > 0) score += Math.max(0, 15 - Math.abs(t.length - 57) * 0.5);

    // Meta description (20)
    if (md.length > 0) score += 5;
    if (md.length >= 140 && md.length <= 160) score += 15;
    else if (md.length > 0) score += Math.max(0, 15 - Math.abs(md.length - 150) * 0.3);

    // Subtitle (5)
    if (d.subtitle) score += 5;

    // Sections with content (15)
    var filledSecs = secs.filter(function (s) { return s.html && s.html.length > 30; });
    score += Math.min(15, filledSecs.length * 5);

    // Sections have headings (10)
    var headedSecs = secs.filter(function (s) { return s.heading && s.heading.length > 0; });
    score += Math.min(10, headedSecs.length * (10 / Math.max(secs.length, 1)));

    // Word count > 800 (15)
    var totalWords = 0;
    secs.forEach(function (s) { totalWords += countWords(s.html); });
    score += Math.min(15, Math.round((totalWords / 800) * 15));

    // FAQ (15)
    if (faq.length > 0) score += 10;
    if (faq.length >= 3) score += 5;

    return Math.min(100, Math.round(score));
  }

  function calculateGEO(d) {
    if (!d) return 0;
    var score = 0;
    var secs = d.sections || [];
    var faq = d.faq || [];

    // Structured FAQ (25 — 5 per item, max 5)
    score += Math.min(25, faq.length * 5);

    // Content > 1500 words (20)
    var totalWords = 0;
    var allHtml = '';
    secs.forEach(function (s) { totalWords += countWords(s.html); allHtml += (s.html || ''); });
    score += Math.min(20, Math.round((totalWords / 1500) * 20));

    // Headings in sections (15)
    var headedSecs = secs.filter(function (s) { return s.heading && s.heading.length > 0; });
    score += Math.min(15, headedSecs.length * 3);

    // Lists in content (15)
    var hasList = /<(ul|ol)\b/i.test(allHtml);
    if (hasList) score += 15;

    // >= 5 sections (10)
    score += Math.min(10, secs.length * 2);

    // Detailed FAQ answers > 50 chars (15)
    var detailedFaq = faq.filter(function (f) { return (f.answer || '').length > 50; });
    score += Math.min(15, detailedFaq.length * 3);

    return Math.min(100, Math.round(score));
  }

  function scoreBadge(val) {
    var cls = val < 50 ? 'score-low' : val <= 75 ? 'score-mid' : 'score-good';
    return '<span class="score-badge ' + cls + '">' + val + '</span>';
  }

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
      { slug: 'facultes/creteil', label: 'Créteil (UPEC)' },
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
    var isArticle = cat.type === 'article';

    // Fetch page content — full data for articles (scoring + publish status), minimal for others
    var slugs = cat.pages.map(function (p) { return p.slug; });
    var selectCols = isArticle ? 'page_slug, updated_at, title, meta_description, subtitle, sections, faq, published, published_at, category, excerpt, scheduled_at' : 'page_slug, updated_at';
    var r = await sb.from('page_content').select(selectCols).in('page_slug', slugs);
    var configured = {};
    var contentMap = {};
    (r.data || []).forEach(function (p) {
      configured[p.page_slug] = p.updated_at;
      if (isArticle) contentMap[p.page_slug] = p;
    });

    var html = '<div class="admin-page-list">';
    html += '<div class="admin-page-list-header">';
    html += '<h2>' + cat.label + '</h2>';
    html += '<div class="admin-page-list-actions">';
    html += '<button class="btn-primary" onclick="showAddModal(\'' + cat.id + '\',\'' + cat.type + '\')">+ Ajouter</button>';
    html += '<span class="list-count">' + cat.pages.length + ' pages</span>';
    html += '</div></div>';

    html += '<table class="admin-table">';
    html += '<thead><tr><th>Page</th>';
    if (isArticle) html += '<th>SEO</th><th>GEO</th>';
    html += '<th>Statut</th><th>Dernière modification</th><th>Actions</th></tr></thead>';
    html += '<tbody>';
    cat.pages.forEach(function (p) {
      var hasData = configured[p.slug];
      var viewUrl = '/' + p.slug;
      html += '<tr>';
      html += '<td class="page-title-cell" onclick="editPage(\'' + p.slug + '\',\'' + cat.type + '\')">' + esc(p.label) + '</td>';
      if (isArticle) {
        var d = contentMap[p.slug];
        html += '<td>' + (d ? scoreBadge(calculateSEO(d)) : '<span class="score-badge score-na">—</span>') + '</td>';
        html += '<td>' + (d ? scoreBadge(calculateGEO(d)) : '<span class="score-badge score-na">—</span>') + '</td>';
      }
      // Status: Published/Scheduled/Draft for articles, Configured/Not for others
      if (isArticle) {
        var artData = contentMap[p.slug];
        var isPub = artData && artData.published;
        var isSched = !isPub && artData && artData.published_at === null && hasData;
        // Check scheduled_at if available
        if (artData && artData.scheduled_at && !isPub && new Date(artData.scheduled_at) > new Date()) isSched = true;
        var artStatus = isPub ? 'Publié' : (isSched ? 'Planifié' : (hasData ? 'Brouillon' : 'Non configuré'));
        var artDotClass = isPub ? 'published' : (isSched ? 'scheduled' : (hasData ? 'draft' : 'empty'));
        html += '<td><span class="status-dot ' + artDotClass + '"></span>' + artStatus + '</td>';
      } else {
        html += '<td><span class="status-dot ' + (hasData ? 'configured' : 'empty') + '"></span>' + (hasData ? 'Configuré' : 'Non configuré') + '</td>';
      }
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
    var viewUrl = '/' + slug;
    html += '<a class="btn-preview" href="' + viewUrl + '" target="_blank">Voir la page &#8599;</a>';
    if (type === 'article') {
      html += '<button class="btn-ai-regen" onclick="regenerateArticle()">🤖 Regénérer avec l\'IA</button>';
      html += '<button class="btn-ai-feedback" onclick="showFeedbackModal()">💬 Donner un retour</button>';
    }
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

    // Sections / Blocks
    var sections = d.sections || [];
    if (type === 'article') {
      // Block-based editor for articles
      html += metaBoxOpen('Contenu (blocs)', false);
      html += window.renderBlockEditor(sections);
      html += metaBoxClose();
    } else {
      // Legacy section editor for prepa/faculte/root
      html += metaBoxOpen('Contenu des sections', false);
      html += '<div id="sections-list">';
      sections.forEach(function (sec, i) { html += renderSectionBlock(i, sec); });
      html += '</div>';
      html += '<button class="btn-add" onclick="addSection()">+ Ajouter une section</button>';
      html += metaBoxClose();
    }

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

    // FAQ (not for articles — FAQ is a block type in block editor)
    if (type !== 'article') {
      var faq = d.faq || [];
      html += metaBoxOpen('FAQ (' + faq.length + ' questions)', true);
      html += '<div id="faq-list">';
      faq.forEach(function (item, i) { html += renderFaqBlock(i, item); });
      html += '</div>';
      html += '<button class="btn-add" onclick="addFaq()">+ Ajouter une question</button>';
      html += metaBoxClose();
    }

    html += '</div>'; // end content

    // === RIGHT COLUMN (sidebar) ===
    html += '<div class="admin-editor-sidebar">';

    // Publish box
    var isPublished = d.published || false;
    var isScheduled = !isPublished && d.scheduled_at && new Date(d.scheduled_at) > new Date();
    var statusLabel = isPublished ? 'Publié' : (isScheduled ? 'Planifié' : 'Brouillon');
    var statusClass = isPublished ? 'pub-green' : (isScheduled ? 'pub-blue' : 'pub-orange');
    html += '<div class="admin-publish-box">';
    html += '<div class="admin-publish-box-header">Publier</div>';
    html += '<div class="admin-publish-box-body">';
    if (type === 'article') {
      html += '<div class="pub-info">Statut : <strong class="pub-status-label ' + statusClass + '">' + statusLabel + '</strong></div>';
      if (d.published_at) html += '<div class="pub-info">Publié le : <strong>' + formatDate(d.published_at) + '</strong></div>';
      if (isScheduled) html += '<div class="pub-info">Planifié le : <strong>' + formatDateTime(d.scheduled_at) + '</strong></div>';
    } else {
      html += '<div class="pub-info">Statut : <strong>' + (state.pageData ? 'Configuré' : 'Brouillon') + '</strong></div>';
    }
    if (d.updated_at) html += '<div class="pub-info">Modifié : <strong>' + formatDate(d.updated_at) + '</strong></div>';
    html += '<div class="pub-info">Type : <strong>' + type + '</strong></div>';
    // Article-specific: category + excerpt + scheduling
    if (type === 'article') {
      html += '<div class="admin-field" style="margin-top:12px;"><label>Catégorie</label>';
      html += '<select name="article_category" onchange="markUnsaved()">';
      var cats = [['prepa','Prépa'],['orientation','Orientation'],['pass-las','PASS/LAS'],['parcoursup','Parcoursup'],['methode','Méthode'],['vie-etudiante','Vie étudiante'],['other','Autre']];
      cats.forEach(function (c) {
        html += '<option value="' + c[0] + '"' + ((d.category || 'other') === c[0] ? ' selected' : '') + '>' + c[1] + '</option>';
      });
      html += '</select></div>';
      html += '<div class="admin-field"><label>Extrait (blog)</label>';
      html += '<textarea name="article_excerpt" rows="3" oninput="markUnsaved()" placeholder="Court résumé affiché sur la page blog...">' + esc(d.excerpt || '') + '</textarea></div>';
      // Scheduling
      if (!isPublished) {
        html += '<div class="admin-schedule-box">';
        html += '<div class="admin-schedule-header" onclick="toggleSchedulePanel()">';
        html += '<span class="schedule-icon">&#128197;</span> Planifier la publication';
        html += '<span class="schedule-chevron' + (isScheduled ? ' open' : '') + '">&#9662;</span>';
        html += '</div>';
        html += '<div class="admin-schedule-body" id="schedule-body" style="display:' + (isScheduled ? 'block' : 'none') + ';">';
        var scheduledVal = d.scheduled_at ? new Date(d.scheduled_at).toISOString().slice(0, 16) : '';
        html += '<div class="admin-field"><label>Date et heure de publication</label>';
        html += '<input type="datetime-local" name="scheduled_at" value="' + scheduledVal + '" onchange="markUnsaved()" min="' + new Date().toISOString().slice(0, 16) + '">';
        html += '<div class="admin-field-hint">L\'article sera publié automatiquement à cette date.</div></div>';
        if (isScheduled) {
          html += '<button class="btn-cancel-schedule" onclick="cancelSchedule(\'' + type + '\')">Annuler la planification</button>';
        }
        html += '</div></div>';
      }
    }
    html += '</div>';
    html += '<div class="admin-publish-box-footer">';
    if (type === 'article') {
      if (isPublished) {
        html += '<button class="btn-unpublish" onclick="togglePublish(false,\'' + type + '\')">Dépublier</button>';
        html += '<button class="btn-primary" onclick="savePage(\'' + type + '\')" id="btn-save">Mettre à jour</button>';
      } else if (isScheduled) {
        html += '<button class="btn-save-draft" onclick="savePage(\'' + type + '\')" id="btn-save">Mettre à jour</button>';
        html += '<button class="btn-publish" onclick="togglePublish(true,\'' + type + '\')">Publier maintenant</button>';
      } else {
        html += '<button class="btn-save-draft" onclick="savePage(\'' + type + '\')" id="btn-save">Enregistrer brouillon</button>';
        html += '<button class="btn-schedule" onclick="scheduleArticle(\'' + type + '\')">Planifier</button>';
        html += '<button class="btn-publish" onclick="togglePublish(true,\'' + type + '\')">Publier</button>';
      }
    } else {
      html += '<button class="btn-primary" onclick="savePage(\'' + type + '\')" id="btn-save">Mettre à jour</button>';
    }
    html += '</div></div>';

    // Score panel (article only) — uses advanced block-aware scoring
    if (type === 'article') {
      window._pageData = d; // Pass page data for score panel rendering
      html += window.renderAdvancedScorePanel();
    }

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
    if (type === 'article') {
      // Use advanced block-aware scoring
      if (window.updateAdvancedScorePanel) { window.updateAdvancedScorePanel(); window.bindAdvancedScoreUpdates(); }
      // Add wider layout class for block editor
      var editorEl = document.querySelector('.admin-editor');
      if (editorEl) editorEl.classList.add('has-blocks');
    }
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
  var competitorArticlesCache = null;

  window.showAddModal = function (catId, type) {
    var catLabels = { 'prepas': 'une prépa', 'facultes': 'une faculté', 'articles': 'un article', 'pages': 'une page' };
    var isArticle = (catId === 'articles');
    var html = '<div class="admin-modal-overlay" id="add-modal" onclick="if(event.target===this)closeAddModal()">';
    html += '<div class="admin-modal' + (isArticle ? ' admin-modal-wide' : '') + '">';
    html += '<h3>Ajouter ' + (catLabels[catId] || 'une page') + '</h3>';
    html += '<div class="admin-field"><label>Titre</label><input type="text" id="new-page-title" placeholder="Ex: Mon nouvel article" autofocus></div>';
    html += '<div class="admin-field"><label>Slug (URL)</label><input type="text" id="new-page-slug" placeholder="Auto-généré depuis le titre"><div class="admin-field-hint">Sera ajouté après /' + (CAT_TO_PREFIX[catId] || '') + '</div></div>';

    // AI source selector for articles
    if (isArticle) {
      html += '<div class="ai-source-section">';
      html += '<div class="ai-source-header"><span class="ai-icon">🤖</span> Génération IA (optionnel)</div>';
      html += '<div class="admin-field"><label>S\'inspirer d\'un article concurrent</label>';
      html += '<select id="ai-competitor-select"><option value="">— Chargement des articles... —</option></select>';
      html += '<div class="admin-field-hint">Sélectionne un article concurrent ou colle une URL ci-dessous</div></div>';
      html += '<div class="admin-field"><label>Ou coller une URL source</label>';
      html += '<input type="url" id="ai-source-url" placeholder="https://example.com/article-a-copier"></div>';
      html += '</div>';
    }

    html += '<div class="admin-modal-actions">';
    html += '<button class="btn-secondary" onclick="closeAddModal()">Annuler</button>';
    if (isArticle) {
      html += '<button class="btn-primary btn-ai-generate" onclick="createNewPage(\'' + catId + '\',\'' + type + '\')"><span class="ai-icon-sm">🤖</span> Créer &amp; Générer</button>';
    } else {
      html += '<button class="btn-primary" onclick="createNewPage(\'' + catId + '\',\'' + type + '\')">Créer la page</button>';
    }
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

    // Load competitor articles for article creation
    if (isArticle) {
      loadCompetitorArticles();
      // Sync select → URL field
      document.getElementById('ai-competitor-select').onchange = function () {
        var urlInput = document.getElementById('ai-source-url');
        if (this.value) urlInput.value = this.value;
      };
    }
  };

  async function loadCompetitorArticles() {
    var sel = document.getElementById('ai-competitor-select');
    if (!sel) return;
    if (competitorArticlesCache) {
      renderCompetitorSelect(sel, competitorArticlesCache);
      return;
    }
    try {
      var res = await fetch(SUPABASE_URL + '/functions/v1/fetch-competitor-articles');
      var data = await res.json();
      if (data.sources) {
        competitorArticlesCache = data.sources;
        renderCompetitorSelect(sel, data.sources);
      } else {
        sel.innerHTML = '<option value="">Erreur de chargement</option>';
      }
    } catch (e) {
      console.error('Competitor fetch error:', e);
      sel.innerHTML = '<option value="">Erreur de chargement</option>';
    }
  }

  function renderCompetitorSelect(sel, sources) {
    var html = '<option value="">— Choisir un article concurrent —</option>';
    sources.forEach(function (src) {
      if (src.articles.length === 0) return;
      html += '<optgroup label="' + esc(src.site) + ' (' + src.articles.length + ' articles)">';
      src.articles.forEach(function (a) {
        var shortTitle = a.title.length > 70 ? a.title.substring(0, 67) + '...' : a.title;
        html += '<option value="' + esc(a.url) + '">' + esc(shortTitle) + '</option>';
      });
      html += '</optgroup>';
    });
    sel.innerHTML = html;
  }

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
    btn.disabled = true;

    // Check if AI generation is requested (articles only)
    var isArticle = (catId === 'articles');
    var sourceUrl = '';
    if (isArticle) {
      var urlInput = document.getElementById('ai-source-url');
      sourceUrl = urlInput ? urlInput.value.trim() : '';
    }
    var useAI = isArticle && (sourceUrl || title);

    if (useAI) {
      btn.innerHTML = '<span class="ai-icon-sm">🤖</span> Génération IA...';
      showAIOverlay('Génération de l\'article en cours...<br><small>Cela peut prendre 20-30 secondes</small>');
    } else {
      btn.textContent = 'Création...';
    }

    try {
      // 1. Create empty record
      var insertData = { page_slug: fullSlug, page_type: type, title: title };
      var r = await sb.from('page_content').insert(insertData);
      if (r.error) throw r.error;

      // 2. If AI, generate content
      if (useAI) {
        try {
          var existingArticles = allPages
            .filter(function (p) { return p.type === 'article'; })
            .map(function (p) { return { title: p.label, slug: p.slug }; });

          var aiRes = await fetch(SUPABASE_URL + '/functions/v1/generate-article', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: title, source_url: sourceUrl, existing_articles: existingArticles })
          });
          var aiData = await aiRes.json();

          if (aiData.error) {
            showToast('IA: ' + aiData.error + ' — page créée vide', 'error');
          } else {
            // Update record with AI content — convert to blocks
            var aiSections = aiData.sections || [];
            var aiFaq = aiData.faq || [];
            if (window.convertLegacyToBlocks) {
              aiSections = window.convertLegacyToBlocks({ sections: aiSections, faq: aiFaq });
              aiFaq = []; // FAQ absorbed into blocks
            }
            var update = {
              title: aiData.title || title,
              meta_description: aiData.meta_description || null,
              subtitle: aiData.subtitle || null,
              sections: aiSections,
              faq: aiFaq
            };
            var ur = await sb.from('page_content').update(update).eq('page_slug', fullSlug);
            if (ur.error) console.error('Update error:', ur.error);
            else showToast('Article généré par l\'IA ✨', 'success');
          }
        } catch (aiErr) {
          console.error('AI generation error:', aiErr);
          showToast('Erreur IA — page créée vide', 'error');
        }
      }

      // 3. Add to local state
      var cat = CATEGORIES.find(function (c) { return c.id === catId; });
      cat.pages.push({ slug: fullSlug, label: title, dynamic: true });
      allPages.push({ slug: fullSlug, label: title, type: type, category: cat.label, dynamic: true });

      hideAIOverlay();
      closeAddModal();
      if (!useAI) showToast('Page "' + title + '" créée', 'success');
      editPage(fullSlug, type);
    } catch (err) {
      hideAIOverlay();
      showToast('Erreur : ' + (err.message || 'Échec'), 'error');
      btn.disabled = false; btn.textContent = 'Créer la page';
    }
  };

  /* ─── AI Overlay ─── */
  function showAIOverlay(msg) {
    if (document.getElementById('ai-overlay')) return;
    var html = '<div id="ai-overlay" class="ai-overlay">';
    html += '<div class="ai-overlay-content">';
    html += '<div class="ai-spinner"></div>';
    html += '<p>' + msg + '</p>';
    html += '</div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
  }
  function hideAIOverlay() {
    var el = document.getElementById('ai-overlay');
    if (el) el.remove();
  }

  /* ─── Regenerate article with AI ─── */
  window.regenerateArticle = async function () {
    if (!state.currentSlug) return;
    var title = document.querySelector('[name="title"]');
    if (!title || !title.value.trim()) { showToast('Titre requis pour régénérer', 'error'); return; }
    if (!confirm('Régénérer l\'article avec l\'IA ? Le contenu actuel sera remplacé.')) return;

    showAIOverlay('Regénération en cours...<br><small>~20-30 secondes</small>');

    try {
      var existingArticles = allPages
        .filter(function (p) { return p.type === 'article' && p.slug !== state.currentSlug; })
        .map(function (p) { return { title: p.label, slug: p.slug }; });

      var aiRes = await fetch(SUPABASE_URL + '/functions/v1/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.value.trim(), existing_articles: existingArticles })
      });
      var aiData = await aiRes.json();

      if (aiData.error) {
        hideAIOverlay();
        showToast('Erreur IA: ' + aiData.error, 'error');
        return;
      }

      // Update in DB — convert to blocks
      var regenSections = aiData.sections || [];
      var regenFaq = aiData.faq || [];
      if (window.convertLegacyToBlocks) {
        regenSections = window.convertLegacyToBlocks({ sections: regenSections, faq: regenFaq });
        regenFaq = [];
      }
      var update = {
        title: aiData.title || title.value.trim(),
        meta_description: aiData.meta_description || null,
        subtitle: aiData.subtitle || null,
        sections: regenSections,
        faq: regenFaq
      };
      var r = await sb.from('page_content').update(update).eq('page_slug', state.currentSlug);
      if (r.error) throw r.error;

      hideAIOverlay();
      showToast('Article regénéré ✨', 'success');
      // Reload editor
      editPage(state.currentSlug, 'article');
    } catch (err) {
      hideAIOverlay();
      showToast('Erreur : ' + (err.message || 'Échec'), 'error');
    }
  };

  /* ─── Score Panel (real-time) ─── */
  var _scoreTimer = null;

  function collectFormData() {
    var d = { title: getVal('title'), meta_description: getVal('meta_description'), subtitle: getVal('subtitle'), sections: [], faq: [] };
    document.querySelectorAll('#sections-list .admin-content-section').forEach(function (el) {
      var h = el.querySelector('[name^="section_heading_"]');
      var c = el.querySelector('[name^="section_html_"]');
      d.sections.push({ heading: h ? h.value.trim() : '', html: c ? c.value.trim() : '' });
    });
    document.querySelectorAll('#faq-list .admin-faq-item').forEach(function (el) {
      var q = el.querySelector('[name^="faq_q_"]');
      var a = el.querySelector('[name^="faq_a_"]');
      if (q || a) d.faq.push({ question: q ? q.value.trim() : '', answer: a ? a.value.trim() : '' });
    });
    return d;
  }

  function updateScorePanel() {
    var panel = document.getElementById('score-panel');
    if (!panel) return;
    var d = collectFormData();
    var seo = calculateSEO(d);
    var geo = calculateGEO(d);

    // Summary
    document.getElementById('score-summary').innerHTML =
      '<div class="score-row"><span>SEO</span>' + scoreBadge(seo) + '</div>' +
      '<div class="score-row"><span>GEO</span>' + scoreBadge(geo) + '</div>';

    // Checks
    var t = d.title || '';
    var md = d.meta_description || '';
    var secs = d.sections || [];
    var faq = d.faq || [];
    var filledSecs = secs.filter(function (s) { return s.html && s.html.length > 30; });
    var headedSecs = secs.filter(function (s) { return s.heading && s.heading.length > 0; });
    var totalWords = 0;
    var allHtml = '';
    secs.forEach(function (s) { totalWords += countWords(s.html); allHtml += (s.html || ''); });
    var hasList = /<(ul|ol)\b/i.test(allHtml);
    var detailedFaq = faq.filter(function (f) { return (f.answer || '').length > 50; });

    var checks = '';
    checks += '<div class="score-check-label">SEO</div>';
    checks += chk(t.length >= 50 && t.length <= 65, 'Titre ' + t.length + '/50-65 car.', t.length > 0 ? 'Titre : ' + t.length + ' car. (idéal 50-65)' : 'Titre manquant');
    checks += chk(md.length >= 140 && md.length <= 160, 'Meta ' + md.length + '/140-160 car.', md.length > 0 ? 'Meta : ' + md.length + ' car. (idéal 140-160)' : 'Meta description manquante');
    checks += chk(!!d.subtitle, 'Sous-titre présent', 'Sous-titre manquant');
    checks += chk(filledSecs.length >= 3, filledSecs.length + ' sections avec contenu', 'Moins de 3 sections (actuellement ' + filledSecs.length + ')');
    checks += chk(headedSecs.length >= secs.length && secs.length > 0, 'Toutes les sections ont un titre', (secs.length - headedSecs.length) + ' section(s) sans titre');
    checks += chk(totalWords >= 800, totalWords + ' mots (min. 800)', totalWords + ' mots (min. 800 recommandé)');
    checks += chk(faq.length >= 3, faq.length + ' questions FAQ', faq.length > 0 ? faq.length + ' FAQ (min. 3 recommandé)' : 'Pas de FAQ');

    checks += '<div class="score-check-label">GEO</div>';
    checks += chk(faq.length >= 5, faq.length + '/5 questions FAQ', faq.length + '/5 questions FAQ minimum');
    checks += chk(totalWords >= 1500, totalWords + ' mots (min. 1500)', totalWords + '/1500 mots minimum');
    checks += chk(hasList, 'Listes HTML présentes', 'Pas de listes (ul/ol) dans le contenu');
    checks += chk(secs.length >= 5, secs.length + '/5 sections minimum', secs.length + '/5 sections minimum');
    checks += chk(detailedFaq.length >= faq.length && faq.length > 0, 'Réponses FAQ détaillées', detailedFaq.length + '/' + faq.length + ' réponses FAQ détaillées');

    document.getElementById('score-checks').innerHTML = checks;
  }

  function chk(pass, goodText, badText) {
    return '<div class="score-check ' + (pass ? 'pass' : 'fail') + '">' +
      '<span>' + (pass ? '&#10003;' : '&#10007;') + '</span>' +
      '<span>' + (pass ? goodText : badText) + '</span></div>';
  }

  function bindScoreUpdates() {
    var content = document.querySelector('.admin-editor-content');
    if (!content) return;
    content.addEventListener('input', function () {
      clearTimeout(_scoreTimer);
      _scoreTimer = setTimeout(updateScorePanel, 500);
    });
    // Observe section/faq additions/removals
    ['sections-list', 'faq-list'].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      new MutationObserver(function () { clearTimeout(_scoreTimer); _scoreTimer = setTimeout(updateScorePanel, 300); })
        .observe(el, { childList: true });
    });
  }

  /* ─── Improve Article with AI ─── */
  window.improveArticle = async function () {
    if (!state.currentSlug) return;
    // Collect data from block editor if available
    var d;
    if (window.collectFormDataFromBlocks && document.getElementById('blocks-list')) {
      d = window.collectFormDataFromBlocks();
    } else {
      d = collectFormData();
    }
    if (!d.title) { showToast('Titre requis pour améliorer', 'error'); return; }
    if (!confirm('Améliorer l\'article avec l\'IA ? Le contenu sera réécrit et humanisé.')) return;

    var seo = window._lastSEOScore || calculateSEO(d);
    var geo = window._lastGEOScore || calculateGEO(d);

    showAIOverlay('Amélioration et humanisation en cours...<br><small>~30-40 secondes</small>');

    try {
      // Convert blocks back to legacy format for the AI edge function
      var sectionsForAI = d.sections || [];
      var faqForAI = d.faq || [];
      // If sections are in block format, flatten for AI
      if (sectionsForAI.length && sectionsForAI[0] && sectionsForAI[0].type) {
        var legacySections = [];
        var legacyFaq = [];
        sectionsForAI.forEach(function (block) {
          if (block.type === 'heading') {
            legacySections.push({ heading: block.text || '', html: '' });
          } else if (block.type === 'paragraph') {
            if (legacySections.length && !legacySections[legacySections.length - 1].html) {
              legacySections[legacySections.length - 1].html = block.html || '';
            } else {
              legacySections.push({ heading: '', html: block.html || '' });
            }
          } else if (block.type === 'faq') {
            legacyFaq = legacyFaq.concat(block.items || []);
          }
        });
        sectionsForAI = legacySections;
        faqForAI = legacyFaq;
      }

      var aiRes = await fetch(SUPABASE_URL + '/functions/v1/improve-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: d.title,
          meta_description: d.meta_description,
          subtitle: d.subtitle,
          sections: sectionsForAI,
          faq: faqForAI,
          scores: { seo: seo, geo: geo }
        })
      });
      var aiData = await aiRes.json();

      if (aiData.error) {
        hideAIOverlay();
        showToast('Erreur IA: ' + aiData.error, 'error');
        return;
      }

      // Update in DB — convert AI response back to blocks
      var improveSections = aiData.sections || [];
      var improveFaq = aiData.faq || [];
      if (window.convertLegacyToBlocks) {
        improveSections = window.convertLegacyToBlocks({ sections: improveSections, faq: improveFaq });
        improveFaq = [];
      }
      var update = {
        title: aiData.title || d.title,
        meta_description: aiData.meta_description || null,
        subtitle: aiData.subtitle || null,
        sections: improveSections,
        faq: improveFaq
      };
      var r = await sb.from('page_content').update(update).eq('page_slug', state.currentSlug);
      if (r.error) throw r.error;

      hideAIOverlay();
      showToast('Article amélioré et humanisé ✨', 'success');
      editPage(state.currentSlug, 'article');
    } catch (err) {
      hideAIOverlay();
      showToast('Erreur : ' + (err.message || 'Échec'), 'error');
    }
  };

  /* ─── AI Feedback ─── */
  window.showFeedbackModal = function () {
    if (!state.currentSlug) return;
    var html = '<div class="admin-modal-overlay" id="feedback-modal" onclick="if(event.target===this)closeFeedbackModal()">';
    html += '<div class="admin-modal admin-modal-wide">';
    html += '<h3>💬 Donner un retour à l\'IA</h3>';
    html += '<p style="color:#50575e;font-size:12px;margin-bottom:12px;">Décrivez ce qu\'il faut corriger ou améliorer. L\'IA réécrira l\'article en tenant compte de vos instructions.</p>';
    html += '<div class="admin-field"><label>Vos instructions</label>';
    html += '<textarea id="ai-feedback-text" rows="5" placeholder="Ex: En Terminale on garde 2 spécialités, pas 3. Ajouter plus d\'infos sur Parcoursup. Le ton est trop formel, rendre plus accessible..."></textarea></div>';
    html += '<div class="feedback-suggestions">';
    html += '<span class="feedback-chip" onclick="addFeedback(\'Corriger les erreurs factuelles\')">Corriger les erreurs</span>';
    html += '<span class="feedback-chip" onclick="addFeedback(\'Rendre le ton plus accessible et bienveillant\')">Ton plus accessible</span>';
    html += '<span class="feedback-chip" onclick="addFeedback(\'Ajouter plus de liens internes vers les outils AFEM\')">Plus de liens internes</span>';
    html += '<span class="feedback-chip" onclick="addFeedback(\'Allonger l article avec plus de détails concrets\')">Plus de contenu</span>';
    html += '<span class="feedback-chip" onclick="addFeedback(\'Ajouter un tableau comparatif\')">Ajouter un tableau</span>';
    html += '</div>';
    html += '<div class="admin-modal-actions">';
    html += '<button class="btn-secondary" onclick="closeFeedbackModal()">Annuler</button>';
    html += '<button class="btn-primary" onclick="submitFeedback()">🤖 Appliquer les retours</button>';
    html += '</div></div></div>';
    document.body.insertAdjacentHTML('beforeend', html);
    document.getElementById('ai-feedback-text').focus();
  };

  window.closeFeedbackModal = function () {
    var m = document.getElementById('feedback-modal');
    if (m) m.remove();
  };

  window.addFeedback = function (text) {
    var ta = document.getElementById('ai-feedback-text');
    if (!ta) return;
    ta.value = (ta.value ? ta.value + '\n' : '') + text;
  };

  window.submitFeedback = async function () {
    var feedback = document.getElementById('ai-feedback-text').value.trim();
    if (!feedback) { showToast('Écrivez vos instructions', 'error'); return; }
    if (!confirm('Appliquer ces retours ? L\'IA va réécrire l\'article.')) return;

    closeFeedbackModal();

    // Collect current article data
    var d;
    if (window.collectFormDataFromBlocks && document.getElementById('blocks-list')) {
      d = window.collectFormDataFromBlocks();
    } else {
      d = collectFormData();
    }

    showAIOverlay('Application des retours en cours...<br><small>~30-40 secondes</small>');

    try {
      // Convert blocks to legacy for AI
      var sectionsForAI = d.sections || [];
      var faqForAI = d.faq || [];
      if (sectionsForAI.length && sectionsForAI[0] && sectionsForAI[0].type) {
        var legacySections = [];
        var legacyFaq = [];
        sectionsForAI.forEach(function (block) {
          if (block.type === 'heading') {
            legacySections.push({ heading: block.text || '', html: '' });
          } else if (block.type === 'paragraph') {
            if (legacySections.length && !legacySections[legacySections.length - 1].html) {
              legacySections[legacySections.length - 1].html = block.html || '';
            } else {
              legacySections.push({ heading: '', html: block.html || '' });
            }
          } else if (block.type === 'faq') {
            legacyFaq = legacyFaq.concat(block.items || []);
          }
        });
        sectionsForAI = legacySections;
        faqForAI = legacyFaq;
      }

      var aiRes = await fetch(SUPABASE_URL + '/functions/v1/improve-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: d.title,
          meta_description: d.meta_description,
          subtitle: d.subtitle,
          sections: sectionsForAI,
          faq: faqForAI,
          scores: { seo: window._lastSEOScore || 0, geo: window._lastGEOScore || 0 },
          feedback: feedback
        })
      });
      var aiData = await aiRes.json();

      if (aiData.error) {
        hideAIOverlay();
        showToast('Erreur IA: ' + aiData.error, 'error');
        return;
      }

      // Update in DB
      var improveSections = aiData.sections || [];
      var improveFaq = aiData.faq || [];
      if (window.convertLegacyToBlocks) {
        improveSections = window.convertLegacyToBlocks({ sections: improveSections, faq: improveFaq });
        improveFaq = [];
      }
      var update = {
        title: aiData.title || d.title,
        meta_description: aiData.meta_description || null,
        subtitle: aiData.subtitle || null,
        sections: improveSections,
        faq: improveFaq
      };
      var r = await sb.from('page_content').update(update).eq('page_slug', state.currentSlug);
      if (r.error) throw r.error;

      hideAIOverlay();
      showToast('Retours appliqués avec succès', 'success');
      editPage(state.currentSlug, 'article');
    } catch (err) {
      hideAIOverlay();
      showToast('Erreur : ' + (err.message || 'Échec'), 'error');
    }
  };

  /* ─── Schedule article ─── */
  window.toggleSchedulePanel = function () {
    var body = document.getElementById('schedule-body');
    if (body) {
      body.style.display = body.style.display === 'none' ? 'block' : 'none';
      var chevron = body.parentElement.querySelector('.schedule-chevron');
      if (chevron) chevron.classList.toggle('open');
    }
  };

  window.scheduleArticle = async function (type) {
    var scheduledAt = getVal('scheduled_at');
    if (!scheduledAt) {
      // Open the schedule panel if closed
      var body = document.getElementById('schedule-body');
      if (body && body.style.display === 'none') { toggleSchedulePanel(); }
      showToast('Sélectionnez une date de publication', 'error');
      return;
    }
    var scheduledDate = new Date(scheduledAt);
    if (scheduledDate <= new Date()) {
      showToast('La date doit être dans le futur', 'error');
      return;
    }
    if (!getVal('title')) { showToast('Titre requis', 'error'); return; }

    try {
      var data = {
        page_slug: state.currentSlug, page_type: type,
        title: getVal('title') || null,
        meta_description: getVal('meta_description') || null,
        subtitle: getVal('subtitle') || null,
        sections: [], faq: [], coup_de_coeur: {},
        category: getVal('article_category') || 'other',
        excerpt: getVal('article_excerpt') || null,
        focus_keyword: getVal('focus_keyword') || null,
        published: false,
        scheduled_at: scheduledDate.toISOString()
      };
      if (window.collectAllBlocks && document.getElementById('blocks-list')) {
        data.sections = window.collectAllBlocks();
        data.faq = [];
        if (window._lastSEOScore !== undefined) data.seo_score = window._lastSEOScore;
        if (window._lastGEOScore !== undefined) data.geo_score = window._lastGEOScore;
      } else {
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
      }

      var r = await sb.from('page_content').upsert(data, { onConflict: 'page_slug' });
      if (r.error) throw r.error;

      state.unsaved = false;
      showToast('Article planifié pour le ' + formatDateTime(scheduledDate.toISOString()), 'success');
      editPage(state.currentSlug, type);
    } catch (err) {
      console.error(err);
      showToast('Erreur : ' + (err.message || 'Échec'), 'error');
    }
  };

  window.cancelSchedule = async function (type) {
    if (!confirm('Annuler la planification ? L\'article repassera en brouillon.')) return;
    try {
      var r = await sb.from('page_content').update({ scheduled_at: null }).eq('page_slug', state.currentSlug);
      if (r.error) throw r.error;
      showToast('Planification annulée', 'success');
      editPage(state.currentSlug, type);
    } catch (err) {
      showToast('Erreur : ' + (err.message || 'Échec'), 'error');
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

  /* ─── Publish / Unpublish ─── */
  window.togglePublish = async function (publish, type) {
    if (publish && !getVal('title')) { showToast('Titre requis pour publier', 'error'); return; }
    if (publish && !confirm('Publier cet article ? Il apparaîtra sur le blog.')) return;
    if (!publish && !confirm('Dépublier cet article ? Il disparaîtra du blog.')) return;

    // Save first, then toggle publish
    try {
      var data = {
        page_slug: state.currentSlug, page_type: type,
        title: getVal('title') || null,
        meta_description: getVal('meta_description') || null,
        subtitle: getVal('subtitle') || null,
        sections: [], faq: [], coup_de_coeur: {},
        category: getVal('article_category') || 'other',
        excerpt: getVal('article_excerpt') || null,
        focus_keyword: getVal('focus_keyword') || null,
        published: publish,
        published_at: publish ? new Date().toISOString() : null
      };
      // Use block editor for articles
      if (window.collectAllBlocks && document.getElementById('blocks-list')) {
        data.sections = window.collectAllBlocks();
        data.faq = [];
        if (window._lastSEOScore !== undefined) data.seo_score = window._lastSEOScore;
        if (window._lastGEOScore !== undefined) data.geo_score = window._lastGEOScore;
      } else {
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
      }

      var r = await sb.from('page_content').upsert(data, { onConflict: 'page_slug' });
      if (r.error) throw r.error;

      state.unsaved = false;
      showToast(publish ? 'Article publié !' : 'Article dépublié', 'success');
      // Reload editor to reflect new state
      editPage(state.currentSlug, type);
    } catch (err) {
      console.error(err);
      showToast('Erreur : ' + (err.message || 'Échec'), 'error');
    }
  };

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
      // Article-specific: use block editor + advanced scoring
      if (type === 'article') {
        data.category = getVal('article_category') || 'other';
        data.excerpt = getVal('article_excerpt') || null;
        data.focus_keyword = getVal('focus_keyword') || null;
        if (window.collectAllBlocks) {
          data.sections = window.collectAllBlocks();
          data.faq = []; // FAQ is inside blocks for articles
        }
        if (window._lastSEOScore !== undefined) data.seo_score = window._lastSEOScore;
        if (window._lastGEOScore !== undefined) data.geo_score = window._lastGEOScore;
      } else {
        // Legacy section collection for prepa/faculte/root
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
      }
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
  function formatDateTime(iso) {
    if (!iso) return '—';
    var d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }) + ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
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
