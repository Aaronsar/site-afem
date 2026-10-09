/**
 * Simulateur Parcoursup — client de l'open data Parcoursup (MESR, Opendatasoft v2.1).
 *
 * - Détecte automatiquement la dernière session de stats publiée et l'année
 *   du catalogue de formations (aucune année codée en dur).
 * - Normalise les enregistrements via CONFIG.fields (alias de champs).
 * - Formation sans statistiques (nouvelle, ex. réforme santé 2027) :
 *   estimation à partir de ses « prédécesseurs » dans le même établissement.
 *
 * Dépend de PSUP_CONFIG. Fonctionne dans le navigateur et sous Node ≥ 18.
 */
(function (root) {
  'use strict';

  var CONFIG = root.PSUP_CONFIG || (typeof require !== 'undefined' ? require('./psup-config.js') : null);
  var mem = {};

  // ─── Cache (mémoire + localStorage si dispo) ───
  function cacheGet(key) {
    if (mem[key]) return mem[key];
    try {
      var raw = root.localStorage && root.localStorage.getItem('psup:' + key);
      if (!raw) return null;
      var o = JSON.parse(raw);
      if (Date.now() - o.t > CONFIG.cacheHours * 3600e3) return null;
      mem[key] = o.v;
      return o.v;
    } catch (e) { return null; }
  }
  function cacheSet(key, v) {
    mem[key] = v;
    try { root.localStorage && root.localStorage.setItem('psup:' + key, JSON.stringify({ t: Date.now(), v: v })); } catch (e) { /* quota / mode privé */ }
    return v;
  }

  function q(s) { return '"' + String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"'; }
  function inList(field, values) { return field + ' in (' + values.map(q).join(',') + ')'; }

  function get(dataset, params, cacheKey) {
    var key = cacheKey && dataset + '|' + cacheKey;
    if (key) {
      var hit = cacheGet(key);
      if (hit) return Promise.resolve(hit);
    }
    var usp = new URLSearchParams();
    Object.keys(params).forEach(function (k) { if (params[k] != null && params[k] !== '') usp.set(k, params[k]); });
    return fetch(CONFIG.api + dataset + '/records?' + usp.toString())
      .then(function (r) {
        if (r.status === 404) return { results: [], missing: true };
        return r.json().then(function (j) {
          if (!r.ok) throw new Error('Open data Parcoursup : ' + (j.message || r.status));
          return j;
        });
      })
      .then(function (j) { return key ? cacheSet(key, j) : j; });
  }

  // ─── Découverte des sessions / de l'année du catalogue ───
  var metaPromise = null;
  function meta() {
    if (metaPromise) return metaPromise;
    metaPromise = Promise.all([
      get(CONFIG.datasets.stats, { select: 'session', group_by: 'session', order_by: 'session desc', limit: 5 }, 'sessions'),
      get(CONFIG.datasets.catalog, { select: 'annee', group_by: 'annee', order_by: 'annee desc', limit: 1 }, 'annee'),
    ]).then(function (res) {
      var latest = +(res[0].results[0] || {}).session;
      var catalogYear = +(res[1].results[0] || {}).annee;
      if (!latest) throw new Error('Session Parcoursup introuvable');
      // Datasets historiques : on vérifie qu'ils existent (le nommage peut changer)
      var years = [];
      for (var y = latest - 1; y >= latest - CONFIG.historyDepth; y--) years.push(y);
      return Promise.all(years.map(function (y) {
        var ds = CONFIG.datasets.statsHistory.replace('{year}', y);
        return get(ds, { limit: 0 }, 'exists').then(function (j) { return j.missing ? null : { year: y, dataset: ds }; }, function () { return null; });
      })).then(function (hist) {
        return {
          latestSession: latest,
          catalogYear: catalogYear || latest + 1,
          datasets: [{ year: latest, dataset: CONFIG.datasets.stats }].concat(hist.filter(Boolean)),
        };
      });
    });
    metaPromise.catch(function () { metaPromise = null; });
    return metaPromise;
  }

  // ─── Normalisation ───
  function pick(rec, name) {
    var keys = CONFIG.fields[name] || [name];
    for (var i = 0; i < keys.length; i++) if (rec[keys[i]] !== undefined && rec[keys[i]] !== null) return rec[keys[i]];
    return null;
  }
  function n(v) { var x = Number(v); return Number.isFinite(x) ? x : null; }

  function normStats(rec) {
    var o = {};
    Object.keys(CONFIG.fields).forEach(function (k) { o[k] = pick(rec, k); });
    ['capa', 'voeux', 'cla', 'claBg', 'claBt', 'claBp', 'prop', 'propBg', 'propBt', 'propBp', 'acc', 'ran', 'tx',
      'mSans', 'mAB', 'mB', 'mTB', 'mTBF', 'pctAca', 'pctAcaIdf', 'session'].forEach(function (k) { o[k] = n(o[k]); });
    o.cod = o.cod != null ? String(o.cod) : null;
    o.mentions = [o.mSans || 0, o.mAB || 0, o.mB || 0, o.mTB || 0, o.mTBF || 0];
    o.nonSelective = /non s[ée]lective/i.test(o.selective || '');
    return o;
  }

  function normCatalog(rec) {
    var label = Array.isArray(rec.nm) ? rec.nm[0] : rec.nm;
    return {
      cod: String(rec.gta),
      label: label || '',
      etab: rec.etab_nom || '',
      uai: rec.etab_uai || null,
      ville: rec.commune || '',
      departement: rec.departement || '',
      tf: rec.tf || [],
      nmc: rec.nmc || '',
      fiche: rec.fiche || null,
      gps: rec.etab_gps || null,
      selection: (rec.aut || []).join(' '),
    };
  }

  function family(f) {
    var fams = CONFIG.families;
    for (var i = 0; i < fams.length; i++) if (fams[i].match(f)) return fams[i];
    return fams[fams.length - 1];
  }
  function familyByKey(k) { return CONFIG.families.filter(function (f) { return f.key === k; })[0]; }

  // ─── Recherche dans le catalogue de l'année ───
  function searchCatalog(opts) {
    return meta().then(function (m) {
      var where = ['annee=' + q(m.catalogYear)];
      if (opts.q && opts.q.trim()) where.push('search(' + q(opts.q.trim()) + ')');
      var fam = opts.family && familyByKey(opts.family);
      if (fam && fam.catalogWhere) where.push('(' + fam.catalogWhere + ')');
      if (opts.departements && opts.departements.length) where.push(inList('departement', opts.departements));
      return get(CONFIG.datasets.catalog, {
        where: where.join(' and '),
        limit: opts.limit || 30,
        order_by: 'etab_nom',
      }).then(function (j) {
        return (j.results || []).map(normCatalog).map(function (c) {
          c.fili = CONFIG.catalogFili(c);
          c.family = family(c);
          return c;
        });
      });
    });
  }

  // ─── Entrées du catalogue pour une liste de codes (libellé exact, fiche…) ───
  function catalogFor(cods) {
    cods = cods.filter(Boolean).map(String);
    if (!cods.length) return Promise.resolve({});
    return meta().then(function (m) {
      return get(CONFIG.datasets.catalog, { where: 'annee=' + q(m.catalogYear) + ' and ' + inList('gta', cods), limit: 100 }, 'cat:' + cods.slice().sort().join(','))
        .then(function (j) {
          var out = {};
          (j.results || []).map(normCatalog).forEach(function (c) { c.fili = CONFIG.catalogFili(c); c.family = family(c); out[c.cod] = c; });
          return out;
        });
    });
  }

  // ─── Statistiques (toutes sessions dispo) pour une liste de codes ───
  function statsFor(cods) {
    cods = cods.filter(Boolean).map(String);
    if (!cods.length) return Promise.resolve({});
    return meta().then(function (m) {
      return Promise.all(m.datasets.map(function (d) {
        return get(d.dataset, { where: inList(CONFIG.fields.cod[0], cods), limit: 100 }, 'cod:' + cods.slice().sort().join(','))
          .then(function (j) { return (j.results || []).map(normStats); }, function () { return []; });
      })).then(function (perSession) {
        var out = {};
        perSession.forEach(function (rows) {
          rows.forEach(function (r) { (out[r.cod] = out[r.cod] || []).push(r); });
        });
        Object.keys(out).forEach(function (k) { out[k].sort(function (a, b) { return b.session - a.session; }); });
        return out;
      });
    });
  }

  // ─── Stats d'une famille dans une zone (suggestions de vœux) ───
  function statsInZone(familyKey, academies, limit) {
    var fam = familyByKey(familyKey);
    if (!fam) return Promise.resolve([]);
    return meta().then(function () {
      var where = [inList(CONFIG.fields.fili[0], fam.statsFilieres)];
      if (academies && academies.length) where.push(inList(CONFIG.fields.aca[0], academies));
      return get(CONFIG.datasets.stats, { where: where.join(' and '), limit: limit || 100 }, 'zone:' + familyKey + ':' + (academies || []).join(','))
        .then(function (j) { return (j.results || []).map(normStats).filter(function (r) { return fam.match(r); }); });
    });
  }

  /**
   * Formation sans statistiques → stats agrégées des prédécesseurs du même
   * établissement (même UAI, sinon même nom d'université), sinon de la même
   * famille dans le même département. Renvoie { rows, basis } ou null.
   */
  function predecessorStats(entry) {
    var fam = entry.family || family(entry);
    var filieres = fam.predecessors || fam.statsFilieres;
    var root = (entry.etab || '').split(' - ')[0].trim();
    var base = inList(CONFIG.fields.fili[0], filieres);
    var tries = [];
    if (entry.uai) tries.push({ where: base + ' and ' + CONFIG.fields.uai[0] + '=' + q(entry.uai), basis: 'etab' });
    if (root) tries.push({ where: base + ' and search(' + q(root) + ')', basis: 'etab', filter: function (r) { return (r.etab || '').indexOf(root) === 0; } });
    var dep = CONFIG.departements.filter(function (d) { return d[1] === entry.departement; })[0];
    if (dep) tries.push({ where: base + ' and ' + CONFIG.fields.dep[0] + '=' + q(dep[0]), basis: 'zone' });

    function next(i) {
      if (i >= tries.length) return Promise.resolve(null);
      var t = tries[i];
      return get(CONFIG.datasets.stats, { where: t.where, limit: 100 }, 'pred:' + t.where)
        .then(function (j) {
          var rows = (j.results || []).map(normStats).filter(function (r) { return fam.match(r) || filieres.indexOf(r.fili) >= 0; });
          if (t.filter) rows = rows.filter(t.filter);
          return rows.length ? { rows: rows, basis: t.basis } : next(i + 1);
        }, function () { return next(i + 1); });
    }
    return next(0);
  }

  var API = {
    meta: meta,
    searchCatalog: searchCatalog,
    catalogFor: catalogFor,
    statsFor: statsFor,
    statsInZone: statsInZone,
    predecessorStats: predecessorStats,
    family: family,
    familyByKey: familyByKey,
    normStats: normStats,
  };
  root.PSUP_API = API;
  if (typeof module !== 'undefined' && module.exports) module.exports = API;
})(typeof window !== 'undefined' ? window : globalThis);
