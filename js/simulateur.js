/**
 * Simulateur Parcoursup santé (PASS / L.AS) — AFEM
 *
 * Données : window.SIMU_DATA (js/simulateur-data.js, généré depuis l'open data
 * Parcoursup). Tout le calcul est fait dans le navigateur, sans compte.
 *
 * Modèle (estimation, pas une garantie) :
 *   - Les mentions au bac des admis (lissées vers la moyenne de la filière pour
 *     les petites formations) donnent la distribution de leurs notes.
 *   - La barre T = quantile BAR_QUANTILE de cette distribution : les admis qui
 *     acceptent sont surtout près du bas de la liste d'appel (les meilleurs
 *     partent ailleurs), le bas de leur distribution approche le dernier appelé.
 *     +SELECTIVE_BUMP si le taux d'accès (rang dernier appelé / classés) < 10 %.
 *   - Score élève S = moyenne pondérée générale/spécialités + ajustements
 *     (doublette, option maths, secteur géographique).
 *   - P(admission) = Phi((S - T) / NOISE), bornée à [2 %, 95 %].
 */
(function () {
  'use strict';

  var DATA = window.SIMU_DATA || [];
  var SESSION = window.SIMU_SESSION || 2025;

  // Index des colonnes de SIMU_DATA
  var C = { cod: 0, type: 1, univ: 2, ville: 3, option: 4, aca: 5, capa: 6, cla: 7, ran: 8, tx: 9, mentions: 10, pctAca: 11, pctBrs: 12 };

  var BAR_QUANTILE = 0.3;  // calibré sur PASS Bordeaux / IDF / Clermont et L.AS Lyon
  var SELECTIVE_BUMP = 0.4;
  var NOISE = 1.2;         // incertitude (dossier qualitatif, variation d'une année à l'autre)
  var MENTION_MID = [11, 13, 15, 17, 18.8];
  var MENTION_EDGES = [10, 12, 14, 16, 18, 20];
  var PRIOR_WEIGHT = 12; // lissage des petites formations vers la moyenne de la filière
  var FREE_RESULTS = 5;  // nombre de résultats visibles avant le formulaire

  var IDF = ['Paris', 'Créteil', 'Versailles'];

  // Département → académie (libellés identiques à l'open data Parcoursup)
  var DEPTS = [
    ['01', 'Ain', 'Lyon'], ['02', 'Aisne', 'Amiens'], ['03', 'Allier', 'Clermont-Ferrand'], ['04', 'Alpes-de-Haute-Provence', 'Aix-Marseille'],
    ['05', 'Hautes-Alpes', 'Aix-Marseille'], ['06', 'Alpes-Maritimes', 'Nice'], ['07', 'Ardèche', 'Grenoble'], ['08', 'Ardennes', 'Reims'],
    ['09', 'Ariège', 'Toulouse'], ['10', 'Aube', 'Reims'], ['11', 'Aude', 'Montpellier'], ['12', 'Aveyron', 'Toulouse'],
    ['13', 'Bouches-du-Rhône', 'Aix-Marseille'], ['14', 'Calvados', 'Normandie'], ['15', 'Cantal', 'Clermont-Ferrand'], ['16', 'Charente', 'Poitiers'],
    ['17', 'Charente-Maritime', 'Poitiers'], ['18', 'Cher', 'Orléans-Tours'], ['19', 'Corrèze', 'Limoges'], ['2A', 'Corse-du-Sud', 'Corse'],
    ['2B', 'Haute-Corse', 'Corse'], ['21', "Côte-d'Or", 'Dijon'], ['22', "Côtes-d'Armor", 'Rennes'], ['23', 'Creuse', 'Limoges'],
    ['24', 'Dordogne', 'Bordeaux'], ['25', 'Doubs', 'Besancon'], ['26', 'Drôme', 'Grenoble'], ['27', 'Eure', 'Normandie'],
    ['28', 'Eure-et-Loir', 'Orléans-Tours'], ['29', 'Finistère', 'Rennes'], ['30', 'Gard', 'Montpellier'], ['31', 'Haute-Garonne', 'Toulouse'],
    ['32', 'Gers', 'Toulouse'], ['33', 'Gironde', 'Bordeaux'], ['34', 'Hérault', 'Montpellier'], ['35', 'Ille-et-Vilaine', 'Rennes'],
    ['36', 'Indre', 'Orléans-Tours'], ['37', 'Indre-et-Loire', 'Orléans-Tours'], ['38', 'Isère', 'Grenoble'], ['39', 'Jura', 'Besancon'],
    ['40', 'Landes', 'Bordeaux'], ['41', 'Loir-et-Cher', 'Orléans-Tours'], ['42', 'Loire', 'Lyon'], ['43', 'Haute-Loire', 'Clermont-Ferrand'],
    ['44', 'Loire-Atlantique', 'Nantes'], ['45', 'Loiret', 'Orléans-Tours'], ['46', 'Lot', 'Toulouse'], ['47', 'Lot-et-Garonne', 'Bordeaux'],
    ['48', 'Lozère', 'Montpellier'], ['49', 'Maine-et-Loire', 'Nantes'], ['50', 'Manche', 'Normandie'], ['51', 'Marne', 'Reims'],
    ['52', 'Haute-Marne', 'Reims'], ['53', 'Mayenne', 'Nantes'], ['54', 'Meurthe-et-Moselle', 'Nancy-Metz'], ['55', 'Meuse', 'Nancy-Metz'],
    ['56', 'Morbihan', 'Rennes'], ['57', 'Moselle', 'Nancy-Metz'], ['58', 'Nièvre', 'Dijon'], ['59', 'Nord', 'Lille'],
    ['60', 'Oise', 'Amiens'], ['61', 'Orne', 'Normandie'], ['62', 'Pas-de-Calais', 'Lille'], ['63', 'Puy-de-Dôme', 'Clermont-Ferrand'],
    ['64', 'Pyrénées-Atlantiques', 'Bordeaux'], ['65', 'Hautes-Pyrénées', 'Toulouse'], ['66', 'Pyrénées-Orientales', 'Montpellier'], ['67', 'Bas-Rhin', 'Strasbourg'],
    ['68', 'Haut-Rhin', 'Strasbourg'], ['69', 'Rhône', 'Lyon'], ['70', 'Haute-Saône', 'Besancon'], ['71', 'Saône-et-Loire', 'Dijon'],
    ['72', 'Sarthe', 'Nantes'], ['73', 'Savoie', 'Grenoble'], ['74', 'Haute-Savoie', 'Grenoble'], ['75', 'Paris', 'Paris'],
    ['76', 'Seine-Maritime', 'Normandie'], ['77', 'Seine-et-Marne', 'Créteil'], ['78', 'Yvelines', 'Versailles'], ['79', 'Deux-Sèvres', 'Poitiers'],
    ['80', 'Somme', 'Amiens'], ['81', 'Tarn', 'Toulouse'], ['82', 'Tarn-et-Garonne', 'Toulouse'], ['83', 'Var', 'Nice'],
    ['84', 'Vaucluse', 'Aix-Marseille'], ['85', 'Vendée', 'Nantes'], ['86', 'Vienne', 'Poitiers'], ['87', 'Haute-Vienne', 'Limoges'],
    ['88', 'Vosges', 'Nancy-Metz'], ['89', 'Yonne', 'Dijon'], ['90', 'Territoire de Belfort', 'Besancon'], ['91', 'Essonne', 'Versailles'],
    ['92', 'Hauts-de-Seine', 'Versailles'], ['93', 'Seine-Saint-Denis', 'Créteil'], ['94', 'Val-de-Marne', 'Créteil'], ['95', "Val-d'Oise", 'Versailles'],
    ['971', 'Guadeloupe', 'Guadeloupe'], ['972', 'Martinique', 'Martinique'], ['973', 'Guyane', 'Guyane'], ['974', 'La Réunion', 'La Réunion'],
    ['976', 'Mayotte', 'Mayotte'], ['987', 'Polynésie française', 'Polynésie Française'], ['etranger', 'Étranger / AEFE', '']
  ];
  var DEPT_ACA = {};
  DEPTS.forEach(function (d) { DEPT_ACA[d[0]] = d[2]; });

  var SCIENCE_RE = /chimie|physique|math|vie|santé|sante|biolog|informatique|terre|svt|mpc|ingénieur|pluridisciplinaire/i;

  // ─── Petits outils stat ───
  function Phi(x) { // CDF normale (Abramowitz-Stegun 7.1.26)
    var t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x / 2);
    return x >= 0 ? (1 + y) / 2 : (1 - y) / 2;
  }
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function zoneOf(aca) { return IDF.indexOf(aca) >= 0 ? 'IDF' : aca; }

  // Répartition moyenne des mentions par filière (prior de lissage)
  var PRIOR = {};
  ['PASS', 'LAS'].forEach(function (type) {
    var acc = [0, 0, 0, 0, 0];
    DATA.forEach(function (f) {
      if (f[C.type] !== type) return;
      for (var i = 0; i < 5; i++) acc[i] += f[C.mentions][i] * f[C.capa];
    });
    var s = acc.reduce(function (a, b) { return a + b; }, 0) || 1;
    PRIOR[type] = acc.map(function (v) { return v / s; });
  });

  // Parts lissées des mentions des admis [sans, AB, B, TB, TBF]
  function mentionShares(f) {
    var m = f[C.mentions];
    var sum = m.reduce(function (a, b) { return a + b; }, 0);
    var n = f[C.capa] || 0;
    var prior = PRIOR[f[C.type]];
    var w = m.map(function (v, i) { return n * (sum > 0 ? v / sum : prior[i]) + PRIOR_WEIGHT * prior[i]; });
    var W = w.reduce(function (a, b) { return a + b; }, 0);
    return w.map(function (v) { return v / W; });
  }
  function admittedMean(sh) {
    return sh.reduce(function (acc, v, i) { return acc + v * MENTION_MID[i]; }, 0);
  }
  function admittedQuantile(sh, q) { // notes supposées uniformes dans chaque tranche de mention
    var c = 0;
    for (var i = 0; i < 5; i++) {
      if (c + sh[i] >= q) return MENTION_EDGES[i] + (q - c) / sh[i] * 2;
      c += sh[i];
    }
    return 20;
  }

  // ─── Score d'une formation pour un profil ───
  function evaluate(f, p) {
    var t = clamp(f[C.ran] / f[C.cla], 0.02, 0.98);
    var sh = mentionShares(f);
    var A = admittedMean(sh);
    var T = admittedQuantile(sh, BAR_QUANTILE) + (t < 0.1 ? SELECTIVE_BUMP : 0);

    var factors = [];
    var base = 0.45 * p.gen + 0.55 * p.spe;
    var S = base;

    // Spécialités : pèsent pour le PASS et les L.AS scientifiques
    var scientific = f[C.type] === 'PASS' || SCIENCE_RE.test(f[C.option]);
    if (scientific) {
      var dAdj = { 'svt-pc': 0.3, 'maths-pc': 0.2, 'maths-svt': 0.2, 'sci-autre': -0.1, 'non-sci': -0.6 }[p.doublette] || 0;
      var mAdj = { expertes: 0.2, complementaires: 0.05, aucune: 0 }[p.maths] || 0;
      S += dAdj + mAdj;
      if (dAdj >= 0.2) factors.push({ k: 'plus', txt: 'Ta doublette de spécialités est la plus fréquente chez les admis.' });
      if (dAdj < 0) factors.push({ k: 'minus', txt: 'Ta doublette est peu représentée chez les admis de cette formation.' });
    }
    if (p.spe - p.gen >= 1) factors.push({ k: 'plus', txt: 'Tes notes de spécialités tirent ton dossier vers le haut.' });
    if (p.gen - p.spe >= 1) factors.push({ k: 'minus', txt: 'Tes notes de spécialités sont en retrait par rapport au reste.' });

    // Secteur géographique (PASS/L.AS donnent la priorité à l'académie)
    var pctAca = f[C.pctAca] == null ? 80 : f[C.pctAca];
    var inZone = p.aca && zoneOf(p.aca) === zoneOf(f[C.aca]);
    // Hors secteur : les places restantes sont rares et disputées. On retire un
    // peu de score et on plafonne par la part des admis venus d'ailleurs.
    var outCap = 1;
    if (!inZone) {
      S -= pctAca >= 70 ? 0.5 : 0.2;
      outCap = clamp((100 - pctAca) / 30, 0.05, 1);
      if (pctAca >= 70) factors.push({ k: 'minus', txt: pctAca + ' % des admis viennent de l\'académie : tu candidates hors secteur.' });
    } else if (pctAca >= 70) {
      factors.push({ k: 'plus', txt: 'Tu es dans le secteur : ' + pctAca + ' % des admis viennent de ton académie.' });
    }

    var gap = base - A;
    if (gap >= 0.5) factors.unshift({ k: 'plus', txt: 'Tes notes sont au-dessus du niveau moyen des admis (≈ ' + A.toFixed(1) + '/20).' });
    else if (gap <= -0.5) factors.unshift({ k: 'minus', txt: 'Tes notes sont en dessous du niveau moyen des admis (≈ ' + A.toFixed(1) + '/20).' });
    else factors.unshift({ k: 'neutral', txt: 'Tes notes sont proches du niveau moyen des admis (≈ ' + A.toFixed(1) + '/20).' });

    var prob = Phi((S - T) / NOISE) * outCap;
    if (t >= 0.95 && inZone) prob = Math.max(prob, 0.9);
    prob = clamp(prob, 0.02, 0.95);

    return { f: f, prob: prob, t: t, A: A, inZone: inZone, factors: factors };
  }

  function level(prob) {
    if (prob >= 0.75) return { key: 'top', label: 'Très probable' };
    if (prob >= 0.5) return { key: 'good', label: 'Probable' };
    if (prob >= 0.25) return { key: 'mid', label: 'Possible' };
    if (prob >= 0.1) return { key: 'low', label: 'Ambitieux' };
    return { key: 'hard', label: 'Très difficile' };
  }

  // ─── État ───
  var state = {
    profil: { classe: 'terminale', gen: 14, spe: 14, doublette: 'svt-pc', maths: 'complementaires', dept: '', aca: '', boursier: 'non' },
    filtres: { type: 'all', zone: 'secteur', q: '' },
    results: [],
    unlocked: false,
  };

  function store(k, v) { try { localStorage.setItem('afem-simu-' + k, JSON.stringify(v)); } catch (e) { /* stockage indisponible */ } }
  function load(k) { try { return JSON.parse(localStorage.getItem('afem-simu-' + k)); } catch (e) { return null; } }

  // ─── DOM ───
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function fmt(n) { return n == null ? '–' : Number(n).toLocaleString('fr-FR'); }
  function track(ev, custom) {
    if (!window.fbq) return;
    try { custom ? window.fbq('trackCustom', ev) : window.fbq('track', ev); } catch (e) { /* pixel bloqué */ }
  }

  var root = $('#simu');
  if (!root || !DATA.length) return;

  function goStep(n) {
    $$('.sim-step', root).forEach(function (el) { el.hidden = +el.dataset.step !== n; });
    $$('.sim-progress li', root).forEach(function (li) {
      var s = +li.dataset.step;
      li.classList.toggle('is-active', s === n);
      li.classList.toggle('is-done', s < n);
    });
    var hash = ['', '#mon-profil', '#mes-criteres', '#mes-resultats'][n];
    if (location.hash !== hash) history.replaceState(null, '', hash);
    var top = root.getBoundingClientRect().top + window.scrollY - 90;
    if (window.scrollY > top) window.scrollTo({ top: top, behavior: 'smooth' });
  }

  // Remplissage des départements
  var deptSel = $('#sim-dept');
  DEPTS.forEach(function (d) {
    var o = document.createElement('option');
    o.value = d[0];
    o.textContent = d[0] === 'etranger' ? d[1] : d[0] + ' — ' + d[1];
    deptSel.appendChild(o);
  });

  // Choix boutons (segmented controls)
  $$('.sim-choices', root).forEach(function (group) {
    group.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-value]');
      if (!btn) return;
      $$('button', group).forEach(function (b) { b.setAttribute('aria-pressed', b === btn ? 'true' : 'false'); });
      var name = group.dataset.name;
      if (group.dataset.scope === 'filtres') state.filtres[name] = btn.dataset.value;
      else state.profil[name] = btn.dataset.value;
      if (group.dataset.scope === 'filtres' && !$('[data-step="3"]', root).hidden) renderResults();
    });
  });
  function syncChoices() {
    $$('.sim-choices', root).forEach(function (group) {
      var src = group.dataset.scope === 'filtres' ? state.filtres : state.profil;
      $$('button', group).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.value === src[group.dataset.name] ? 'true' : 'false'); });
    });
  }

  // Curseurs de notes
  $$('.sim-grade', root).forEach(function (wrap) {
    var range = $('input[type=range]', wrap);
    var num = $('input[type=number]', wrap);
    var name = wrap.dataset.name;
    function set(v, from) {
      v = clamp(Math.round(parseFloat(v) * 10) / 10 || 0, 0, 20);
      state.profil[name] = v;
      if (from !== range) range.value = v;
      if (from !== num) num.value = v.toFixed(1);
      wrap.style.setProperty('--fill', (v / 20 * 100) + '%');
    }
    range.addEventListener('input', function () { set(range.value, range); });
    num.addEventListener('change', function () { set(num.value, num); });
    wrap._set = set;
  });

  function hydrate() {
    var saved = load('profil');
    if (saved) Object.keys(state.profil).forEach(function (k) { if (saved[k] != null) state.profil[k] = saved[k]; });
    var savedF = load('filtres');
    if (savedF) Object.keys(state.filtres).forEach(function (k) { if (savedF[k] != null && k !== 'q') state.filtres[k] = savedF[k]; });
    state.unlocked = !!load('unlocked');
    $$('.sim-grade', root).forEach(function (w) { w._set(state.profil[w.dataset.name]); });
    deptSel.value = state.profil.dept || '';
    $('#sim-classe').value = state.profil.classe;
    syncChoices();
  }

  // Étape 1 → 2
  $('#sim-to-2').addEventListener('click', function () {
    state.profil.dept = deptSel.value;
    state.profil.classe = $('#sim-classe').value;
    var err = $('#sim-err-1');
    if (!state.profil.dept) { err.textContent = 'Indique ton département : la priorité géographique change beaucoup les chances en PASS et L.AS.'; deptSel.focus(); return; }
    err.textContent = '';
    state.profil.aca = DEPT_ACA[state.profil.dept] || '';
    store('profil', state.profil);
    $('#sim-aca-label').textContent = state.profil.aca
      ? (zoneOf(state.profil.aca) === 'IDF' ? 'Île-de-France (Paris, Créteil, Versailles)' : 'académie de ' + state.profil.aca)
      : 'hors France';
    track('Simulateur_Profil', true);
    goStep(2);
  });

  // Étape 2 → 3
  $('#sim-to-3').addEventListener('click', function () {
    store('filtres', state.filtres);
    compute();
    renderResults();
    track('Simulateur_Resultats', true);
    goStep(3);
  });

  $$('[data-back]', root).forEach(function (b) { b.addEventListener('click', function () { goStep(+b.dataset.back); }); });

  $('#sim-search').addEventListener('input', function (e) { state.filtres.q = e.target.value; renderResults(); });

  function compute() {
    var p = state.profil;
    state.results = DATA.map(function (f) { return evaluate(f, p); })
      .sort(function (a, b) { return b.prob - a.prob || b.f[C.capa] - a.f[C.capa]; });
  }

  function norm(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); }

  function filtered() {
    var fl = state.filtres;
    var myZone = state.profil.aca ? zoneOf(state.profil.aca) : null;
    var q = norm(fl.q).trim();
    return state.results.filter(function (r) {
      var f = r.f;
      if (fl.type !== 'all' && f[C.type] !== fl.type) return false;
      if (fl.zone === 'secteur' && myZone && zoneOf(f[C.aca]) !== myZone) return false;
      if (q && norm(f[C.univ] + ' ' + f[C.ville] + ' ' + f[C.option] + ' ' + f[C.aca]).indexOf(q) < 0) return false;
      return true;
    });
  }

  function cardHtml(r, i, locked) {
    var f = r.f, lv = level(r.prob), pct = Math.round(r.prob * 100);
    var m = f[C.mentions], ms = m.reduce(function (a, b) { return a + b; }, 0) || 1;
    var mentionNames = ['Sans mention', 'Assez bien', 'Bien', 'Très bien', 'TB félicitations'];
    var bar = m.map(function (v, k) {
      return v ? '<span class="sim-mbar-seg m' + k + '" style="width:' + (v / ms * 100) + '%" title="' + mentionNames[k] + ' : ' + v + ' %"></span>' : '';
    }).join('');
    var title = f[C.type] === 'PASS' ? 'PASS' + (f[C.option] ? ' · option ' + esc(f[C.option]) : '') : 'L.AS · ' + esc(f[C.option] || 'Licence');
    return '' +
      '<li class="sim-card lv-' + lv.key + (locked ? ' is-locked' : '') + '"' + (locked ? ' aria-hidden="true"' : '') + '>' +
        '<div class="sim-card-main">' +
          '<div class="sim-gauge" style="--p:' + pct + '"><span>' + pct + '<small>%</small></span></div>' +
          '<div class="sim-card-txt">' +
            '<span class="sim-badge">' + lv.label + '</span>' +
            '<h3>' + esc(f[C.univ]) + '</h3>' +
            '<p class="sim-card-sub">' + title + '</p>' +
            '<p class="sim-card-loc">' + esc(f[C.ville]) + ' · ' + (r.inZone ? 'dans ton secteur' : 'hors secteur') + '</p>' +
          '</div>' +
        '</div>' +
        (locked ? '' :
        '<details class="sim-details">' +
          '<summary>Pourquoi ce score ?</summary>' +
          '<ul class="sim-factors">' + r.factors.map(function (x) { return '<li class="' + x.k + '">' + esc(x.txt) + '</li>'; }).join('') + '</ul>' +
          '<dl class="sim-stats">' +
            '<div><dt>Places</dt><dd>' + fmt(f[C.capa]) + '</dd></div>' +
            '<div><dt>Candidats classés</dt><dd>' + fmt(f[C.cla]) + '</dd></div>' +
            '<div><dt>Rang du dernier appelé</dt><dd>' + fmt(f[C.ran]) + '</dd></div>' +
            '<div><dt>Taux d\'accès</dt><dd>' + fmt(f[C.tx]) + ' %</dd></div>' +
          '</dl>' +
          '<p class="sim-mlabel">Mentions au bac des admis ' + SESSION + '</p>' +
          '<div class="sim-mbar">' + bar + '</div>' +
          '<a class="sim-psup" href="https://dossierappel.parcoursup.fr/Candidats/public/fiches/afficherFicheFormation?g_ta_cod=' + encodeURIComponent(f[C.cod]) + '" target="_blank" rel="noopener">Fiche Parcoursup officielle ↗</a>' +
        '</details>') +
      '</li>';
  }

  function renderResults() {
    var list = filtered();
    var box = $('#sim-results');
    var counts = { top: 0, good: 0, mid: 0, low: 0, hard: 0 };
    list.forEach(function (r) { counts[level(r.prob).key]++; });

    function pl(n, word) { return n + ' ' + word + (n > 1 ? 's' : ''); }
    $('#sim-summary').innerHTML = list.length
      ? '<strong>' + list.length + '</strong> ' + pl(list.length, 'formation').replace(/^\d+ /, '') + ' analysée' + (list.length > 1 ? 's' : '') +
        ' · <span class="c-top">' + pl(counts.top + counts.good, 'probable') + '</span> · <span class="c-mid">' + pl(counts.mid, 'possible') + '</span> · <span class="c-low">' + pl(counts.low + counts.hard, 'ambitieuse') + '</span>'
      : 'Aucune formation ne correspond. Élargis la zone ou change ta recherche.';

    var visible = state.unlocked ? list : list.slice(0, FREE_RESULTS);
    var html = visible.map(function (r, i) { return cardHtml(r, i, false); }).join('');
    if (!state.unlocked && list.length > FREE_RESULTS) {
      html += list.slice(FREE_RESULTS, FREE_RESULTS + 2).map(function (r, i) { return cardHtml(r, i, true); }).join('');
    }
    box.innerHTML = html;

    var gate = $('#sim-gate');
    var hidden = list.length - FREE_RESULTS;
    gate.hidden = state.unlocked || hidden <= 0;
    if (!gate.hidden) $('#sim-gate-count').textContent = hidden;

    renderVerdict(list);
  }

  function renderVerdict(list) {
    var best = list.filter(function (r) { return r.prob >= 0.5; }).length;
    var ratio = list.length ? best / list.length : 0;
    var el = $('#sim-verdict');
    var msg;
    if (!list.length) { el.hidden = true; return; }
    el.hidden = false;
    if (best >= 3 && ratio >= 0.5) msg = ['Ton profil est solide', 'Tu as de bonnes chances sur plusieurs formations. L\'enjeu se déplace : choisir la bonne fac et préparer ta première année, où seul un étudiant sur trois passe en médecine, maïeutique, odontologie, pharmacie ou kiné.'];
    else if (best >= 1) msg = ['C\'est jouable, avec une stratégie', 'Quelques formations sont à ta portée. Bien répartir tes vœux entre PASS et L.AS peut faire la différence.'];
    else msg = ['Ça se joue sur la stratégie', 'Les formations de ta zone sont sélectives pour ton profil. Les L.AS, les options moins demandées et une candidature bien construite peuvent changer la donne.'];
    $('#sim-verdict-title').textContent = msg[0];
    $('#sim-verdict-text').textContent = msg[1];
  }

  // ─── Formulaire (débloque le classement complet) ───
  var form = $('#sim-form');
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var err = $('#sim-form-err');
    var btn = $('button[type=submit]', form);
    var fd = new FormData(form);
    var payload = {
      prenom: (fd.get('prenom') || '').trim(),
      nom: (fd.get('nom') || '').trim(),
      email: (fd.get('email') || '').trim(),
      telephone: (fd.get('telephone') || '').trim(),
      classe_actuelle: state.profil.classe,
      departement: state.profil.dept,
      utm: utm(),
      profil: state.profil,
      filtres: { type: state.filtres.type, zone: state.filtres.zone },
      top: filtered().slice(0, 10).map(function (r) {
        var f = r.f;
        return {
          formation: (f[C.type] === 'PASS' ? 'PASS' : 'LAS') + ' - ' + f[C.univ] + ' (' + f[C.ville] + ')',
          option: f[C.option] || '',
          cod: String(f[C.cod]),
          probabilite: Math.round(r.prob * 100),
          rang_dernier_appele: f[C.ran],
        };
      }),
    };
    if (!payload.prenom || !payload.nom) { err.textContent = 'Indique ton prénom et ton nom.'; return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) { err.textContent = 'Adresse email invalide.'; return; }
    if (payload.telephone.replace(/\D/g, '').length < 9) { err.textContent = 'Numéro de téléphone invalide.'; return; }
    err.textContent = '';
    btn.disabled = true;
    btn.textContent = 'Envoi…';
    fetch('/api/save-simulation', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (res) { if (!res.ok) throw new Error('HTTP ' + res.status); })
      .catch(function (e2) { console.warn('save-simulation', e2); }) // on débloque quand même : l'élève ne doit pas être pénalisé
      .then(function () {
        track('Lead');
        state.unlocked = true;
        store('unlocked', true);
        btn.disabled = false;
        btn.textContent = 'Voir tout mon classement';
        renderResults();
        $('#sim-thanks').hidden = false;
      });
  });

  function utm() {
    var q = new URLSearchParams(location.search);
    return { source: q.get('utm_source'), medium: q.get('utm_medium'), campaign: q.get('utm_campaign') };
  }

  $('#sim-restart').addEventListener('click', function () { goStep(1); });

  // Démarrage
  hydrate();
  $('#sim-total').textContent = DATA.length;
  $$('.sim-session').forEach(function (el) { el.textContent = SESSION; });
  var initial = { '#mes-criteres': 2, '#mes-resultats': 3 }[location.hash];
  if (initial && state.profil.aca) {
    if (initial === 3) { compute(); renderResults(); }
    $('#sim-aca-label').textContent = zoneOf(state.profil.aca) === 'IDF' ? 'Île-de-France (Paris, Créteil, Versailles)' : 'académie de ' + state.profil.aca;
    goStep(initial);
  } else {
    goStep(1);
    if (location.hash !== '#mon-profil') history.replaceState(null, '', location.pathname + location.search);
  }
})();
