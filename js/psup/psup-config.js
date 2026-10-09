/**
 * Simulateur Parcoursup — configuration.
 *
 * TOUT ce qui peut bouger d'une année sur l'autre (réforme, renommage de
 * champs, nouveaux jeux de données) se règle ici, sans toucher au code.
 * Voir SIMULATEUR.md pour la marche à suivre quand la réforme santé arrive.
 */
(function (root) {
  'use strict';

  var CONFIG = {
    api: 'https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/',

    datasets: {
      // Statistiques d'admission : la dernière session publiée…
      stats: 'fr-esr-parcoursup',
      // …et les sessions précédentes ({year} est remplacé)
      statsHistory: 'fr-esr-parcoursup_{year}',
      // Offre de formation de l'année en cours (contient les NOUVELLES formations,
      // y compris celles qui n'ont encore aucune statistique)
      catalog: 'fr-esr-cartographie_formations_parcoursup',
    },
    historyDepth: 2,      // sessions précédentes utilisées pour lisser (en plus de la dernière)
    sessionWeights: [3, 2, 1], // poids de la plus récente à la plus ancienne
    cacheHours: 24,
    maxVoeux: 10,

    // Champs du jeu de stats : nom interne → noms possibles (le premier présent gagne).
    // Si le ministère renomme une colonne, ajouter le nouveau nom en tête.
    fields: {
      cod: ['cod_aff_form'],
      session: ['session'],
      fili: ['fili'],
      uai: ['cod_uai'],
      etab: ['g_ea_lib_vx'],
      ville: ['ville_etab'],
      aca: ['acad_mies'],
      dep: ['dep'],
      label: ['lib_comp_voe_ins'],
      formation: ['lib_for_voe_ins'],
      filLib: ['fil_lib_voe_acc'],
      detail: ['detail_forma'],
      selective: ['select_form'],
      capa: ['capa_fin'],
      voeux: ['voe_tot'],
      cla: ['nb_cla_pp'],
      claBg: ['nb_cla_pp_bg'], claBt: ['nb_cla_pp_bt'], claBp: ['nb_cla_pp_bp'],
      prop: ['prop_tot'],
      propBg: ['prop_tot_bg'], propBt: ['prop_tot_bt'], propBp: ['prop_tot_bp'],
      acc: ['acc_tot'],
      ran: ['ran_grp1'],
      tx: ['taux_acces_ens', 'taux_adm_psup'],
      mSans: ['pct_sansmention'], mAB: ['pct_ab'], mB: ['pct_b'], mTB: ['pct_tb'], mTBF: ['pct_tbf'],
      pctAca: ['pct_aca_orig'], pctAcaIdf: ['pct_aca_orig_idf'],
      lien: ['lien_form_psup'],
    },

    // Département (code, nom tel qu'écrit dans le catalogue, académie tel qu'écrit dans les stats)
    departements: [
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
    ],

    // Catalogue (pas de champ `fili`) → filière des stats
    catalogFili: function (c) {
      var tf = (c.tf || []).join(' | ');
      if (c.nmc === 'PASS') return 'PASS';
      if (/sant/i.test(tf) && /^L1-/.test(c.nmc || '')) return 'Licence_Las';
      if (/^DE-INF/.test(c.nmc || '')) return 'IFSI';
      if (/CPGE/.test(tf)) return 'CPGE';
      if (/\bBUT\b/.test(tf)) return 'BUT';
      if (/BTS/.test(tf)) return 'BTS';
      if (/ingénieurs/.test(tf)) return "Ecole d'Ingénieur";
      if (/commerce/.test(tf)) return 'Ecole de Commerce';
      if (/^Licence/.test(tf)) return 'Licence';
      return null;
    },

    // Île-de-France = un seul secteur pour les licences et l'accès santé
    sectorGroups: [['Paris', 'Créteil', 'Versailles']],

    /**
     * Familles de formations.
     *  match(f)        : f = { fili, label, nmc, tf } (stats ou catalogue)
     *  statsFilieres   : valeurs de `fili` pour requêter les stats de la famille
     *  sector          : la priorité géographique s'applique
     *  specialites     : spécialités attendues (bonus si l'élève les a)
     *  maths           : importance de l'option maths ('forte' | 'moyenne')
     *  predecessors    : pour une formation NOUVELLE (sans stats), filières dont
     *                    on agrège les stats du même établissement
     *
     * L'ordre compte : la première famille qui matche gagne.
     */
    families: [
      {
        key: 'acces-sante', label: 'Santé (PASS, L.AS, licence portail santé)', short: 'Santé',
        // PASS / L.AS aujourd'hui ; « licence portail santé », « licence accès santé », LSPS… après la réforme 2027
        match: function (f) {
          if (f.fili === 'PASS' || f.fili === 'Licence_Las') return true;
          if (f.nmc === 'PASS' || /^L1-/.test(f.nmc || '') && /sant/i.test((f.tf || []).join(' '))) return true;
          return /\b(PASS|L\.?AS)\b|portail sant|acc[eè]s sant|\bLSPS\b/i.test(f.label || '');
        },
        statsFilieres: ['PASS', 'Licence_Las'],
        catalogWhere: 'tf="Etudes de santé" and (nmc="PASS" or nmc like "L1-*" or search("portail santé") or search("accès santé"))',
        sector: true,
        specialites: ['svt', 'pc', 'maths'],
        maths: 'moyenne',
        predecessors: ['PASS', 'Licence_Las'],
      },
      {
        key: 'paramedical', label: 'Paramédical (IFSI, kiné, ergo…)', short: 'Paramédical',
        match: function (f) { return f.fili === 'IFSI' || f.fili === 'EFTS' || /^DE-|orthopt|audioprot/i.test(f.nmc || ''); },
        statsFilieres: ['IFSI', 'EFTS'],
        catalogWhere: 'tf="Etudes de santé" and not (nmc="PASS" or nmc like "L1-*")',
        sector: false,
        specialites: ['svt', 'ses', 'pc'],
        predecessors: ['IFSI', 'EFTS'],
      },
      {
        key: 'cpge-sci', label: 'Prépa scientifique', short: 'Prépa sci.',
        match: function (f) { return f.fili === 'CPGE' && /MPSI|PCSI|PTSI|MP2I|BCPST|TSI|\bTB\b|TPC|ATS/i.test(f.label || ''); },
        statsFilieres: ['CPGE'],
        catalogWhere: 'tf="CPGE" and (search("MPSI") or search("PCSI") or search("PTSI") or search("MP2I") or search("BCPST") or search("TSI"))',
        specialites: ['maths', 'pc', 'nsi', 'si', 'svt'],
        maths: 'forte',
        predecessors: ['CPGE'],
      },
      {
        key: 'cpge-eco', label: 'Prépa économique', short: 'Prépa éco',
        match: function (f) { return f.fili === 'CPGE' && /ECG|ECT|D1|D2|économique/i.test(f.label || ''); },
        statsFilieres: ['CPGE'],
        catalogWhere: 'tf="CPGE" and (search("ECG") or search("ECT") or search("D1") or search("D2"))',
        specialites: ['maths', 'ses', 'hggsp', 'llcer'],
        maths: 'moyenne',
        predecessors: ['CPGE'],
      },
      {
        key: 'cpge-lit', label: 'Prépa littéraire', short: 'Prépa litt.',
        match: function (f) { return f.fili === 'CPGE'; },
        statsFilieres: ['CPGE'],
        catalogWhere: 'tf="CPGE"',
        specialites: ['hlp', 'llcer', 'hggsp', 'llca', 'ses'],
        predecessors: ['CPGE'],
      },
      {
        key: 'ingenieur', label: "Écoles d'ingénieurs", short: 'Ingé',
        match: function (f) { return f.fili === "Ecole d'Ingénieur"; },
        statsFilieres: ["Ecole d'Ingénieur"],
        catalogWhere: 'tf="Formations des écoles d\'ingénieurs"',
        specialites: ['maths', 'pc', 'nsi', 'si'],
        maths: 'forte',
        predecessors: ["Ecole d'Ingénieur"],
      },
      {
        key: 'commerce', label: 'Écoles de commerce', short: 'Commerce',
        match: function (f) { return f.fili === 'Ecole de Commerce'; },
        statsFilieres: ['Ecole de Commerce'],
        catalogWhere: 'tf="Formations des écoles de commerce et de management"',
        specialites: ['maths', 'ses', 'hggsp', 'llcer'],
        predecessors: ['Ecole de Commerce'],
      },
      {
        key: 'but', label: 'BUT', short: 'BUT',
        match: function (f) { return f.fili === 'BUT'; },
        statsFilieres: ['BUT'], catalogWhere: 'tf="BUT"', predecessors: ['BUT'],
      },
      {
        key: 'bts', label: 'BTS', short: 'BTS',
        match: function (f) { return f.fili === 'BTS'; },
        statsFilieres: ['BTS'], catalogWhere: 'tf="BTS - BTSA - BTSM"', predecessors: ['BTS'],
      },
      {
        key: 'licence', label: 'Licences', short: 'Licence',
        match: function (f) { return f.fili === 'Licence'; },
        statsFilieres: ['Licence'],
        catalogWhere: '(tf="Licence" or tf="Licence sélective")',
        sector: true,
        predecessors: ['Licence'],
      },
      {
        key: 'autre', label: 'Autres formations', short: 'Autre',
        match: function () { return true; },
        statsFilieres: ['Autre formation'], catalogWhere: null, predecessors: ['Autre formation'],
      },
    ],

    specialites: [
      ['maths', 'Mathématiques'], ['pc', 'Physique-chimie'], ['svt', 'SVT'], ['ses', 'SES'],
      ['hggsp', 'HGGSP'], ['hlp', 'Humanités, littérature et philosophie'], ['llcer', 'Langues (LLCER)'],
      ['nsi', 'NSI'], ['si', "Sciences de l'ingénieur"], ['llca', 'Langues anciennes (LLCA)'],
      ['arts', 'Arts'], ['eppcs', 'Éducation physique (EPPCS)'], ['bioeco', 'Biologie-écologie'],
    ],
    seriesTechno: ['STMG', 'STI2D', 'ST2S', 'STL', 'STD2A', 'STAV', 'STHR', 'S2TMD'],

    // Paramètres du modèle (voir psup-model.js)
    model: {
      barQuantile: 0.3,
      selectiveBump: 0.4,  // barre relevée si taux d'accès < 10 %
      noise: 1.2,
      priorWeight: 12,
      minProb: 0.02,
      maxProb: 0.95,
      gradeWeights: { gen: 0.45, spe: 0.55 },
    },
  };

  root.PSUP_CONFIG = CONFIG;
  if (typeof module !== 'undefined' && module.exports) module.exports = CONFIG;
})(typeof window !== 'undefined' ? window : globalThis);
