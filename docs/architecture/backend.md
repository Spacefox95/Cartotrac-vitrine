# Architecture Backend

## Vue d'ensemble

Le backend est une API FastAPI organisee en couches.

Le socle actuel couvre :
- authentification JWT
- refresh tokens persistants et rotatifs
- roles applicatifs et permissions fines par domaine
- verification de session via `/auth/me`
- CRUD clients
- CRUD devis
- gestion des demandes de devis publiques
- dashboard, taches, evenements, notifications et messages
- endpoint de sante

L'approche retenue reste volontairement simple : les routes HTTP restent dans la couche API, les managers portent la logique applicative, les schemas Pydantic decrivent les contrats d'entree/sortie, et la couche `db` regroupe les models SQLAlchemy ainsi que les repositories.

## Stack technique

- Python 3.12
- FastAPI
- SQLAlchemy ORM
- Alembic
- PostgreSQL
- python-jose pour les JWT
- bcrypt pour le hash/verif mot de passe
- Pydantic / pydantic-settings

## Point d'entree

Le point d'entree est [`cartotrac-backend/src/main.py`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-backend/src/main.py).

Initialisation actuelle :
- creation de l'application FastAPI
- ajout du middleware CORS
- montage du routeur principal sous `settings.api_v1_prefix`
- branchement du `lifespan`

## Configuration

La configuration applicative est centralisee dans [`cartotrac-backend/src/core/config.py`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-backend/src/core/config.py).

Parametres majeurs :
- nom de l'application
- prefix API v1
- CORS autorises
- connexion PostgreSQL
- secret JWT
- duree de vie des tokens

## Architecture En Couches

Le backend suit une organisation par couche dans `src`.

Structure principale :
- `api/routes` : endpoints FastAPI et traduction HTTP des erreurs applicatives
- `api/dependencies` : dependances FastAPI d'authentification et d'autorisation
- `managers` : logique applicative et orchestration metier
- `schemas` : schemas Pydantic exposes par l'API
- `db/models` : models SQLAlchemy relies aux tables
- `db/repositories` : requetes SQLAlchemy et acces persistance
- `renderers` : generation de contenus techniques, par exemple PDF
- `core` : configuration, securite, permissions et cycle de vie
- `common` : briques transverses partagees

Reference : [`cartotrac-backend/src/api/router.py`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-backend/src/api/router.py)

## Routeur principal

Le routeur principal agrege les routers de `api/routes` et les expose sous `/api/v1`.

Endpoints actuellement disponibles :
- `/api/v1/health`
- `/api/v1/auth/login`
- `/api/v1/auth/refresh`
- `/api/v1/auth/logout`
- `/api/v1/auth/me`
- `/api/v1/carto`
- `/api/v1/clients`
- `/api/v1/dashboard`
- `/api/v1/quote-requests`
- `/api/v1/quotes`
- `/api/v1/users`

## Base de donnees

L'application utilise PostgreSQL avec SQLAlchemy.

Pieces principales :
- `core/database.py` pour la dependance DB FastAPI
- `db/session.py` pour l'engine et la session factory
- `db/base.py` pour la base declarative
- `db/models/*` pour les mappings SQLAlchemy
- `db/repositories/*` pour les acces aux donnees

Modeles actuellement utiles au socle :
- `users`
- `refresh_token_sessions`
- `clients`
- `quote_requests`
- `quotes`
- `dashboard_tasks`
- `dashboard_events`
- `dashboard_notifications`

## Alembic

Alembic est configure dans :
- [`cartotrac-backend/alembic.ini`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-backend/alembic.ini)
- [`cartotrac-backend/alembic/env.py`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-backend/alembic/env.py)

Etat actuel :
- migration `clients` presente
- migration `quotes` presente
- metadata branchee sur `Base.metadata`

Note importante : la base de dev avait deja un etat anterieur hors historique courant. Le socle actuel a ete aligne avec la tete de migration presente dans le repo.

## Authentification

### Principe

Le backend utilise un access token JWT Bearer contenant `sub = email utilisateur`, complete par un refresh token opaque stocke en base sous forme hashee.

Flux actuel :
1. `POST /auth/login`
2. verification de l'utilisateur dans la table `users`
3. verification bcrypt du mot de passe
4. emission d'un access token JWT et d'un refresh token opaque
5. controle d'acces via `Authorization: Bearer <token>`
6. resolution du profil courant via `/auth/me`
7. renouvellement via `POST /auth/refresh`
8. revocation de session via `POST /auth/logout`

