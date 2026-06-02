# Intégration CRM AFEM — Formulaire Résultats Parcoursup 2026

Ce document décrit comment **brancher le CRM interne AFEM** pour recevoir les soumissions du formulaire `/resultats-parcoursup-2026`.

## Architecture actuelle

```
[ Élève ]
   │
   │ POST JSON
   ▼
[ /api/save-parcoursup ]  ← fonction serverless Vercel (api/save-parcoursup.js)
   │
   ├──→ INSERT  →  Supabase.parcoursup_submissions  (source de vérité)
   │
   └──→ POST    →  CRM_WEBHOOK_URL                  (optionnel, si configuré)
                   ↓
                   met à jour forwarded_to_crm = true
```

Les soumissions sont **toujours** enregistrées dans Supabase. Le forward CRM est **best-effort** : si l'endpoint CRM échoue, la soumission est conservée dans Supabase pour relecture/réessai manuel.

## Ce dont j'ai besoin de la part du dev CRM

Pour brancher le CRM, le dev doit fournir :

| Donnée | Description | Exemple |
|---|---|---|
| `CRM_WEBHOOK_URL` | URL HTTPS qui reçoit le POST JSON | `https://crm.afem-edu.fr/api/webhooks/parcoursup` |
| `CRM_WEBHOOK_TOKEN` | Token Bearer pour authentification (optionnel mais recommandé) | `afem_crm_xxxxxxxxxxxxxxx` |
| Format attendu | Si le CRM attend un format spécifique différent de celui ci-dessous, me le préciser | voir section suivante |

Une fois ces 2 variables ajoutées dans **Vercel → Settings → Environment Variables** du projet `site-afem`, le forward est automatique. Aucun changement de code nécessaire de mon côté.

## Format du payload envoyé au CRM

`POST {CRM_WEBHOOK_URL}` avec `Authorization: Bearer {CRM_WEBHOOK_TOKEN}` (si configuré) et `Content-Type: application/json`.

Body JSON :

```json
{
  "submission_id": "uuid-genere-par-supabase",
  "subject_id": null,
  "prenom": "Marie",
  "nom": "Dupont",
  "email": "marie.dupont@email.fr",
  "telephone": "0612345678",
  "classe_actuelle": "terminale",
  "departement": "75",
  "source": "afem-edu.fr",
  "utm_source": "facebook",
  "utm_medium": "cpc",
  "utm_campaign": "parcoursup-juin-2026",
  "q1_proposition": "oui",
  "q1_formations": [
    "PASS - Université Paris Cité (Paris)",
    "LAS - Université Claude Bernard Lyon 1 (Lyon, Villeurbanne)"
  ],
  "q1_va_valider": "pas-encore",
  "q3_voeux": [
    {
      "formation": "PASS - Sorbonne Université (Paris)",
      "mineure": "option Chimie (site de Lyon)",
      "rang": 850,
      "rang_dernier_admis": 1135
    },
    {
      "formation": "LAS - Université de Bordeaux (Bordeaux)",
      "mineure": "Majeure SVTU",
      "rang": 1240,
      "rang_dernier_admis": 1980
    }
  ],
  "submission_mode": "full",
  "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...",
  "ip_address": "192.0.2.1"
}
```

### Champs détaillés

