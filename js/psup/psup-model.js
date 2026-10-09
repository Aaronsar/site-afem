/**
 * Simulateur Parcoursup — modèle de probabilité (estimation, pas une garantie).
 *
 * 1. Lissage multi-sessions : taux d'accès, mentions des admis et part de
 *    l'académie sont moyennés sur les dernières sessions (poids 3/2/1).
 * 2. Barre T = quantile `barQuantile` de la distribution des notes des admis
 *    (mentions au bac, notes supposées uniformes dans chaque tranche). Les
 *    admis qui acceptent sont surtout près du bas de la liste d'appel, le bas
 *    de leur distribution approche le niveau du dernier appelé.
 *    + `selectiveBump` si taux d'accès < 10 %.
 * 3. Score élève S = moyenne pondérée générale / spécialités
 *    + ajustement spécialités et option maths selon la famille (config).
 * 4. P = Phi((S - T) / noise)
 *      × facteur type de bac (taux de proposition de ton type de bac / global)
 *      × plafond hors secteur (familles à priorité géographique).
 */
(function (root) {
  'use strict';

  var CONFIG = root.PSUP_CONFIG || (typeof require !== 'undefined' ? require('./psup-config.js') : null);
  var M = CONFIG.model;
  var MID = [11, 13, 15, 17, 18.8];
  var EDGES = [10, 12, 14, 16, 18, 20];
  // Répartition nationale indicative des mentions des admis (prior de lissage)
  var PRIOR = [0.12, 0.27, 0.33, 0.22, 0.06];

  function Phi(x) {
    var t = 1 / (1 + 0.3275911 * Math.abs(x) / Math.SQRT2);
    var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x / 2);
    return x >= 0 ? (1 + y) / 2 : (1 - y) / 2;
  }
  function clamp(x, lo, hi) { return Math.max(lo, Math.min(hi, x)); }
  function sum(a) { return a.reduce(function (s, v) { return s + (v || 0); }, 0); }

  function sectorOf(aca) {
    var g = CONFIG.sectorGroups.filter(function (grp) { return grp.indexOf(aca) >= 0; })[0];
    return g ? g.join('+') : aca;
  }
  function academyOfDept(code) {
    var d = CONFIG.departements.filter(function (x) { return x[0] === code; })[0];
    return d ? d[2] : '';
  }
  function academyOfDeptName(name) {
    var d = CONFIG.departements.filter(function (x) { return x[1] === name; })[0];
    return d ? d[2] : '';
  }
  function departementsOfSector(aca) {
    var s = sectorOf(aca);
    return CONFIG.departements.filter(function (d) { return d[2] && sectorOf(d[2]) === s; }).map(function (d) { return d[1]; });
  }
  function academiesOfSector(aca) {
    var g = CONFIG.sectorGroups.filter(function (grp) { return grp.indexOf(aca) >= 0; })[0];
    return g ? g.slice() : [aca];
  }

  /**
   * Agrège des lignes de stats (plusieurs sessions d'une formation, ou plusieurs
   * formations « prédécesseurs ») en un profil unique.
   */
  function aggregate(rows) {
    rows = rows.filter(function (r) { return r.cla > 0 && r.ran > 0; });
    if (!rows.length) return null;
    var sessions = rows.map(function (r) { return r.session; }).filter(function (v, i, a) { return a.indexOf(v) === i; }).sort(function (a, b) { return b - a; });
    var acc = { w: 0, ran: 0, cla: 0, ment: [0, 0, 0, 0, 0], mentW: 0, aca: 0, acaW: 0, bac: { bg: [0, 0], bt: [0, 0], bp: [0, 0] }, all: [0, 0] };
    rows.forEach(function (r) {
      var w = CONFIG.sessionWeights[sessions.indexOf(r.session)] || 1;
      acc.ran += w * r.ran; acc.cla += w * r.cla;
      var ms = sum(r.mentions);
      if (ms > 0) {
        var a = (r.acc || r.capa || 1) * w;
        for (var i = 0; i < 5; i++) acc.ment[i] += a * r.mentions[i] / ms;
        acc.mentW += a;
      }
      var idf = CONFIG.sectorGroups[0].indexOf(r.aca) >= 0;
      var pa = idf && r.pctAcaIdf != null ? r.pctAcaIdf : r.pctAca;
      if (pa != null) { acc.aca += w * pa * (r.capa || 1); acc.acaW += w * (r.capa || 1); }
      [['bg', 'propBg', 'claBg'], ['bt', 'propBt', 'claBt'], ['bp', 'propBp', 'claBp']].forEach(function (k) {
        if (r[k[2]] > 0) { acc.bac[k[0]][0] += w * (r[k[1]] || 0); acc.bac[k[0]][1] += w * r[k[2]]; }
      });
      if (r.prop != null && r.cla > 0) { acc.all[0] += w * r.prop; acc.all[1] += w * r.cla; }
    });
    var latest = rows.filter(function (r) { return r.session === sessions[0]; });
    var capa = sum(latest.map(function (r) { return r.capa; }));
    var n = acc.mentW > 0 ? acc.mentW / sum(CONFIG.sessionWeights.slice(0, sessions.length)) : 0;
    var shares = acc.ment.map(function (v, i) {
      var s = acc.mentW > 0 ? v / acc.mentW : PRIOR[i];
      return (n * s + M.priorWeight * PRIOR[i]);
    });
    var tot = sum(shares);
    shares = shares.map(function (v) { return v / tot; });
    var propRate = acc.all[1] > 0 ? acc.all[0] / acc.all[1] : null;
    function rate(k) { return acc.bac[k][1] >= 5 ? acc.bac[k][0] / acc.bac[k][1] : null; }
    return {
      t: clamp(acc.ran / acc.cla, 0.01, 1),
      shares: shares,
      pctAca: acc.acaW > 0 ? Math.round(acc.aca / acc.acaW) : null,
      capa: capa,
      cla: sum(latest.map(function (r) { return r.cla; })),
      ran: sum(latest.map(function (r) { return r.ran; })),
      propRate: propRate,
      bacRate: { gen: rate('bg'), techno: rate('bt'), pro: rate('bp') },
      sessions: sessions,
      history: sessions.map(function (s) {
        var rs = rows.filter(function (r) { return r.session === s; });
        return { session: s, capa: sum(rs.map(function (r) { return r.capa; })), cla: sum(rs.map(function (r) { return r.cla; })), ran: sum(rs.map(function (r) { return r.ran; })), tx: rs.length === 1 ? rs[0].tx : null };
      }),
      nonSelective: latest.every(function (r) { return r.nonSelective; }),
    };
  }

  function admittedMean(sh) { return sh.reduce(function (a, v, i) { return a + v * MID[i]; }, 0); }
  function admittedQuantile(sh, q) {
    var c = 0;
    for (var i = 0; i < 5; i++) {
      if (c + sh[i] >= q) return EDGES[i] + (q - c) / sh[i] * 2;
      c += sh[i];
    }
    return 20;
  }

  /**
   * profil : { gen, spe, bac: 'gen'|'techno'|'pro', specialites: [k1,k2], maths, aca }
   * agg    : sortie de aggregate()
   * ctx    : { family, aca (académie de la formation) }
   */
  function evaluate(profil, agg, ctx) {
    var fam = ctx.family || {};
    var factors = [];
    var A = admittedMean(agg.shares);
    var T = admittedQuantile(agg.shares, M.barQuantile) + (agg.t < 0.1 ? M.selectiveBump : 0);
    var base = M.gradeWeights.gen * profil.gen + M.gradeWeights.spe * profil.spe;
    var S = base;

    // Spécialités / option maths (bac général uniquement)
    if (profil.bac === 'gen' && fam.specialites && fam.specialites.length) {
      var have = (profil.specialites || []).filter(function (s) { return fam.specialites.indexOf(s) >= 0; }).length;
      var adj = have >= 2 ? 0.3 : have === 1 ? 0 : -0.6;
      S += adj;
      if (have >= 2) factors.push({ k: 'plus', txt: 'Tes deux spécialités correspondent à ce que recherchent ces formations.' });
      if (have === 0) factors.push({ k: 'minus', txt: 'Tes spécialités sont rares chez les admis de ce type de formation.' });
      if (fam.maths) {
        var mAdj = { expertes: 0.2, complementaires: fam.maths === 'forte' ? -0.2 : 0.05, aucune: fam.maths === 'forte' ? -0.6 : -0.1 }[profil.maths] || 0;
        if (profil.specialites && profil.specialites.indexOf('maths') >= 0 && profil.maths !== 'expertes') mAdj = Math.max(mAdj, 0);
        S += mAdj;
        if (fam.maths === 'forte' && mAdj < 0) factors.push({ k: 'minus', txt: 'Le niveau en maths compte beaucoup ici : maths expertes ou spécialité maths conseillées.' });
      }
    }
    if (profil.spe - profil.gen >= 1) factors.push({ k: 'plus', txt: 'Tes notes de spécialités tirent ton dossier vers le haut.' });
    if (profil.gen - profil.spe >= 1) factors.push({ k: 'minus', txt: 'Tes notes de spécialités sont en retrait par rapport au reste.' });

    var gap = base - A;
    factors.unshift({
      k: gap >= 0.5 ? 'plus' : gap <= -0.5 ? 'minus' : 'neutral',
      txt: (gap >= 0.5 ? 'Tes notes sont au-dessus' : gap <= -0.5 ? 'Tes notes sont en dessous' : 'Tes notes sont proches') + ' du niveau moyen des admis (≈ ' + A.toFixed(1) + '/20).',
    });

    // Priorité géographique : hors secteur, on retire un peu de score et on
    // plafonne par la part des admis venus d'ailleurs.
    var inZone = !!profil.aca && !!ctx.aca && sectorOf(profil.aca) === sectorOf(ctx.aca);
    var pctAca = agg.pctAca == null ? 75 : agg.pctAca;
    var outCap = 1;
    if (fam.sector && agg.t < 0.9) {
      if (!inZone) {
        S -= pctAca >= 70 ? 0.5 : 0.2;
        outCap = clamp((100 - pctAca) / 30, 0.05, 1);
        if (pctAca >= 70) factors.push({ k: 'minus', txt: pctAca + ' % des admis viennent du secteur : tu candidates hors secteur.' });
      } else if (pctAca >= 70) {
        factors.push({ k: 'plus', txt: 'Tu es dans le secteur : ' + pctAca + ' % des admis en viennent.' });
      }
    }

    var prob = Phi((S - T) / M.noise) * outCap;

    // Type de bac : taux de proposition de ton type de bac rapporté au taux global
    var r = agg.bacRate[profil.bac];
    if (agg.propRate && r != null) {
      var bacF = clamp(r / agg.propRate, 0.05, 1.4);
      prob *= bacF;
      if (bacF < 0.6) factors.push({ k: 'minus', txt: 'Les candidats de ton type de bac reçoivent nettement moins de propositions ici.' });
      if (bacF > 1.15) factors.push({ k: 'plus', txt: 'Les candidats de ton type de bac sont favorisés dans cette formation.' });
    } else if (profil.bac !== 'gen' && agg.bacRate.gen != null && r == null) {
      prob *= 0.3;
      factors.push({ k: 'minus', txt: 'Presque aucun candidat de ton type de bac n\'est classé dans cette formation.' });
    }

    if (agg.t >= 0.95 && (inZone || !fam.sector)) {
      prob = Math.max(prob, 0.9);
      factors.push({ k: 'plus', txt: 'Presque tous les candidats classés ont reçu une proposition.' });
    }
    prob = clamp(prob, M.minProb, M.maxProb);
    return { prob: prob, A: A, T: T, inZone: inZone, factors: factors };
  }

  function level(prob) {
    if (prob >= 0.75) return { key: 'top', label: 'Très probable' };
    if (prob >= 0.5) return { key: 'good', label: 'Probable' };
    if (prob >= 0.25) return { key: 'mid', label: 'Possible' };
    if (prob >= 0.1) return { key: 'low', label: 'Ambitieux' };
    return { key: 'hard', label: 'Très difficile' };
  }

  // Probabilité d'au moins une proposition (hypothèse d'indépendance, indicatif)
  function atLeastOne(probs) {
    return Math.min(0.99, 1 - probs.reduce(function (acc, p) { return acc * (1 - p); }, 1)); // jamais une certitude
  }

  var MODEL = {
    aggregate: aggregate, evaluate: evaluate, level: level, atLeastOne: atLeastOne,
    sectorOf: sectorOf, academyOfDept: academyOfDept, academyOfDeptName: academyOfDeptName,
    departementsOfSector: departementsOfSector, academiesOfSector: academiesOfSector,
  };
  root.PSUP_MODEL = MODEL;
  if (typeof module !== 'undefined' && module.exports) module.exports = MODEL;
})(typeof window !== 'undefined' ? window : globalThis);
