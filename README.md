# SportSee — Front-end

Tableau de bord d'analytique sportive (projet 12 OpenClassrooms).
Affiche pour un utilisateur donné son activité quotidienne, la durée
moyenne de ses sessions, son profil de performance, son score du jour
et ses macronutriments.

## Stack

- React 18 + Vite (plugin `@vitejs/plugin-react`, sans React Compiler)
- React Router 6 (`react-router-dom`)
- D3.js pour les calculs (scales, easings, génération d'axes et d'arcs)
- Sass (`.scss`) pour le style — pas de framework UI
- Graphiques SVG dessinés à la main, pas de Recharts

## Prérequis

- Node 18 ou plus récent
- npm (ou yarn)

## Installation et lancement (front-end)

```bash
git clone https://github.com/<ton-user>/SportSee-front-end.git
cd SportSee-front-end
npm install
npm run dev
```

L'app tourne sur `http://localhost:5173` par défaut. Le port est affiché
dans la console quand Vite démarre.

Build de production : `npm run build`, puis `npm run preview` pour
vérifier le bundle localement.

## Back-end (optionnel)

Le front fonctionne **sans back-end** grâce aux données mockées dans
`src/data/mockData.js`. C'est suffisant pour développer, présenter le
projet, ou utiliser l'app sans connexion réseau.

Pour brancher le vrai back-end (micro API Node fournie par OpenClassrooms) :

1. Cloner le repo back-end à côté :
   ```bash
   git clone https://github.com/OpenClassrooms-Student-Center/SportSee.git
   cd SportSee
   npm install
   npm run dev
   ```
2. Vérifier que `http://localhost:3000/user/12` renvoie du JSON.
3. Dans le front, cliquer sur "Accueil" dans le header pour basculer
   en mode API (le badge passe de MOCK à API).

**Note Windows / PowerShell** : le `package.json` du back-end utilise
`node_modules/.bin/nodemon` qui n'est pas exécutable directement sous
PowerShell. Édite la ligne du script `dev` pour la remplacer par
`nodemon app/index.js` — npm trouve `nodemon` tout seul dans
`node_modules/.bin/`.

## Switch Mock ↔ API

Deux méthodes :

**À chaud, depuis l'interface.** Cliquer sur "Accueil" dans le header.
Le badge à côté indique la source active. Le choix est persisté en
`localStorage` (clé `sportSee:apiSource`) — il survit aux reloads.

**Par défaut au démarrage, dans le code.** Ouvrir `src/services/api.js`
et modifier la constante en tête de fichier :

```js
const DEFAULT_API_SOURCE = "real"; // ← active par défaut
// const DEFAULT_API_SOURCE = "mock";
```

Le défaut ne s'applique que si rien n'est encore en `localStorage`. Pour
forcer le défaut, vider le `localStorage` du domaine ou cliquer une fois
sur le toggle (qui écrasera la valeur stockée).

## Utilisateurs disponibles

Le back-end SportSee ne propose que **deux utilisateurs** : id `12`
(Karl) et id `18` (Cecilia). Le `mockData.js` du front contient les mêmes
deux profils. Tout autre id renvoie un 404 et l'app affiche un message
d'erreur.

Pour naviguer entre les utilisateurs :

- Modifier l'URL : `/user/12` ou `/user/18`
- Ou survoler "Communauté" dans le header et cliquer un prénom — le
  dropdown affiche la liste des users disponibles dans la source active

La route racine `/` redirige automatiquement vers `/user/12`.

## Endpoints API utilisés

| Endpoint                         | Donnée                               |
| -------------------------------- | ------------------------------------ |
| `GET /user/:id`                  | infos perso, score du jour, key data |
| `GET /user/:id/activity`         | poids & calories sur 7 jours         |
| `GET /user/:id/average-sessions` | durée moyenne des sessions par jour  |
| `GET /user/:id/performance`      | radar 6 axes (énergie, endurance, …) |

Les 4 appels sont lancés en parallèle au montage de la page (`useUserData`).

## Architecture front

```
src/
├── components/
│   ├── cards/          KeyDataCard (calories, protéines, glucides, lipides)
│   ├── charts/         ActivityChart, AverageSessionChart,
│   │                   PerformanceChart, ScoreChart
│   └── layout/         Layout, Header, Sidebar
├── data/
│   └── mockData.js     Datasets mockés (USER_MAIN_DATA, USER_ACTIVITY, ...)
├── hooks/
│   ├── useUserData.js        charge les 4 datasets en parallèle
│   ├── useAvailableUsers.js  liste des users pour le dropdown
│   └── useElapsedTime.js     RAF mutualisé pour les animations
├── models/             Couche d'adaptation back-end ↔ composant
├── pages/              Home, NotFound
├── services/
│   └── mockApi.js      Mock + Real + store réactif (source courante)
├── style/              Sass organisé en base / layout / components
├── App.jsx             Routes
└── main.jsx            BrowserRouter
```