| Champ | Type | Toujours présent | Description |
|---|---|---|---|
| `submission_id` | string (UUID) | oui | ID Supabase, utile comme clé d'idempotence |
| `subject_id` | string \| null | non | UUID externe si le lien arrive d'un CRM externe (ignoré côté AFEM pour l'instant) |
| `prenom`, `nom` | string | oui | Identité de l'élève (saisie dans le form, ou pré-remplie via URL) |
| `email` | string | oui | Email validé côté serveur, normalisé en lowercase |
| `telephone` | string \| null | oui (form rend obligatoire) | Format brut tel que saisi (peut contenir espaces, points, indicatifs) |
| `classe_actuelle` | string \| null | oui | Une des valeurs : `terminale`, `cesure`, `reorientation`, `autre` |
| `departement` | string \| null | oui | Code département : `01` à `95`, `2A`, `2B`, `971`-`976`, ou `etranger` |
| `source` | string | oui | Toujours `"afem-edu.fr"` |
| `utm_source/medium/campaign` | string \| null | non | Si l'URL contenait des UTM (campagne Meta, mail, etc.) |
| `q1_proposition` | `"oui"` \| `"non"` \| null | oui | Réponse à "As-tu reçu une proposition d'admission ?" |
| `q1_formations` | string[] | oui | Liste des formations pour lesquelles l'élève a une proposition (0-3) |
| `q1_va_valider` | string \| null | non | Formation que l'élève compte valider, OU `"pas-encore"` si indécis |
| `q3_voeux` | object[] | oui | Vœux en attente avec rangs (0-10) |
| `q3_voeux[].formation` | string | - | Label complet : `"TYPE - Université (Ville)"` |
| `q3_voeux[].mineure` | string | - | Mineure PASS ou majeure LAS, peut être vide |
| `q3_voeux[].rang` | integer \| null | - | Rang de l'élève dans le classement de la fac |
| `q3_voeux[].rang_dernier_admis` | integer \| null | - | Rang du dernier admis en 2025 (référence) |
| `submission_mode` | `"full"` \| `"early"` | oui | `"early"` = l'élève a validé une proposition à l'étape 2 sans aller au bout. `"full"` = soumission complète. |
| `user_agent` | string \| null | non | User-Agent du navigateur |
| `ip_address` | string \| null | non | IP cliente (first X-Forwarded-For) |

### Codes de retour attendus

| HTTP | Sens |
|---|---|
| `200` ou `201` | Lead enregistré ✓ — la submission est marquée `forwarded_to_crm = true` côté Supabase |
| `4xx` | Erreur de validation côté CRM. La submission reste en Supabase avec `forwarded_to_crm = false`, pour reprise manuelle. |
| `5xx` ou timeout (>5s) | Erreur serveur CRM. Idem, reste à reprendre manuellement. |

> ⚠️ La fonction Vercel n'effectue **pas** de retry automatique. Si tu veux un retry, soit le dev CRM gère côté CRM, soit on ajoute un job de retry dans GitHub Actions (à demander).

## Idempotence / déduplication

Si un même élève soumet le formulaire 2x, **2 lignes distinctes** seront créées dans Supabase et **2 POST** seront envoyés au CRM. Le CRM doit dédupliquer côté son (par `email` + `created_at` proche, ou par `submission_id` si conservé).

## Test rapide côté CRM

Pour tester le format avant intégration, lancer cette commande locale :

```bash
curl -X POST https://crm.afem-edu.fr/api/webhooks/parcoursup \
  -H "Authorization: Bearer ${CRM_WEBHOOK_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "submission_id": "test-00000000-0000-0000-0000-000000000000",
    "prenom": "Test",
    "nom": "Marie",
    "email": "test@afem-edu.fr",
    "telephone": "0612345678",
    "source": "afem-edu.fr",
    "q1_proposition": "oui",
    "q1_formations": ["PASS - Université Paris Cité (Paris)"],
    "q1_va_valider": "pas-encore",
    "q3_voeux": [
      {
        "formation": "PASS - Sorbonne Université (Paris)",
        "mineure": "",
        "rang": 850,
        "rang_dernier_admis": 1135
      }
    ],
    "submission_mode": "full"
  }'
```

## Consulter / exporter les soumissions

En attendant l'intégration CRM (ou pour audit) :

- Dashboard Supabase → table `parcoursup_submissions` → bouton "Export CSV"
- SQL direct dans le SQL Editor :
  ```sql
  select created_at, prenom, nom, email, telephone, q1_proposition, q3_voeux
  from parcoursup_submissions
  order by created_at desc
  limit 50;
  ```
- Filtrer les non-forwarded (à pousser manuellement au CRM le temps de l'intégration) :
  ```sql
  select * from parcoursup_submissions
  where forwarded_to_crm = false
  order by created_at desc;
  ```

## Sécurité

- La clé `SUPABASE_SERVICE_ROLE_KEY` est dans Vercel env vars uniquement. Jamais côté client.
- RLS activée sur la table : la clé `anon` (publique) ne peut **rien lire ni écrire**.
- L'endpoint `/api/save-parcoursup` accepte uniquement les origines `*.afem-edu.fr`, `*.vercel.app`, et `localhost` (pour dev).
- Validation stricte des champs côté serveur : email regex, longueurs, types, max 10 vœux.
- Pas de stockage de cookies / localStorage côté client.

## Contact

Côté technique : voir le repo `Aaronsar/site-afem`, fichier `api/save-parcoursup.js`.
