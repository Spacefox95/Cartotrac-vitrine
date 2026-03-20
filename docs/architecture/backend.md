# Architecture Backend

## Vue d'ensemble

Le backend est une API FastAPI organisee par domaines metier.

Le socle actuel couvre :
- authentification JWT
- verification de session via `/auth/me`
- CRUD clients
- CRUD devis
- endpoint de sante

L'approche retenue reste volontairement simple : chaque domaine expose ses schemas, son service et son router, avec SQLAlchemy pour l'acces base et des dependances FastAPI pour la securite et la session DB.

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

## Structure des domaines

Le backend suit une organisation par domaine dans `src/domains`.

Domaines actuellement exposes :
- `health`
- `auth`
- `clients`
- `quotes`

Reference : [`cartotrac-backend/src/api/router.py`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-backend/src/api/router.py)

## Routeur principal

Le routeur principal agrege les routers de domaine et les expose sous `/api/v1`.

Endpoints actuellement disponibles :
- `/api/v1/health`
- `/api/v1/auth/login`
- `/api/v1/auth/me`
- `/api/v1/clients`
- `/api/v1/quotes`

## Base de donnees

L'application utilise PostgreSQL avec SQLAlchemy.

Pieces principales :
- `core/database.py` pour la dependance DB FastAPI
- `db/session.py` pour l'engine et la session factory
- `db/base.py` pour la base declarative

Modeles actuellement utiles au socle :
- `users`
- `clients`
- `quotes`

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

Le backend utilise un JWT Bearer contenant `sub = email utilisateur`.

Flux actuel :
1. `POST /auth/login`
2. verification de l'utilisateur dans la table `users`
3. verification bcrypt du mot de passe
4. emission d'un access token JWT
5. controle d'acces via `Authorization: Bearer <token>`
6. resolution du profil courant via `/auth/me`

### Composants auth

- `core/security.py`
  fonctions JWT + bcrypt
- `api/dependencies/auth.py`
  extraction et validation du Bearer token
- `domains/auth/service.py`
  authentification applicative
- `domains/users/repository.py`
  lecture utilisateur par email

Reference : [`cartotrac-backend/src/api/dependencies/auth.py`](/home/spacefox_95/projects/Cartotrac-vitrine/cartotrac-backend/src/api/dependencies/auth.py)

### Garantie actuelle

Le login n'est plus un faux login :
- l'email doit exister en base
- le mot de passe doit correspondre au hash stocke
- `/auth/me` recharge l'utilisateur depuis `users`

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

## Schemas et services

Chaque domaine suit actuellement ce decoupage :
- `models.py` pour l'ORM
- `schemas.py` pour les contrats API
- `service.py` pour la logique metier et DB immediate
- `router.py` pour l'exposition HTTP

Le niveau repository n'est pas encore uniformement utilise sur tous les domaines ; il est surtout pertinent aujourd'hui sur `users` pour l'auth.

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

- pas encore de gestion de roles / permissions fines
- pas encore de refresh token
- pas encore de couche repository/service homogeneiisee pour tous les domaines
- pas encore de suite de tests backend representative
- pas encore de gestion avancée des erreurs metier partagees

## Priorites naturelles apres ce socle

- gestion des utilisateurs et administration
- tests backend reels sur auth / clients / quotes
- pagination et filtres plus riches
- logs applicatifs et observabilite
- durcissement des conventions de service / repository
