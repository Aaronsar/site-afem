/**
 * Données des facultés de médecine françaises
 * Sources : données officielles PASS/LAS
 */

window.FACS_DATA = [
  {
    id: "paris-cite",
    name: "Université Paris Cité",
    city: "Paris",
    region: "Île-de-France",
    pass: {
      etudiants: 1820,
      places_mmopk: 606,
      taux_reussite: 33.3,
      places_med: 375,
      places_pharma: 125,
      places_kine: 44,
      places_odonto: 37,
      places_sage_femme: 25,
      voeux_parcoursup: 145057,
      pct_admission: 1.25
    },
    las: {
      etudiants: 821,
      places_mmopk: 126,
      taux_reussite: 15.3,
      places_med: 80,
      places_pharma: 25,
      places_kine: 9,
      places_odonto: 10,
      places_sage_femme: 2
    },
    recommended_path: "PASS"
  },
  {
    id: "paris-saclay",
    name: "Université Paris-Saclay",
    city: "Saclay",
    region: "Île-de-France",
    pass: {
      etudiants: 490,
      places_mmopk: 374,
      taux_reussite: 76.3,
      places_med: 220,
      places_pharma: 79,
      places_kine: 49,
      places_odonto: 15,
      places_sage_femme: 11,
      voeux_parcoursup: 71785,
      pct_admission: 0.68
    },
    las: {
      etudiants: 295,
      places_mmopk: 37,
      taux_reussite: 12.5,
      places_med: 25,
      places_pharma: 10,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 2
    },
    recommended_path: "PASS"
  },
  {
    id: "lyon-1",
    name: "Université Lyon 1",
    city: "Lyon",
    region: "Auvergne-Rhône-Alpes",
    pass: {
      etudiants: 1725,
      places_mmopk: 660,
      taux_reussite: 38.3,
      places_med: 470,
      places_pharma: 97,
      places_kine: 37,
      places_odonto: 31,
      places_sage_femme: 25,
      voeux_parcoursup: 80939,
      pct_admission: 2.13
    },
    las: {
      etudiants: 545,
      places_mmopk: 217,
      taux_reussite: 39.8,
      places_med: 141,
      places_pharma: 29,
      places_kine: 0,
      places_odonto: 7,
      places_sage_femme: 5
    },
    recommended_path: "IDEM"
  },
  {
    id: "montpellier",
    name: "Université de Montpellier",
    city: "Montpellier",
    region: "Occitanie",
    pass: {
      etudiants: 1600,
      places_mmopk: 409,
      taux_reussite: 25.6,
      places_med: 196,
      places_pharma: 108,
      places_kine: 43,
      places_odonto: 27,
      places_sage_femme: 35,
      voeux_parcoursup: 85761,
      pct_admission: 1.87
    },
    las: {
      etudiants: 475,
      places_mmopk: 110,
      taux_reussite: 23.2,
      places_med: 44,
      places_pharma: 30,
      places_kine: 20,
      places_odonto: 9,
      places_sage_femme: 7
    },
    recommended_path: "IDEM"
  },
  {
    id: "toulouse",
    name: "Université de Toulouse",
    city: "Toulouse",
    region: "Occitanie",
    pass: {
      etudiants: 1083,
      places_mmopk: 328,
      taux_reussite: 30.3,
      places_med: 196,
      places_pharma: 50,
      places_kine: 23,
      places_odonto: 48,
      places_sage_femme: 11,
      voeux_parcoursup: 65905,
      pct_admission: 1.64
    },
    las: {
      etudiants: 363,
      places_mmopk: 65,
      taux_reussite: 17.9,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "aix-marseille",
    name: "Aix-Marseille Université",
    city: "Marseille",
    region: "Provence-Alpes-Côte d'Azur",
    pass: {
      etudiants: 1630,
      places_mmopk: 474,
      taux_reussite: 29.1,
      places_med: 256,
      places_pharma: 86,
      places_kine: 75,
      places_odonto: 37,
      places_sage_femme: 20,
      voeux_parcoursup: 48827,
      pct_admission: 3.34
    },
    las: {
      etudiants: 831,
      places_mmopk: 111,
      taux_reussite: 13.4,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "lille",
    name: "Université de Lille",
    city: "Lille",
    region: "Hauts-de-France",
    pass: {
      etudiants: 1730,
      places_mmopk: 515,
      taux_reussite: 29.8,
      places_med: 305,
      places_pharma: 92,
      places_kine: 57,
      places_odonto: 35,
      places_sage_femme: 26,
      voeux_parcoursup: 82672,
      pct_admission: 2.09
    },
    las: {
      etudiants: 793,
      places_mmopk: 215,
      taux_reussite: 27.1,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "bordeaux",
    name: "Université de Bordeaux",
    city: "Bordeaux",
    region: "Nouvelle-Aquitaine",
    pass: {
      etudiants: 1400,
      places_mmopk: 367,
      taux_reussite: 26.2,
      places_med: 200,
      places_pharma: 69,
      places_kine: 46,
      places_odonto: 28,
      places_sage_femme: 24,
      voeux_parcoursup: 43735,
      pct_admission: 3.20
    },
    las: {
      etudiants: 335,
      places_mmopk: 83,
      taux_reussite: 24.8,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "versailles-uvsq",
    name: "Université de Versailles (UVSQ)",
    city: "Versailles",
    region: "Île-de-France",
    pass: {
      etudiants: 556,
      places_mmopk: 241,
      taux_reussite: 43.3,
      places_med: 138,
      places_pharma: 25,
      places_kine: 63,
      places_odonto: 6,
      places_sage_femme: 9,
      voeux_parcoursup: 34125,
      pct_admission: 1.63
    },
    las: {
      etudiants: 300,
      places_mmopk: 0,
      taux_reussite: 0,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "LAS"
  },
  {
    id: "nantes",
    name: "Nantes Université",
    city: "Nantes",
    region: "Pays de la Loire",
    pass: {
      etudiants: 758,
      places_mmopk: 215,
      taux_reussite: 28.4,
      places_med: 107,
      places_pharma: 54,
      places_kine: 25,
      places_odonto: 17,
      places_sage_femme: 12,
      voeux_parcoursup: 36171,
      pct_admission: 2.10
    },
    las: {
      etudiants: 416,
      places_mmopk: 144,
      taux_reussite: 34.6,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "LAS"
  },
  {
    id: "sorbonne-nord",
    name: "Sorbonne Paris Nord",
    city: "Bobigny",
    region: "Île-de-France",
    pass: {
      etudiants: 355,
      places_mmopk: 108,
      taux_reussite: 30.4,
      places_med: 65,
      places_pharma: 28,
      places_kine: 4,
      places_odonto: 7,
      places_sage_femme: 4,
      voeux_parcoursup: 99669,
      pct_admission: 0.36
    },
    las: {
      etudiants: 505,
      places_mmopk: 93,
      taux_reussite: 18.4,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "sorbonne-universite",
    name: "Sorbonne Université",
    city: "Paris",
    region: "Île-de-France",
    pass: {
      etudiants: 1400,
      places_mmopk: 338,
      taux_reussite: 24.1,
      places_med: 215,
      places_pharma: 57,
      places_kine: 0,
      places_odonto: 15,
      places_sage_femme: 13,
      voeux_parcoursup: 24303,
      pct_admission: 5.76
    },
    las: {
      etudiants: 325,
      places_mmopk: 21,
      taux_reussite: 6.5,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "grenoble-alpes",
    name: "Université Grenoble Alpes",
    city: "Grenoble",
    region: "Auvergne-Rhône-Alpes",
    pass: {
      etudiants: 1300,
      places_mmopk: 214,
      taux_reussite: 16.5,
      places_med: 120,
      places_pharma: 50,
      places_kine: 15,
      places_odonto: 14,
      places_sage_femme: 15,
      voeux_parcoursup: 17365,
      pct_admission: 7.49
    },
    las: {
      etudiants: 400,
      places_mmopk: 41,
      taux_reussite: 10.3,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "nancy",
    name: "Université de Lorraine (Nancy)",
    city: "Nancy",
    region: "Grand Est",
    pass: {
      etudiants: 750,
      places_mmopk: 351,
      taux_reussite: 46.8,
      places_med: 175,
      places_pharma: 65,
      places_kine: 40,
      places_odonto: 47,
      places_sage_femme: 24,
      voeux_parcoursup: 28894,
      pct_admission: 2.60
    },
    las: {
      etudiants: 225,
      places_mmopk: 88,
      taux_reussite: 39.1,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "rennes",
    name: "Université de Rennes",
    city: "Rennes",
    region: "Bretagne",
    pass: {
      etudiants: 696,
      places_mmopk: 214,
      taux_reussite: 30.7,
      places_med: 105,
      places_pharma: 44,
      places_kine: 20,
      places_odonto: 34,
      places_sage_femme: 11,
      voeux_parcoursup: 33158,
      pct_admission: 2.10
    },
    las: {
      etudiants: 430,
      places_mmopk: 114,
      taux_reussite: 26.5,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "LAS"
  },
  {
    id: "clermont-ferrand",
    name: "Université Clermont Auvergne",
    city: "Clermont-Ferrand",
    region: "Auvergne-Rhône-Alpes",
    pass: {
      etudiants: 560,
      places_mmopk: 216,
      taux_reussite: 34.8,
      places_med: 113,
      places_pharma: 45,
      places_kine: 15,
      places_odonto: 29,
      places_sage_femme: 14,
      voeux_parcoursup: 21172,
      pct_admission: 2.93
    },
    las: {
      etudiants: 400,
      places_mmopk: 69,
      taux_reussite: 17.3,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "bourgogne-dijon",
    name: "Université de Bourgogne (Dijon)",
    city: "Dijon",
    region: "Bourgogne-Franche-Comté",
    pass: {
      etudiants: 800,
      places_mmopk: 264,
      taux_reussite: 33.0,
      places_med: 133,
      places_pharma: 48,
      places_kine: 44,
      places_odonto: 25,
      places_sage_femme: 14,
      voeux_parcoursup: 35094,
      pct_admission: 2.28
    },
    las: {
      etudiants: 400,
      places_mmopk: 109,
      taux_reussite: 27.2,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "saint-etienne",
    name: "Université Jean Monnet (Saint-Étienne)",
    city: "Saint-Étienne",
    region: "Auvergne-Rhône-Alpes",
    pass: {
      etudiants: 500,
      places_mmopk: 193,
      taux_reussite: 38.6,
      places_med: 113,
      places_pharma: 30,
      places_kine: 36,
      places_odonto: 8,
      places_sage_femme: 6,
      voeux_parcoursup: 22587,
      pct_admission: 2.21
    },
    las: {
      etudiants: 250,
      places_mmopk: 41,
      taux_reussite: 16.6,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "limoges",
    name: "Université de Limoges",
    city: "Limoges",
    region: "Nouvelle-Aquitaine",
    pass: {
      etudiants: 660,
      places_mmopk: 180,
      taux_reussite: 27.3,
      places_med: 93,
      places_pharma: 32,
      places_kine: 33,
      places_odonto: 12,
      places_sage_femme: 10,
      voeux_parcoursup: 21532,
      pct_admission: 3.07
    },
    las: {
      etudiants: 300,
      places_mmopk: 58,
      taux_reussite: 19.5,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "rouen",
    name: "Université de Rouen Normandie",
    city: "Rouen",
    region: "Normandie",
    pass: {
      etudiants: 631,
      places_mmopk: 198,
      taux_reussite: 31.4,
      places_med: 105,
      places_pharma: 45,
      places_kine: 15,
      places_odonto: 20,
      places_sage_femme: 13,
      voeux_parcoursup: 13705,
      pct_admission: 4.60
    },
    las: {
      etudiants: 252,
      places_mmopk: 55,
      taux_reussite: 21.8,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "tours",
    name: "Université de Tours",
    city: "Tours",
    region: "Centre-Val de Loire",
    pass: {
      etudiants: 815,
      places_mmopk: 264,
      taux_reussite: 32.4,
      places_med: 136,
      places_pharma: 48,
      places_kine: 39,
      places_odonto: 25,
      places_sage_femme: 16,
      voeux_parcoursup: 16884,
      pct_admission: 4.83
    },
    las: {
      etudiants: 300,
      places_mmopk: 97,
      taux_reussite: 32.3,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "IDEM"
  },
  {
    id: "besancon",
    name: "Université de Franche-Comté (Besançon)",
    city: "Besançon",
    region: "Bourgogne-Franche-Comté",
    pass: {
      etudiants: 593,
      places_mmopk: 229,
      taux_reussite: 38.6,
      places_med: 123,
      places_pharma: 35,
      places_kine: 40,
      places_odonto: 18,
      places_sage_femme: 13,
      voeux_parcoursup: 16796,
      pct_admission: 3.53
    },
    las: {
      etudiants: 359,
      places_mmopk: 55,
      taux_reussite: 15.3,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "antilles",
    name: "Université des Antilles",
    city: "Pointe-à-Pitre",
    region: "DOM-TOM",
    pass: {
      etudiants: 937,
      places_mmopk: 136,
      taux_reussite: 14.5,
      places_med: 85,
      places_pharma: 20,
      places_kine: 16,
      places_odonto: 5,
      places_sage_femme: 10,
      voeux_parcoursup: 8528,
      pct_admission: 10.99
    },
    las: {
      etudiants: 200,
      places_mmopk: 41,
      taux_reussite: 20.5,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "LAS"
  },
  {
    id: "brest",
    name: "Université de Bretagne Occidentale (Brest)",
    city: "Brest",
    region: "Bretagne",
    pass: {
      etudiants: 720,
      places_mmopk: 199,
      taux_reussite: 27.6,
      places_med: 130,
      places_pharma: 15,
      places_kine: 19,
      places_odonto: 23,
      places_sage_femme: 12,
      voeux_parcoursup: 19584,
      pct_admission: 3.68
    },
    las: {
      etudiants: 200,
      places_mmopk: 11,
      taux_reussite: 5.3,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "amiens",
    name: "Université de Picardie Jules Verne (Amiens)",
    city: "Amiens",
    region: "Hauts-de-France",
    pass: {
      etudiants: 862,
      places_mmopk: 246,
      taux_reussite: 28.5,
      places_med: 136,
      places_pharma: 39,
      places_kine: 35,
      places_odonto: 22,
      places_sage_femme: 14,
      voeux_parcoursup: 17919,
      pct_admission: 4.81
    },
    las: {
      etudiants: 230,
      places_mmopk: 47,
      taux_reussite: 20.4,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "corse",
    name: "Université de Corse",
    city: "Corte",
    region: "Corse",
    pass: {
      etudiants: 160,
      places_mmopk: 33,
      taux_reussite: 20.6,
      places_med: 33,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0,
      voeux_parcoursup: 844,
      pct_admission: 18.96
    },
    las: {
      etudiants: 50,
      places_mmopk: 15,
      taux_reussite: 30.0,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "LAS"
  },
  {
    id: "reunion",
    name: "Université de La Réunion",
    city: "Saint-Denis",
    region: "DOM-TOM",
    pass: {
      etudiants: 790,
      places_mmopk: 116,
      taux_reussite: 14.7,
      places_med: 60,
      places_pharma: 20,
      places_kine: 16,
      places_odonto: 10,
      places_sage_femme: 10,
      voeux_parcoursup: 7295,
      pct_admission: 10.83
    },
    las: {
      etudiants: 200,
      places_mmopk: 10,
      taux_reussite: 4.8,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "angers",
    name: "Université d'Angers",
    city: "Angers",
    region: "Pays de la Loire",
    pass: {
      etudiants: 825,
      places_mmopk: 185,
      taux_reussite: 22.4,
      places_med: 110,
      places_pharma: 39,
      places_kine: 13,
      places_odonto: 10,
      places_sage_femme: 14,
      voeux_parcoursup: 3463,
      pct_admission: 23.83
    },
    las: {
      etudiants: 260,
      places_mmopk: 66,
      taux_reussite: 25.4,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "orleans",
    name: "Université d'Orléans",
    city: "Orléans",
    region: "Centre-Val de Loire",
    pass: {
      etudiants: 160,
      places_mmopk: 103,
      taux_reussite: 64.4,
      places_med: 48,
      places_pharma: 0,
      places_kine: 55,
      places_odonto: 0,
      places_sage_femme: 0,
      voeux_parcoursup: 9619,
      pct_admission: 1.66
    },
    las: {
      etudiants: 100,
      places_mmopk: 16,
      taux_reussite: 15.6,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  },
  {
    id: "guyane",
    name: "Université de Guyane",
    city: "Cayenne",
    region: "DOM-TOM",
    pass: {
      etudiants: 140,
      places_mmopk: 32,
      taux_reussite: 22.9,
      places_med: 22,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 10,
      voeux_parcoursup: 643,
      pct_admission: 21.77
    },
    las: {
      etudiants: 50,
      places_mmopk: 4,
      taux_reussite: 8.6,
      places_med: 0,
      places_pharma: 0,
      places_kine: 0,
      places_odonto: 0,
      places_sage_femme: 0
    },
    recommended_path: "PASS"
  }
];
