# SIMU — Simulateur de prêt

Un simulateur de prêt hypothécaire adaptatif pour estimer les mensualités, le coût total du crédit et consulter un tableau d’amortissement mois par mois.

**Dernière mise à jour: Vendredi Oct 2 15:02:54 2026**

## Fichier de rendu

Les bundles sont disponibles en téléchargement dans ce dépôt (candidat-PATERSON.bundle et candidat-PATERSON.bundle.sha256).

## Prérequis

- Node.js 18.17 ou version ultérieure
- SDK .NET 8
- Yarn 1.22 ou version ultérieure

## Installation et lancement

```sh
git clone https://github.com/jlp-io/frontend-interview-coding-exercise-main.git
yarn install
yarn dev
```

`yarn dev` lance le frontend Next.js à l’adresse [http://localhost:3000](http://localhost:3000) et l’API ASP.NET Core sur `http://localhost:5080`. `yarn build` compile l’API et crée une version de production du frontend. `yarn start` lance les deux services en mode production (exécutez d’abord la commande de compilation).

## Fonctionnalités

- Modifiez le capital emprunté, la durée, le revenu annuel et le mois de la première échéance. L’API sélectionne les taux annuel et mensuel fixes selon des tranches de revenus configurables.
- Consultez la mensualité, le total des intérêts, le montant total remboursé et un graphique de l’évolution du solde.
- Parcourez le tableau d’amortissement et exportez l’échéancier complet au format CSV, avec des points-virgules comme séparateurs.
- Interface adaptative pour ordinateur et mobile.

## Hypothèses de calcul

Le backend est la source de référence pour la validation, la sélection du taux et les calculs. Les tranches de taux se trouvent dans `backend/Simu.Api/appsettings.json`. Le taux mensuel défini dans la tranche fait foi : il n’est pas recalculé à partir du taux annuel. Les calculs utilisent le type `decimal` de .NET; les valeurs renvoyées sont arrondies au centime, avec arrondi à la moitié supérieure. Consultez la [note de choix techniques](NOTE_CHOIX_TECHNIQUES.md).

## API

L’API versionnée expose `GET http://localhost:5080/api/v1/rules` pour les bornes de saisie et `POST http://localhost:5080/api/v1/simulations` pour calculer une simulation. Sa spécification OpenAPI se trouve dans [docs/openapi.yaml](docs/openapi.yaml).

## Tests

Exécutez `yarn test:api` pour lancer les tests unitaires du backend et `yarn test:e2e` pour les deux scénarios de test dans le navigateur. Installez une fois le navigateur Playwright avec `yarn playwright install chromium`. `yarn build` compile le frontend.
