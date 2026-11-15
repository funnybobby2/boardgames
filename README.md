# Funny games 🎲

Catalogue de ma collection de jeux de société : recherche, filtres (joueurs, durée, âge, catégories, déjà joué, à vendre), fiche détaillée avec vidéo des règles, et un mode admin pour noter, modifier et ajouter des jeux.

**Stack** : React 18 + TypeScript, Vite, MUI, zustand, Supabase (base de données + authentification).

## Démarrer

```bash
npm install
cp .env.example .env   # puis renseigner l'URL et la clé anon Supabase
npm run dev
```

## Scripts

| Commande                  | Rôle                                                                    |
| ---                       | ---                                                                     |
| `npm run dev`             | Serveur de développement                                                |
| `npm run build`           | Typecheck + build de production dans `dist/`                            |
| `npm run preview`         | Sert le build de production en local                                    |
| `npm run lint`            | ESLint (0 warning toléré)                                               |
| `npm test`                | Tests unitaires (Vitest) — `npm run test:watch` en mode watch           |
| `npm run optimize-images` | Redimensionne/recompresse les images de `public/assets` (voir plus bas) |

## Structure

```text
src/
  components/      Topbar (filtres, recherche, login), Content (grille), Card,
                   Disclaimer (fiche d'un jeu), AddGameModal (ajout/édition), VideoPlayer
  store/
    useGamesStore  Jeux chargés depuis Supabase + écritures (mise à jour optimiste avec rollback)
    useGameStore   Filtres, compteurs, état de la vidéo
    useAuthStore   Mode admin
    filters.ts     Type des filtres + synchronisation avec l'URL
  lib/
    supabase.ts    Client Supabase
    gameRow.ts     Correspondance champs TypeScript <-> colonnes de la table `games`
  utils/           filterGames (filtrage/tri/recherche), video
scripts/           optimize-images.mjs
public/assets/     Images des jeux (référencées par le champ `img`)
```

## Supabase

### Table `games`

| Colonne                                   | Type                                              | Champ TS                               |
| ---                                       | ---                                               | ---                                    |
| `id`                                      | integer, identity (généré par la base)            | `id`                                   |
| `title`                                   | text                                              | `title`                                |
| `group`                                   | text                                              | `group` (série, ex. « Exit »)          |
| `nb_user_min` / `nb_user_max`             | integer                                           | `nbUserMin` / `nbUserMax`              |
| `duration`                                | integer (minutes)                                 | `duration`                             |
| `age_min`                                 | integer                                           | `ageMin`                               |
| `category`                                | text[]                                            | `category`                             |
| `resume`                                  | text (HTML, nettoyé avec DOMPurify à l'affichage) | `resume`                               |
| `rule_video_url`                          | text (URL YouTube `/embed/…`, vide si aucune)     | `ruleVideoUrl`                         |
| `img`                                     | text (nom de fichier dans `public/assets`)        | `img`                                  |
| `note`                                    | integer (0–10)                                    | `note`                                 |
| `is_played` / `is_extension` / `for_sale` | boolean                                           | `isPlayed` / `isExtension` / `forSale` |

Pour ajouter une colonne : l'ajouter au type [`Game`](src/types/Game.ts) puis à `GAME_COLUMNS` dans [`gameRow.ts`](src/lib/gameRow.ts) (TypeScript signale l'oubli).

### Sécurité

Le mode admin est activé dès qu'une session Supabase existe. La protection réelle des données repose donc sur Supabase :

- **désactiver les inscriptions** (Authentication > Providers > Email > *Allow new users to sign up*) ;
- **activer la RLS** sur `games` : lecture pour tous, écriture réservée au compte admin.

```sql
alter table games enable row level security;

create policy "Lecture publique" on games
  for select using (true);

create policy "Écriture admin" on games
  for all to authenticated
  using (auth.uid() = '<UUID-du-compte-admin>')
  with check (auth.uid() = '<UUID-du-compte-admin>');
```

## Images

Les images sont dans `public/assets` (certaines dans des sous-dossiers par série, ex. `exit/`), et le champ `img` contient le chemin relatif (`444.webp`, `exit/12.jpg`…).

Après avoir ajouté des images, lancer `npm run optimize-images` : elles sont redimensionnées à 500 px de large maximum et recompressées **en gardant le même nom et le même format** (aucune modification en base). Le script ne réécrit un fichier que s'il gagne au moins 5 %, il peut donc être relancé sans risque.

## Filtres dans l'URL

Les filtres sont reflétés dans l'URL pour pouvoir partager un lien ou recharger la page :

```text
?q=exit&played=0&players=2&duration=45&age=8&sort=desc&sale=1&cat=Coopératif&cat=Enquête
```

| Paramètre  | Valeurs                                                      |
| ---        | ---                                                          |
| `q`        | texte recherché (titre, série, catégories ; accents ignorés) |
| `played`   | `1` déjà joué, `0` jamais joué                               |
| `players`  | `1` solo, `2` duel, `3` multi                                |
| `duration` | durée max : `15`, `30`, `45`, `60`, `90`                     |
| `age`      | âge min : `5`, `8`, `12`, `16`                               |
| `sort`     | `desc` meilleures notes d'abord, `asc` l'inverse             |
| `sale`     | `1` jeux à vendre                                            |
| `cat`      | catégorie (répétable : le jeu doit les avoir toutes)         |
