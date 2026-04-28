# Daily Article Bot — AFEM

Robot qui publie automatiquement **1 article par jour** sur le site AFEM, avec garantie **SEO ≥ 80** et **GEO ≥ 80** (mêmes scores que le panneau admin).

## Comment ça marche

1. **Cron quotidien** déclenché par GitHub Actions (`.github/workflows/daily-article.yml`).
2. Le bot :
   - Choisit un sujet non publié dans `topics.json`.
   - Génère un article structuré (blocs CMS) avec **Claude Opus 4.6** (adaptive thinking).
   - **Score SEO + GEO** avec `seo-geo-scorer.mjs` (port Node fidèle de `js/admin-seo-geo.js`).
   - Si l'un des scores < 80 → renvoie à Claude la liste des manques pour correction. **Max 3 essais.**
   - Lance une **passe d'humanisation** (varie la longueur des phrases, supprime les tics IA, ajoute des cas concrets).
   - Re-score après humanisation (repli sur version brute si humanisation a dégradé).
   - **Insère dans Supabase** (`page_content`) avec `visible = true` et `publication_date = aujourd'hui`.
3. Si après 3 essais le score reste < 80 → l'article est sauvegardé en **brouillon** (`visible = false`) pour relecture manuelle dans `/admin`.

Pas besoin de redéploiement Vercel : le rendu est dynamique (`js/dynamic-page.js`) → l'article apparaît immédiatement sur `https://www.afem-edu.fr/articles/<slug>`.

## Setup (une seule fois)

### 1. Ajouter les secrets GitHub

Dans `Settings → Secrets and variables → Actions → New repository secret`, ajouter :

| Nom | Valeur |
|---|---|
| `ANTHROPIC_API_KEY` | Clé API Anthropic — créer sur https://console.anthropic.com |
| `SUPABASE_URL` | `https://jhopwqpbaiyjfoggvcaf.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé **service_role** (pas anon !) — Supabase → Project Settings → API → `service_role` secret |

⚠️ **Important** : utiliser la clé `service_role`, pas la clé `anon`. Elle a les droits d'écriture nécessaires et ne doit JAMAIS être committée ni utilisée côté client.

### 2. Vérifier la table `page_content`

Le bot insère ces colonnes : `page_slug`, `page_type`, `title`, `meta_description`, `subtitle`, `category`, `excerpt`, `sections`, `faq`, `focus_keyword`, `seo_score`, `geo_score`, `publication_date`, `visible`, `updated_at`.

Toutes existent déjà puisque le panneau admin les utilise.

### 3. Premier test (dry-run)

Dans GitHub : `Actions → Daily Article Bot → Run workflow → dry_run: true`.

Le bot va générer + scorer + humaniser un article, sans rien écrire dans Supabase. Vérifie les logs.

### 4. Activation

Le cron tourne ensuite **automatiquement chaque jour à 06:30 UTC** (≈ 08:30 heure de Paris en été).

Pour changer l'horaire, édite la ligne `cron: '30 6 * * *'` dans `.github/workflows/daily-article.yml` (format cron UTC).

## Utilisation locale

```bash
cd scripts
npm install

# Test sans rien publier
ANTHROPIC_API_KEY=sk-ant-... \
SUPABASE_URL=https://....supabase.co \
SUPABASE_SERVICE_ROLE_KEY=eyJ... \
  npm run bot:dry

# Vraie publication
npm run bot
```

## Gérer les sujets

Édite `scripts/topics.json`. Format :

```json
{
  "slug": "articles/mon-nouveau-sujet",
  "title": "Mon nouveau sujet (45-70 caracteres ideal)",
  "category": "pass-las",
  "focus_keyword": "mon mot cle"
}
```

Catégories valides : `pass-las`, `parcoursup`, `prepa`, `orientation`, `methode`, `vie-etudiante`, `debouches`.

Le bot pioche aléatoirement dans les 8 premiers sujets non encore publiés (à chaque exécution). Quand un slug existe déjà dans `page_content`, il est ignoré → tu ne risques pas de doublon.

## Coût indicatif

- 1 génération + 1 humanisation par jour ≈ **15 000–25 000 tokens output** sur Claude Opus 4.6.
- Coût par article : **environ 0,30–0,60 USD**.
- Si un article rate son score 80/80 et nécessite 3 essais : multiplier par ~3 ce jour-là.

## Fichiers

```
scripts/
├── daily-article-bot.mjs      # Script principal
├── seo-geo-scorer.mjs         # Mirror Node.js du scorer admin
├── topics.json                # 100 sujets pre-charges
├── package.json               # Dependences
└── README.md                  # Ce fichier

.github/workflows/
└── daily-article.yml          # Cron GitHub Actions
```

## Debug

Si le bot échoue : `Actions → Daily Article Bot → dernière exécution → ouvrir les logs`. Les erreurs courantes :

- **`SUPABASE_URL manquante`** → secret pas configuré sur GitHub.
- **`401 invalid api key`** → `ANTHROPIC_API_KEY` invalide ou expirée.
- **`Score 80/80 non atteint`** → article sauvegardé en brouillon (`visible=false`). Va dans `/admin` pour le retoucher manuellement, ou améliore le prompt dans `daily-article-bot.mjs` (`buildGenerationSystemPrompt`).
- **`Tous les sujets sont deja publies`** → ajoute de nouveaux sujets dans `topics.json`.
