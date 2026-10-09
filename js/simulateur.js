/**
 * Simulateur Parcoursup — interface (profil → vœux → chances).
 * Données en direct depuis l'open data Parcoursup : voir js/psup/*.js et SIMULATEUR.md.
 */
(function () {
  'use strict';

  var CONFIG = window.PSUP_CONFIG, API = window.PSUP_API, MODEL = window.PSUP_MODEL;
  var root = document.getElementById('simu');
  if (!root || !CONFIG || !API || !MODEL) return;

  var FREE_RESULTS = 3; // vœux détaillés visibles avant le formulaire

  var state = {
    profil: { classe: 'terminale', dept: '', bac: 'gen', specialites: ['svt', 'pc'], serie: 'STL', maths: 'complementaires', gen: 14, spe: 14 },
    voeux: [],            // entrées catalogue { cod, label, etab, ville, departement, fili, familyKey, fiche }
    finder: { q: '', fam: 'acces-sante', near: true },
    results: [],
    suggestions: [],
    unlocked: false,
  };

  // ─── Utilitaires ───
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return n == null ? '–' : Number(n).toLocaleString('fr-FR'); }
  function pl(n, w) { return n + ' ' + w + (n > 1 ? 's' : ''); }
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function store(k, v) { try { localStorage.setItem('afem-simu2-' + k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
  function load(k) { try { return JSON.parse(localStorage.getItem('afem-simu2-' + k)); } catch (e) { return null; } }
  function track(ev, custom) { if (!window.fbq) return; try { custom ? window.fbq('trackCustom', ev) : window.fbq('track', ev); } catch (e) { /* pixel bloqué */ } }
  function debounce(fn, ms) { var t; return function () { var a = arguments; clearTimeout(t); t = setTimeout(function () { fn.apply(null, a); }, ms); }; }
  function etabName(s) { return String(s || '').split(' (')[0]; }
  function profilForModel() {
    var p = state.profil;
    return { gen: p.gen, spe: p.spe, bac: p.bac, specialites: p.specialites, maths: p.maths, aca: MODEL.academyOfDept(p.dept) };
  }
  function sectorLabel() {
    var aca = MODEL.academyOfDept(state.profil.dept);
    if (!aca) return 'hors France';
    return MODEL.academiesOfSector(aca).length > 1 ? 'Île-de-France' : 'académie de ' + aca;
  }
  function shortLabel(label) {
    return String(label || '')
      .replace(/Parcours d'Accès Spécifique Santé \(PASS\)/i, 'PASS')
      .replace(/\s+-\s+Accès Santé \(LAS\)/i, ' (L.AS)')
      .replace(/\s{2,}/g, ' ').trim();
  }

  // ─── Navigation ───
  function goStep(n) {
    $$('.sim-step', root).forEach(function (el) { el.hidden = +el.dataset.step !== n; });
    $$('.sim-progress li', root).forEach(function (li) {
      var s = +li.dataset.step;
      li.classList.toggle('is-active', s === n);
      li.classList.toggle('is-done', s < n);
    });
    var hash = ['', '#mon-profil', '#mes-voeux', '#mes-chances'][n];
    if (location.hash !== hash) history.replaceState(null, '', hash);
    var top = root.getBoundingClientRect().top + window.scrollY - 90;
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
  }
  $$('[data-back]', root).forEach(function (b) { b.addEventListener('click', function () { goStep(+b.dataset.back); }); });

  // ─── Étape 1 : profil ───
  var deptSel = $('#sim-dept');
  function opt(sel, value, text) { var o = document.createElement('option'); o.value = value; o.textContent = text; sel.appendChild(o); }
  CONFIG.departements.forEach(function (d) { opt(deptSel, d[0], d[0] === 'etranger' ? d[1] : d[0] + ' — ' + d[1]); });
  $$('[data-spe]', root).forEach(function (sel) { CONFIG.specialites.forEach(function (s) { opt(sel, s[0], s[1]); }); });
  CONFIG.seriesTechno.forEach(function (s) { opt($('#sim-serie'), s, s); });

  $$('.sim-choices[data-name]', root).forEach(function (group) {
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-value]');
      if (!btn) return;
      state.profil[group.dataset.name] = btn.dataset.value;
      syncProfil();
    });
  });

  $$('.sim-grade', root).forEach(function (wrap) {
    var range = $('input[type=range]', wrap), num = $('input[type=number]', wrap), name = wrap.dataset.name;
    function set(v, from) {
      v = clamp(Math.round(parseFloat(v) * 10) / 10 || 0, 0, 20);
      state.profil[name] = v;
      if (from !== range) range.value = v;
      if (from !== num) num.value = v.toFixed(1);
      wrap.style.setProperty('--fill', clamp((v - 8) / 12 * 100, 0, 100) + '%');
    }
    range.addEventListener('input', function () { set(range.value, range); });
    num.addEventListener('change', function () { set(num.value, num); });
    wrap._set = set;
  });

  function syncProfil() {
    var p = state.profil;
    $$('.sim-choices[data-name]', root).forEach(function (g) {
      $$('button', g).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.value === p[g.dataset.name] ? 'true' : 'false'); });
    });
    $$('[data-show-bac]', root).forEach(function (el) { el.hidden = el.dataset.showBac !== p.bac; });
    $('#sim-spe1').value = p.specialites[0] || 'maths';
    $('#sim-spe2').value = p.specialites[1] || 'pc';
    $('#sim-serie').value = p.serie;
    $('#sim-classe').value = p.classe;
    deptSel.value = p.dept || '';
    $$('.sim-grade', root).forEach(function (w) { w._set(p[w.dataset.name]); });
  }

  $('#sim-to-2').addEventListener('click', function () {
    var p = state.profil, err = $('#sim-err-1');
    p.dept = deptSel.value;
    p.classe = $('#sim-classe').value;
    p.specialites = [$('#sim-spe1').value, $('#sim-spe2').value];
    p.serie = $('#sim-serie').value;
    if (!p.dept) { err.textContent = 'Indique ton département : beaucoup de formations donnent la priorité à leur secteur.'; deptSel.focus(); return; }
    if (p.bac === 'gen' && p.specialites[0] === p.specialites[1]) { err.textContent = 'Choisis deux spécialités différentes.'; return; }
    err.textContent = '';
    store('profil', p);
    $('#sim-sector-label').textContent = sectorLabel();
    track('Simulateur_Profil', true);
    goStep(2);
    renderMine();
    search();
  });

  // ─── Étape 2 : vœux ───
  var famBox = $('#sim-fams');
  [{ key: '', short: 'Tout' }].concat(CONFIG.families.filter(function (f) { return f.catalogWhere; })).forEach(function (f) {
    var b = document.createElement('button');
    b.type = 'button'; b.dataset.value = f.key; b.textContent = f.short;
    famBox.appendChild(b);
  });
  famBox.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-value]');
    if (!b) return;
    state.finder.fam = b.dataset.value;
    state.finder.q = qInput.value;
    syncFinder(); search();
  });
  var qInput = $('#sim-q');
  qInput.addEventListener('input', debounce(function () { state.finder.q = qInput.value; search(); }, 350));
  $('#sim-near').addEventListener('change', function (e) { state.finder.near = e.target.checked; search(); });

  function syncFinder() {
    $$('button', famBox).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.value === state.finder.fam ? 'true' : 'false'); });
    $('#sim-near').checked = state.finder.near;
    $('#sim-q').value = state.finder.q;
  }

  var searchSeq = 0, foundRows = [];
  function search() {
    var f = state.finder, seq = ++searchSeq;
    var info = $('#sim-found-info'), list = $('#sim-found');
    if (!f.q.trim() && !f.fam) { info.textContent = 'Tape un mot-clé ou choisis un type de formation.'; list.innerHTML = ''; return; }
    info.textContent = 'Recherche…';
    var aca = MODEL.academyOfDept(state.profil.dept);
    API.searchCatalog({
      q: f.q, family: f.fam || null, limit: 40,
      departements: f.near && aca ? MODEL.departementsOfSector(aca) : null,
    }).then(function (rows) {
      if (seq !== searchSeq) return;
      // PASS d'abord, puis par établissement
      rows.sort(function (a, b) { return (b.fili === 'PASS') - (a.fili === 'PASS') || a.etab.localeCompare(b.etab, 'fr') || a.label.localeCompare(b.label, 'fr'); });
      foundRows = rows;
      info.textContent = rows.length
        ? pl(rows.length, 'formation') + (rows.length >= 40 ? ' (affine ta recherche pour en voir d\'autres)' : '')
        : 'Aucune formation trouvée. Essaie un autre mot-clé ou décoche « Seulement dans mon secteur ».';
      list.innerHTML = rows.map(function (c) {
        var chosen = state.voeux.some(function (v) { return v.cod === c.cod; });
        return '<li class="sim-found-item">' +
          '<div><strong>' + esc(shortLabel(c.label)) + '</strong><span>' + esc(etabName(c.etab)) + ' · ' + esc(c.ville) + '</span></div>' +
          '<button type="button" class="sim-add" data-cod="' + esc(c.cod) + '"' + (chosen ? ' disabled' : '') + '>' + (chosen ? '✓ Ajouté' : '+ Ajouter') + '</button></li>';
      }).join('');
    }).catch(function (e) {
      if (seq !== searchSeq) return;
      info.textContent = 'Les données Parcoursup ne répondent pas pour le moment. Réessaie dans un instant.';
      console.warn(e);
    });
  }

  $('#sim-found').addEventListener('click', function (e) {
    var b = e.target.closest('.sim-add');
    if (!b) return;
    var c = foundRows.filter(function (r) { return r.cod === b.dataset.cod; })[0];
    if (c && addVoeu(c)) { b.disabled = true; b.textContent = '✓ Ajouté'; }
  });

  function addVoeu(c) {
    var err = $('#sim-err-2');
    if (state.voeux.length >= CONFIG.maxVoeux) { err.textContent = 'Tu as déjà ' + CONFIG.maxVoeux + ' vœux : retires-en un pour en ajouter.'; return false; }
    if (state.voeux.some(function (v) { return v.cod === c.cod; })) return false;
    err.textContent = '';
    state.voeux.push({
      cod: c.cod, label: c.label, etab: c.etab, uai: c.uai, ville: c.ville, departement: c.departement,
      fili: c.fili, tf: c.tf, nmc: c.nmc, familyKey: c.family.key, fiche: c.fiche,
    });
    store('voeux', state.voeux);
    renderMine();
    return true;
  }

  function renderMine() {
    var box = $('#sim-mine');
    if (!state.voeux.length) { box.innerHTML = '<p class="sim-mine-empty">Aucun vœu pour l\'instant. Ajoute des formations depuis la recherche ci-dessous.</p>'; return; }
    box.innerHTML = '<p class="sim-label">Mes vœux (' + state.voeux.length + '/' + CONFIG.maxVoeux + ')</p><ol class="sim-mine-list">' +
      state.voeux.map(function (v, i) {
        return '<li><span><strong>' + esc(shortLabel(v.label)) + '</strong>' + esc(etabName(v.etab)) + '</span>' +
          '<button type="button" class="sim-remove" data-i="' + i + '" aria-label="Retirer ce vœu">✕</button></li>';
      }).join('') + '</ol>';
  }
  $('#sim-mine').addEventListener('click', function (e) {
    var b = e.target.closest('.sim-remove');
    if (!b) return;
    state.voeux.splice(+b.dataset.i, 1);
    store('voeux', state.voeux);
    renderMine(); search();
  });

  $('#sim-to-3').addEventListener('click', function () {
    if (!state.voeux.length) { $('#sim-err-2').textContent = 'Ajoute au moins un vœu.'; return; }
    track('Simulateur_Resultats', true);
    goStep(3);
    compute();
  });

  // ─── Étape 3 : calcul ───
  var computeSeq = 0;
  function compute() {
    var profil = profilForModel(), seq = ++computeSeq;
    var loading = $('#sim-loading');
    loading.textContent = 'Calcul en cours à partir des données Parcoursup…';
    loading.hidden = false;
    $('#sim-verdict').hidden = true;
    $('#sim-results').innerHTML = '';
    $('#sim-gate').hidden = true;
    $('#sim-suggest').hidden = true;

    API.statsFor(state.voeux.map(function (v) { return v.cod; })).then(function (byCod) {
      return Promise.all(state.voeux.map(function (v) {
        var rows = byCod[v.cod];
        if (rows && rows.length) return { v: v, rows: rows, estimated: null };
        // Nouvelle formation (ex. réforme santé 2027) : estimation par ses prédécesseurs
        return API.predecessorStats(Object.assign({}, v, { family: API.familyByKey(v.familyKey) })).then(function (p) {
          return { v: v, rows: p ? p.rows : [], estimated: p ? p.basis : 'none' };
        });
      }));
    }).then(function (items) {
      if (seq !== computeSeq) return;
      state.results = items.map(function (it) {
        var last = it.rows[0];
        var fam = it.estimated || !last
          ? (API.familyByKey(it.v.familyKey) || API.family(it.v))
          : API.family({ fili: last.fili, label: last.label, nmc: it.v.nmc, tf: it.v.tf });
        var agg = MODEL.aggregate(it.rows);
        if (!agg) return { v: it.v, fam: fam, none: true };
        var aca = it.estimated ? MODEL.academyOfDeptName(it.v.departement) || last.aca : last.aca;
        return { v: it.v, fam: fam, agg: agg, r: MODEL.evaluate(profil, agg, { family: fam, aca: aca }), estimated: it.estimated };
      });
      loading.hidden = true;
      renderResults();
      loadSuggestions();
    }).catch(function (e) {
      console.warn(e);
      loading.textContent = 'Les données Parcoursup ne répondent pas pour le moment. Réessaie dans un instant.';
    });
  }

  function gauge(prob, cls) {
    var pct = Math.round(prob * 100);
    return '<div class="sim-gauge ' + (cls || '') + '" style="--p:' + pct + '"><span>' + pct + '<small>%</small></span></div>';
  }

  function cardHtml(x, locked) {
    var v = x.v;
    if (x.none) {
      return '<li class="sim-card lv-none"><div class="sim-card-main"><div class="sim-gauge" style="--p:0"><span>?</span></div><div class="sim-card-txt">' +
        '<span class="sim-badge">Pas assez de données</span><h3>' + esc(etabName(v.etab)) + '</h3><p class="sim-card-sub">' + esc(shortLabel(v.label)) + '</p>' +
        '<p class="sim-card-loc">Aucune statistique publiée pour cette formation ni pour une formation équivalente.</p></div></div></li>';
    }
    var lv = MODEL.level(x.r.prob);
    var names = ['Sans mention', 'Assez bien', 'Bien', 'Très bien', 'TB félicitations'];
    var bar = x.agg.shares.map(function (s, k) {
      return '<span class="sim-mbar-seg m' + k + '" style="width:' + (s * 100) + '%" title="' + names[k] + ' : ' + Math.round(s * 100) + ' %"></span>';
    }).join('');
    var hist = x.agg.history.map(function (h) {
      return '<tr><td>' + h.session + '</td><td>' + fmt(h.capa) + '</td><td>' + fmt(h.cla) + '</td><td>' + fmt(h.ran) + '</td></tr>';
    }).join('');
    var preds = (x.fam.predecessors || []).map(function (f) { return f === 'Licence_Las' ? 'L.AS' : f; }).join(' et ');
    var estim = x.estimated
      ? '<p class="sim-estimated">Nouvelle formation : pas encore de résultats publiés. Estimation à partir des ' + esc(preds) + (x.estimated === 'etab' ? ' du même établissement' : ' du même département') + '.</p>'
      : '';
    return '<li class="sim-card lv-' + lv.key + (locked ? ' is-locked' : '') + '"' + (locked ? ' aria-hidden="true"' : '') + '>' +
      '<div class="sim-card-main">' + gauge(x.r.prob) +
        '<div class="sim-card-txt">' +
          '<span class="sim-badge">' + lv.label + '</span>' + (x.estimated ? ' <span class="sim-badge sim-badge-ghost">Estimation</span>' : '') +
          '<h3>' + esc(etabName(v.etab)) + '</h3>' +
          '<p class="sim-card-sub">' + esc(shortLabel(v.label)) + '</p>' +
          '<p class="sim-card-loc">' + esc(v.ville) + (x.fam.sector ? ' · ' + (x.r.inZone ? 'dans ton secteur' : 'hors secteur') : '') + '</p>' +
        '</div></div>' +
      (locked ? '' :
      '<details class="sim-details">' +
        '<summary>Pourquoi ce score ?</summary>' + estim +
        '<ul class="sim-factors">' + x.r.factors.map(function (f) { return '<li class="' + f.k + '">' + esc(f.txt) + '</li>'; }).join('') + '</ul>' +
        '<div class="sim-hist-wrap"><table class="sim-hist"><thead><tr><th>Session</th><th>Places</th><th>Classés</th><th>Rang du dernier appelé</th></tr></thead><tbody>' + hist + '</tbody></table></div>' +
        '<p class="sim-mlabel">Mentions au bac des admis</p><div class="sim-mbar">' + bar + '</div>' +
        (v.fiche ? '<a class="sim-psup" href="' + esc(v.fiche) + '" target="_blank" rel="noopener">Fiche Parcoursup officielle ↗</a>' : '') +
      '</details>') +
      '</li>';
  }

  function renderResults() {
    var res = state.results.slice().sort(function (a, b) { return (b.r ? b.r.prob : -1) - (a.r ? a.r.prob : -1); });
    var probs = res.filter(function (x) { return x.r; }).map(function (x) { return x.r.prob; });
    var pct = Math.round(MODEL.atLeastOne(probs) * 100);
    var gg = $('#sim-global-gauge');
    gg.style.setProperty('--p', pct);
    gg.innerHTML = '<span>' + pct + '<small>%</small></span>';
    var safe = probs.filter(function (p) { return p >= 0.75; }).length;
    var msg;
    if (pct >= 90 && safe >= 1) msg = ['Ta liste de vœux est solide', 'Au moins un de tes vœux est très probable. Tu peux te permettre quelques choix ambitieux en plus.'];
    else if (pct >= 60) msg = ['C\'est jouable, sécurise ta liste', 'Ajoute un ou deux vœux où tes chances sont élevées pour ne pas rester sans proposition.'];
    else msg = ['Ta liste manque de vœux de sécurité', 'Tes vœux sont sélectifs pour ton profil. Ajoute des formations plus accessibles, ou fais-toi aider pour construire ta stratégie.'];
    $('#sim-verdict-title').textContent = msg[0];
    $('#sim-verdict-text').textContent = msg[1];
    $('#sim-verdict').hidden = false;

    $('#sim-results').innerHTML = res.map(function (x, i) { return cardHtml(x, !state.unlocked && i >= FREE_RESULTS); }).join('');
    var hidden = res.length - FREE_RESULTS;
    $('#sim-gate').hidden = state.unlocked;
    $('#sim-gate-title').textContent = hidden > 0
      ? 'Débloque le détail de ' + (hidden > 1 ? 'tes ' + hidden + ' autres vœux' : 'ton dernier vœu') + ' et tes vœux de sécurité'
      : 'Débloque tes vœux de sécurité';
  }

  // Vœux de sécurité : même famille, dans le secteur, chances élevées
  function loadSuggestions() {
    var profil = profilForModel();
    var fams = state.results.map(function (x) { return x.fam && x.fam.key; })
      .filter(function (k, i, a) { return k && k !== 'autre' && a.indexOf(k) === i; }).slice(0, 3);
    state.suggestions = [];
    if (!fams.length || !profil.aca) { renderSuggestions(); return; }
    var chosen = state.voeux.map(function (v) { return v.cod; });
    Promise.all(fams.map(function (k) { return API.statsInZone(k, MODEL.academiesOfSector(profil.aca), 100); })).then(function (lists) {
      var cands = [];
      lists.forEach(function (rows, i) {
        var fam = API.familyByKey(fams[i]);
        rows.forEach(function (row) {
          if (chosen.indexOf(row.cod) >= 0) return;
          var agg = MODEL.aggregate([row]);
          if (!agg) return;
          var r = MODEL.evaluate(profil, agg, { family: fam, aca: row.aca });
          if (r.prob >= 0.75) cands.push({ row: row, r: r, fam: fam });
        });
      });
      cands.sort(function (a, b) { return b.r.prob - a.r.prob || (b.row.capa || 0) - (a.row.capa || 0); });
      state.suggestions = cands.slice(0, 6);
      // Libellés exacts (options PASS, etc.) depuis le catalogue de l'année
      return API.catalogFor(state.suggestions.map(function (x) { return x.row.cod; })).then(function (cat) {
        state.suggestions.forEach(function (x) { x.cat = cat[x.row.cod] || null; });
        renderSuggestions();
      });
    }).catch(function (e) { console.warn(e); });
  }

  function renderSuggestions() {
    var s = state.suggestions || [];
    $('#sim-suggest').hidden = !state.unlocked || !s.length;
    var full = state.voeux.length >= CONFIG.maxVoeux;
    $('#sim-suggest-list').innerHTML = s.map(function (x) {
      var row = x.row;
      return '<li class="sim-found-item">' + gauge(x.r.prob, 'sim-gauge-sm') +
        '<div><strong>' + esc(shortLabel(x.cat ? x.cat.label : (row.formation || row.label) + (row.detail ? ' · ' + row.detail : ''))) + '</strong><span>' + esc((row.etab || '').split(' - ')[0]) + ' · ' + esc(row.ville) + '</span></div>' +
        '<button type="button" class="sim-add" data-cod="' + esc(row.cod) + '"' + (full ? ' disabled title="Tu as déjà ' + CONFIG.maxVoeux + ' vœux"' : '') + '>+ Ajouter</button></li>';
    }).join('');
  }
  $('#sim-suggest-list').addEventListener('click', function (e) {
    var b = e.target.closest('.sim-add');
    if (!b) return;
    var x = state.suggestions.filter(function (s) { return s.row.cod === b.dataset.cod; })[0];
    if (!x) return;
    var row = x.row;
    if (x.cat) { if (addVoeu(x.cat)) compute(); return; }
    var dep = CONFIG.departements.filter(function (d) { return d[0] === row.dep; })[0];
    var ok = addVoeu({
      cod: row.cod, label: (row.formation || row.label) + (row.detail ? ' - ' + row.detail : ''), etab: row.etab || '', uai: row.uai, ville: row.ville || '',
      departement: dep ? dep[1] : '', fili: row.fili, tf: [], nmc: '', family: x.fam, fiche: row.lien,
    });
    if (ok) compute();
  });

  // ─── Formulaire ───
  var form = $('#sim-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('#sim-form-err'), btn = $('button[type=submit]', form), fd = new FormData(form);
    var probs = state.results.filter(function (x) { return x.r; }).map(function (x) { return x.r.prob; });
    var payload = {
      prenom: (fd.get('prenom') || '').trim(),
      nom: (fd.get('nom') || '').trim(),
      email: (fd.get('email') || '').trim(),
      telephone: (fd.get('telephone') || '').trim(),
      classe_actuelle: state.profil.classe,
      departement: state.profil.dept,
      utm: utm(),
      profil: Object.assign({ aca: MODEL.academyOfDept(state.profil.dept) }, state.profil),
      proba_globale: Math.round(MODEL.atLeastOne(probs) * 100),
      top: state.results.map(function (x) {
        var v = x.v;
        return {
          formation: (v.fili || 'Formation') + ' - ' + etabName(v.etab) + ' (' + v.ville + ')',
          option: shortLabel(v.label),
          cod: v.cod,
          fili: v.fili,
          probabilite: x.r ? Math.round(x.r.prob * 100) : null,
          rang_dernier_appele: x.agg ? x.agg.ran : null,
          estimation: !!x.estimated,
        };
      }),
    };
    if (!payload.prenom || !payload.nom) { err.textContent = 'Indique ton prénom et ton nom.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) { err.textContent = 'Adresse email invalide.'; return; }
    if (payload.telephone.replace(/\D/g, '').length < 9) { err.textContent = 'Numéro de téléphone invalide.'; return; }
    err.textContent = '';
    btn.disabled = true; btn.textContent = 'Envoi…';
    fetch('/api/save-simulation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); })
      .catch(function (e2) { console.warn('save-simulation', e2); }) // on débloque quand même : l'élève ne doit pas être pénalisé
      .then(function () {
        track('Lead');
        state.unlocked = true; store('unlocked', true);
        btn.disabled = false; btn.textContent = 'Voir mon analyse complète';
        renderResults(); renderSuggestions();
        $('#sim-thanks').hidden = false;
      });
  });
  function utm() {
    var q = new URLSearchParams(location.search);
    return { source: q.get('utm_source'), medium: q.get('utm_medium'), campaign: q.get('utm_campaign') };
  }

  $('#sim-restart').addEventListener('click', function () { goStep(1); });

  // ─── Démarrage ───
  (function init() {
    var p = load('profil');
    if (p) Object.keys(state.profil).forEach(function (k) { if (p[k] != null) state.profil[k] = p[k]; });
    state.voeux = load('voeux') || [];
    state.unlocked = !!load('unlocked');
    $$('.sim-max').forEach(function (el) { el.textContent = CONFIG.maxVoeux; });
    syncProfil(); syncFinder(); renderMine();

    API.meta().then(function (m) {
      $$('.sim-session').forEach(function (el) { el.textContent = m.latestSession; });
      $$('.sim-catalog-year').forEach(function (el) { el.textContent = m.catalogYear; });
    }).catch(function (e) { console.warn(e); });

    var step = { '#mes-voeux': 2, '#mes-chances': 3 }[location.hash];
    if (step && state.profil.dept) {
      $('#sim-sector-label').textContent = sectorLabel();
      if (step === 3 && state.voeux.length) { goStep(3); compute(); return; }
      goStep(2); search(); return;
    }
    goStep(1);
  })();
})();
