#!/usr/bin/env python3
"""
Génère js/simulateur-data.js — données du simulateur Parcoursup santé.

Source : open data MESR (data.enseignementsup-recherche.gouv.fr)
  - fr-esr-parcoursup                       → stats d'admission par formation
  - fr-esr-cartographie_formations_parcoursup → libellé exact (option PASS / portail LAS)

Usage (à relancer chaque année quand la session N est publiée, ~septembre) :
  python3 scripts/build-simulateur-data.py 2025
"""
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path

SESSION = sys.argv[1] if len(sys.argv) > 1 else "2025"
API = "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/{}/exports/json?"
OUT = Path(__file__).resolve().parent.parent / "js" / "simulateur-data.js"

UNIV_ALIAS = {
    "Universite Jean Monnet, Saint-Etienne": "Université Jean Monnet Saint-Étienne",
    "Université Bourgogne Europe (ex université de Bourgogne)": "Université Bourgogne Europe",
    "Université de Bourgogne Europe (ex UB)": "Université Bourgogne Europe",
    "Université de Rennes (EPE)": "Université de Rennes",
    "Sorbonne université": "Sorbonne Université",
    "Université Paris- Est-Créteil Val de Marne": "Université Paris-Est Créteil",
    "Université de la Réunion": "Université de La Réunion",
    "Université de Montpellier, Antenne de Nîmes": "Université de Montpellier (Nîmes)",
    "Unité de Formation et de Recherche de Sciences de l' Université de Versailles Saint Quentin en Yvelines": "Université de Versailles (UVSQ)",
    "Université de Versailles": "Université de Versailles (UVSQ)",
    "PASS Aubenas – Université Claude Bernard Lyon 1": "Université Claude Bernard Lyon 1",
    "IUT Lyon1 Site de Bourg-en-Bresse": "Université Claude Bernard Lyon 1",
    "Université Angers-Campus de Cholet": "Université d'Angers",
    "Université Angers": "Université d'Angers",
    "Université de Perpignan": "Université de Perpignan Via Domitia",
    "Université de Cergy-Pontoise": "CY Cergy Paris Université",
    "Université de Corte": "Université de Corse",
    "Université du littoral": "Université du Littoral Côte d'Opale",
}


IDF = ("Paris", "Créteil", "Versailles")


def fetch(dataset, where, select=None):
    q = {"where": where}
    if select:
        q["select"] = select
    url = API.format(dataset) + urllib.parse.urlencode(q)
    with urllib.request.urlopen(url, timeout=180) as r:
        return json.load(r)


def clean(s):
    return re.sub(r"\s+", " ", (s or "")).strip(" -:")


def option_label(row, nm):
    """Option PASS ('Sciences de la vie') ou portail LAS ('Droit')."""
    if row["fili"] == "PASS":
        m = re.search(r"\(PASS\)\s*-\s*(?:option\s*)?(.+)$", nm or "", re.I)
        return clean(m.group(1)) if m else ""
    base = clean(row.get("fil_lib_voe_acc"))
    det = clean(row.get("detail_forma"))
    if det and det.lower() not in base.lower() and not det.startswith(":"):
        return f"{base} — {det}"
    return base


def num(v):
    return None if v is None else (int(v) if float(v).is_integer() else round(float(v), 1))


def main():
    rows = fetch("fr-esr-parcoursup", f"session={SESSION} and (fili='PASS' or fili='Licence_Las')")
    carto = fetch(
        "fr-esr-cartographie_formations_parcoursup",
        "search(nm,'santé') or search(nm,'PASS') or search(nm,'LAS')",
        "annee,gta,nm",
    )
    labels = {}
    for c in carto:
        k = str(c["gta"])
        if k not in labels or c["annee"] > labels[k][0]:
            labels[k] = (c["annee"], (c["nm"] or [""])[0])

    out = []
    for r in rows:
        if not r.get("acc_tot") or not r.get("nb_cla_pp"):
            continue
        u = clean(r["g_ea_lib_vx"].split(" - ")[0])
        u = UNIV_ALIAS.get(u, u)
        nm = labels.get(str(r["cod_aff_form"]), (0, ""))[1]
        out.append([
            r["cod_aff_form"],
            "PASS" if r["fili"] == "PASS" else "LAS",
            u,
            re.sub(r"\s+\d+(?:e|er)\s+Arrondissement$", "", clean(r["ville_etab"])),
            option_label(r, nm),
            r["acad_mies"],
            num(r["capa_fin"]),
            num(r["nb_cla_pp"]),
            num(r["ran_grp1"]),
            num(r["taux_acces_ens"]),
            [num(r[k]) or 0 for k in ("pct_sansmention", "pct_ab", "pct_b", "pct_tb", "pct_tbf")],
            # Île-de-France = un seul secteur PASS/L.AS : on prend la part IDF
            num(r["pct_aca_orig_idf"] if r["acad_mies"] in IDF else r["pct_aca_orig"]),
            num(r["pct_bours"]),
        ])
    out.sort(key=lambda x: (x[1], x[2], x[4]))

    header = (
        f"/* Généré par scripts/build-simulateur-data.py — Parcoursup session {SESSION}.\n"
        " * Source : open data MESR (fr-esr-parcoursup). Ne pas éditer à la main.\n"
        " * Colonnes : cod, type, universite, ville, option, academie, capacite, classes,\n"
        " *            rang_dernier_appele, taux_acces, mentions_admis[sans,AB,B,TB,TBF], pct_meme_academie, pct_boursiers */\n"
    )
    OUT.write_text(
        header
        + f"window.SIMU_SESSION={SESSION};\nwindow.SIMU_DATA="
        + json.dumps(out, ensure_ascii=False, separators=(",", ":"))
        + ";\n",
        encoding="utf-8",
    )
    print(f"{len(out)} formations → {OUT} ({OUT.stat().st_size // 1024} Ko)")


if __name__ == "__main__":
    main()