Les refresh tokens sont persistés dans `refresh_token_sessions`. Ils sont hashes, expirables, revocables et rotatifs : chaque refresh invalide l'ancien jeton et emet une nouvelle paire access/refresh.

### Composants auth

- `core/security.py`
  fonctions JWT + bcrypt
- `api/dependencies/auth.py`
  extraction et validation du Bearer token
- `managers/auth.py`
  authentification applicative
- `db/repositories/users.py`
  lecture utilisateur par email

Reference : [`cartotrac-backend/src/api/dependencies/auth.py`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-backend/src/api/dependencies/auth.py)

### Garantie actuelle

Le login n'est plus un faux login :
- l'email doit exister en base
- le mot de passe doit correspondre au hash stocke
- `/auth/me` recharge l'utilisateur depuis `users`
- `/auth/refresh` refuse les refresh tokens inconnus, expires ou deja revoques

## Roles et permissions

Les roles applicatifs sont centralises dans `core/permissions.py`.

Roles disponibles :
- `admin`
- `manager`
- `sales`
- `viewer`

Les permissions sont rattachees aux domaines fonctionnels :
- `users:manage`
- `dashboard:read`
- `dashboard:manage`
- `messages:read`
- `messages:write`
- `carto:read`
- `clients:read`
- `clients:write`
- `quotes:read`
- `quotes:write`
- `quote_requests:read`
- `quote_requests:write`

Les routers utilisent `require_permission(...)` pour declarer explicitement la permission attendue par endpoint. Par exemple, l'administration du contenu dashboard depend de `dashboard:manage` et non plus de `users:manage`.

## CORS

Le middleware CORS est actif dans `main.py`.

Origines de dev actuellement autorisees :
- `http://127.0.0.1:5173`
- `http://localhost:5173`

L'objectif est de permettre au frontend Vite de consommer l'API locale sans blocage navigateur.

## Domaine clients

Le domaine `clients` expose un CRUD complet protege.

Capacites actuelles :
- liste paginee simple
- recherche textuelle
- lecture par identifiant
- creation
- modification partielle
- suppression

Comportement metier notable :
- la suppression renvoie une erreur metier si le client est encore rattache a des devis
- cette situation est traduite en `409 Conflict`

## Domaine devis

Le domaine `quotes` expose un CRUD complet protege.

Capacites actuelles :
- liste paginee simple
- recherche par reference
- filtre par statut
- filtre par client
- lecture par identifiant
- creation
- modification partielle
- suppression

Comportements metier notables :
- creation / edition refusent un `client_id` inexistant
- les references de devis doivent etre uniques
- les collisions de reference sont traduites en erreur metier `400`

## Schemas, repositories et services

Chaque domaine suit actuellement ce decoupage :
- `models.py` pour l'ORM
- `schemas.py` pour les contrats API
- `repository.py` pour l'acces base direct
- `service.py` pour la logique metier et l'orchestration transactionnelle
- `router.py` pour l'exposition HTTP

Les domaines `auth`, `users`, `clients`, `quotes`, `quote_requests` et `dashboard` disposent maintenant d'une couche repository. Les services restent responsables des validations metier, des commits/rollbacks et de la traduction en schemas de lecture.

## Reponses et erreurs

Etat actuel :
- erreurs geres au niveau router par traduction des `ValueError`
- mapping HTTP explicite (`404`, `400`, `401`, `409`)
- pas encore de couche d'erreur metier centralisee pleinement exploitee

## Seed de dev

La base de dev contient actuellement un socle minimal :
- utilisateurs administrateur
- clients de demonstration
- devis de demonstration

Ce seed sert surtout a rendre l'intranet exploitable immediatement en local.

## Conventions actuelles

- tous les endpoints metier sont exposes sous `/api/v1`
- les routers proteges utilisent `Depends(get_current_user)`
- le JWT porte l'email utilisateur comme sujet
- les services portent la logique metier courte et directe
- la validation de donnees entre par les schemas Pydantic

## Limites connues

- pas encore de suite de tests backend representative
- pas encore de gestion avancée des erreurs metier partagees

## Priorites naturelles apres ce socle

- tests backend reels sur auth / clients / quotes
- pagination et filtres plus riches
- logs applicatifs et observabilite
- durcissement des conventions de service / repository