### Séparation modèle / vue

Chaque chart consomme un _model_ (ex. `ActivityModel`) plutôt que la
réponse brute du back. Le modèle expose des propriétés calculées
(`kilogramRange`, `sessionLengthRange`, etc.) qui découplent les
composants du shape exact de l'API. Si le back change, on patche le
modèle, les composants ne bougent pas.

### Source d'API

`services/mockApi.js` regroupe :

- les deux implémentations (mock avec latence simulée, real avec `fetch`)
- un mini store module-level (variable + Set de listeners) qui pilote la
  source courante
- un hook `useApiSource()` basé sur `useSyncExternalStore` pour abonner
  n'importe quel composant à ce store

Cette approche évite un Context Provider dans `main.jsx`. Les fonctions
publiques (`getUserMainData`, etc.) dispatchent au moment de l'appel
vers la bonne impl en lisant `currentSource`.

### Animations d'entrée

Un hook unique `useElapsedTime(duration, restartKey)` retourne le temps
écoulé en ms depuis le montage, mis à jour à chaque frame. Les
composants dérivent leurs valeurs visuelles (hauteur de barre, ratio
de sommet, score affiché, compteur) à partir de cet `elapsed`. Pas de
`d3.transition`, pas de cascade de `setState`.

Toutes les animations utilisent `d3.easeCubicOut` pour ralentir à
l'approche de la valeur cible :

- **ActivityChart** : 14 barres en cascade (`stagger = 2s / 14`). Chaque
  barre monte au sommet du chart en 1s puis redescend à sa hauteur réelle
  en 1s.
- **AverageSessionChart** : tracé de la courbe sur 2s (`stroke-dashoffset`).
- **PerformanceChart** : noise sinusoïdal pendant 1.5s puis blend en
  `easeCubicOut` vers les valeurs cibles sur la dernière 0.5s.
- **ScoreChart** : arc 0 → 100% → score réel sur 2s.
- **KeyDataCard** : compteur 0 → valeur sur 2s.

### Tooltip de l'AverageSessionChart

Particularité due au lissage Catmull-Rom : interpoler la valeur du
tooltip depuis la position de la souris sur la courbe produit des durées
négatives pour les jours à 0 min. Solution adoptée :

- la zone de hover est snappée au jour le plus proche via
  `Math.round(xLabelScale.invert(mouseX))`
- le tooltip affiche la valeur **brute** de ce jour (`session.sessionLength`)
- le dot blanc se positionne en `(xLabelScale(day), y_sur_la_courbe)`
  pour s'aligner avec la lettre du jour en bas et rester accroché au tracé
- la courbe garde son `xScale` bord à bord pour le rendu maquette

## Scripts npm

| Commande          | Effet                                |
| ----------------- | ------------------------------------ |
| `npm run dev`     | Vite en mode dev (HMR, port ~5173)   |
| `npm run build`   | Build de production dans `dist/`     |
| `npm run preview` | Sert `dist/` pour vérifier le bundle |
| `npm run lint`    | ESLint sur `src/` (si configuré)     |

## Variables d'environnement

Aucune nécessaire — l'URL du back est hardcodée dans
`services/api.js` (`http://localhost:3000`). Pour pointer ailleurs,
éditer la constante `REAL_API_URL` ou la transformer en
`import.meta.env.VITE_API_URL` selon ton goût.

## Bonnes pratiques de dev

- Tester chaque chart en **mode mock** (rapide, hors-ligne) avant de
  vérifier en mode API.
- Le toggle dans le Header est aussi pratique pour valider qu'un
  changement de back-end n'a pas cassé le rendu.
- Si l'API réelle est éteinte, le front affiche un message d'erreur
  par chart — pas un crash global.

## Évolutions possibles

- Migration TypeScript + `typescript-eslint` (voir le template
  [vite-react-ts](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts)).
- Activation du React Compiler — voir
  [la doc React](https://react.dev/learn/react-compiler/installation).
  Désactivé ici pour garder les temps de build / dev bas.
- Ajout d'autres utilisateurs : étendre `mockData.js` côté front et
  `KNOWN_USER_IDS` dans `hooks/useAvailableUsers.js`.
