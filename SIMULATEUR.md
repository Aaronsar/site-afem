# Simulateur Parcoursup (`/simulateur`)

Simulateur de vœux Parcoursup sans compte : profil → jusqu'à 10 vœux (toutes
filières) → probabilité par vœu, chance d'avoir au moins une proposition,
vœux de sécurité. Les données sont lues **en direct** dans l'open data
officielle Parcoursup. Il n'y a pas d'API Parcoursup « privée » : c'est le
portail open data du ministère (Opendatasoft v2.1, CORS ouvert, ~5 000
requêtes/jour/IP, cache navigateur 24 h).

## Fichiers

| Fichier | Rôle |
|---|---|
| `js/psup/psup-config.js` | **Tout ce qui peut changer** : jeux de données, alias de champs, familles de formations, spécialités, paramètres du modèle |
| `js/psup/psup-api.js` | Client open data : détection des sessions, recherche catalogue, stats multi-sessions, estimation par prédécesseurs |
| `js/psup/psup-model.js` | Calcul de probabilité |
| `js/simulateur.js` | Interface (3 étapes) |
| `css/simulateur.css` | Styles |
| `api/save-simulation.js` | Lead (formulaire) → CRM Diploma (`AFEM_WEBHOOK_TOKEN`) |

## Sources de données

- `fr-esr-parcoursup` : stats d'admission de la **dernière session publiée**
  (places, classés, rang du dernier appelé, mentions, type de bac, part de
  l'académie…).
- `fr-esr-parcoursup_{année}` : sessions précédentes (lissage sur 3 ans).
- `fr-esr-cartographie_formations_parcoursup` : **offre de l'année en cours**.
  Elle contient les nouvelles formations même sans stats.

Rien n'est codé en dur : la dernière session et l'année du catalogue sont
détectées à chaque visite. Quand le ministère publie une nouvelle session,
le simulateur la prend automatiquement.

## Le modèle (résumé)

Barre = 30e percentile des notes des admis (d'après leurs mentions au bac),
relevée si le taux d'accès < 10 %. Le score de l'élève est la moyenne pondérée
générale/spécialités, ajustée selon les spécialités et l'option maths attendues
par la famille. On applique ensuite le facteur type de bac (taux de proposition
de son type de bac / taux global) et le plafond hors secteur (familles à
priorité géographique). Bornes : 2 %–95 % par vœu, 99 % pour la chance globale.
C'est une estimation, et la page le dit.

## Réforme santé 2027 : que faire ?

À la rentrée 2027, le PASS et la L.AS sont remplacés par une voie unique
(appellation prévue : « licence portail santé », vœu principal + sous-vœu
disciplinaire). Le simulateur est prévu pour :

1. **Pendant Parcoursup 2027** (catalogue 2027 publié, aucune stat pour les
   nouvelles formations) : la famille `acces-sante` reconnaît déjà
   « portail santé », « accès santé », « LSPS ». Une formation sans stats est
   estimée à partir des PASS et L.AS **du même établissement** (UAI, sinon nom
   d'université, sinon département), avec un badge « Estimation » et une
   explication.
2. **À vérifier dès la publication du catalogue 2027** (décembre 2026 environ) :
   - le libellé (`nm`), le code (`nmc`) et la catégorie (`tf`) des nouvelles
     formations dans `fr-esr-cartographie_formations_parcoursup` ;
   - si besoin, adapter `match` et `catalogWhere` de la famille `acces-sante`
     dans `psup-config.js`, et `catalogFili` si une nouvelle valeur `fili`
     apparaît.
   Test rapide : onglet « Santé » de l'étape 2, les nouvelles formations doivent
   apparaître, et un vœu doit afficher « Estimation ».
3. **Après la session 2027** (stats publiées vers l'automne 2027) : ajouter la
   nouvelle valeur `fili` dans `statsFilieres` de `acces-sante`. Les vraies stats
   remplacent alors l'estimation automatiquement.
4. **Sous-vœux** : si Parcoursup publie des stats par sous-vœu disciplinaire,
   elles apparaîtront comme des formations distinctes (codes `gta`), donc
   sélectionnables telles quelles.

## Si l'open data change

- **Colonne renommée** : ajouter le nouveau nom **en tête** de la liste
  correspondante dans `CONFIG.fields` (ex. `tx: ['taux_acces_ens', 'taux_adm_psup']`).
- **Jeu de données renommé** : `CONFIG.datasets`.
- **Plus de 10 vœux / autre règle** : `CONFIG.maxVoeux`.

## Vérifier rapidement que tout répond

```bash
curl -s "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-parcoursup/records?select=session&group_by=session"
curl -s "https://data.enseignementsup-recherche.gouv.fr/api/explore/v2.1/catalog/datasets/fr-esr-cartographie_formations_parcoursup/records?select=annee&group_by=annee&order_by=annee%20desc&limit=1"
```
