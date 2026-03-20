# Architecture Frontend

## Vue d'ensemble

Le frontend est une application React + Vite qui couvre deux surfaces :
- un site public
- un intranet protege sous `/app`

Le socle actuel privilegie une architecture simple par feature, avec un routage clair, un store Redux limite aux besoins applicatifs principaux, et une couche API centralisee autour d'un client HTTP unique.

## Stack technique

- React 19
- TypeScript
- Vite
- React Router
- Redux Toolkit
- MUI
- Axios
- Zod

## Point d'entree

Le point d'entree est [`cartotrac-frontend/src/main.tsx`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-frontend/src/main.tsx).

Initialisation actuelle :
- montage React via `createRoot`
- chargement des styles globaux
- enrobage de l'application par `AppProviders`
- rendu du routeur applicatif `AppRouter`

## Composition applicative

`AppProviders` assemble les couches transverses dans cet ordre :
1. store Redux
2. bootstrap de session auth
3. theme MUI
4. snackbar / feedback UI

Reference : [`cartotrac-frontend/src/app/providers/AppProviders.tsx`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-frontend/src/app/providers/AppProviders.tsx)

## Routage

Le routeur principal fusionne deux groupes :
- routes publiques
- routes privees

Reference : [`cartotrac-frontend/src/app/router/index.tsx`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-frontend/src/app/router/index.tsx)

### Routes publiques

Les pages publiques couvrent la vitrine et les pages legales.

### Routes privees

Les routes privees sont montees sous `/app` et passees par `AuthGuard`.

Routes intranet actuelles :
- `/app/dashboard`
- `/app/clients`
- `/app/clients/new`
- `/app/clients/:clientId`
- `/app/clients/:clientId/edit`
- `/app/quotes`
- `/app/quotes/new`
- `/app/quotes/:quoteId`
- `/app/quotes/:quoteId/edit`

Reference : [`cartotrac-frontend/src/app/router/privateRoutes.tsx`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-frontend/src/app/router/privateRoutes.tsx)

## Authentification

Le frontend repose sur un JWT Bearer stocke en local storage.

Flux actuel :
1. login via `POST /auth/login`
2. stockage du token
3. bootstrap de session via `GET /auth/me`
4. ouverture des routes privees si la session est valide

Composants clefs :
- `AuthBootstrap`
- `AuthGuard`
- `authSlice`
- `shared/api/http.ts`
- `shared/api/authStorage.ts`

Comportement attendu :
- si un token persiste au reload, le frontend valide la session avant d'afficher l'intranet
- si `/auth/me` echoue, la session locale est videe

## Gestion d'etat

Le store Redux reste volontairement compact.

Slices actuellement en place :
- `auth`
- `clients`
- `quotes`

Reference : [`cartotrac-frontend/src/app/store/rootReducer.ts`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-frontend/src/app/store/rootReducer.ts)

### Ce qui va dans Redux

- etat de session
- listes chargees depuis l'API
- etats de chargement et d'erreur par domaine

### Ce qui reste local aux composants

- etat des formulaires
- navigation d'ecran
- erreurs ponctuelles d'action

## Organisation par feature

Le code applicatif est organise par domaine fonctionnel dans `src/features`.

Features principales actuellement implementees :
- `auth`
- `clients`
- `quotes`
- `dashboard`
- `public`

Structure courante d'une feature :
- `api/`
- `components/`
- `pages/`
- `schemas/`
- `store/`
- `types/`

## Couche API

Le frontend utilise un client Axios unique avec :
- `baseURL` issue de `VITE_API_URL`
- injection automatique du header `Authorization: Bearer ...`

Conventions actuelles :
- un fichier API par feature pour les appels metier
- normalisation minimale des payloads au plus pres de l'appel HTTP
- les listes retournent `{ items, total, limit, offset }`

## Clients

Le domaine `clients` supporte actuellement :
- liste
- recherche simple
- creation
- detail
- edition
- suppression

La suppression peut echouer si le client est rattache a des devis ; le frontend affiche alors l'erreur backend.

## Devis

Le domaine `quotes` supporte actuellement :
- liste
- recherche simple par reference
- creation
- detail
- edition
- suppression

Le formulaire de devis depend de la liste des clients pour selectionner le `client_id`.

## Styles et UI

Le projet utilise MUI pour les composants d'interface et un theme applicatif centralise.

Les styles globaux restent legers :
- theme via `app/theme`
- SCSS global via `styles/`

## Variables d'environnement

Variables frontend actuellement utilisees :
- `VITE_APP_NAME`
- `VITE_API_URL`

Le typage Vite est centralise dans [`cartotrac-frontend/src/vite-env.d.ts`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-frontend/src/vite-env.d.ts)

## Conventions actuelles

- les appels reseau passent par la couche `api/` des features
- les formulaires utilisent Zod pour la validation locale
- les pages d'intranet restent fines et deleguent aux composants de feature
- le store Redux reste reserve aux etats partageables
- les routes privees vivent toutes sous `/app`

## Limites connues

- pas encore de code splitting significatif, le bundle Vite remonte un warning de taille
- pas encore de gestion complete des roles utilisateurs
- pas encore de dashboard metier branche sur des indicateurs reels
- pas encore de composants design system mutualises pour tous les formulaires

## Priorites naturelles apres ce socle

- dashboard branche sur des donnees reelles
- gestion des utilisateurs et administration
- pagination et filtres avances sur clients et devis
- deconnexion explicite et gestion de session plus complete
- documentation produit et technique complementaire
