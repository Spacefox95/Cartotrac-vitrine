# Conception

## Vue d'ensemble

Cartotrac repose sur une architecture web separee :

- un frontend React/Vite pour l'interface publique et l'intranet
- un backend FastAPI pour la logique metier, la securite et l'acces aux donnees
- une base PostgreSQL geree par SQLAlchemy et Alembic

Cette separation permet de faire evoluer independamment l'interface, l'API et la persistence tout en gardant des contrats clairs.

## Decisions de conception principales

### 1. Architecture multicouche

Le backend est organise par domaines metier avec, selon les cas :

- `router.py` pour l'exposition HTTP
- `schemas.py` pour les contrats d'entree/sortie
- `service.py` pour la logique metier
- `models.py` pour l'ORM

Ce choix rend le code plus lisible qu'une organisation purement technique quand on raisonne par fonctionnalite.

### 2. Separation site public / intranet

Le frontend porte deux surfaces distinctes :

- les routes publiques pour la vitrine et les mentions legales
- les routes privees sous `/app` pour les usages internes

Cette separation simplifie le cadrage des usages et le controle d'acces.

### 3. RBAC simple et comprehensible

Le projet retient un modele de roles simple :

- `admin`
- `manager`
- `sales`
- `viewer`

Les permissions associees sont centralisees dans le backend puis exposees au frontend pour piloter la navigation et les ecrans.

### 4. Base relationnelle unique

PostgreSQL a ete retenu comme base unique de la V1 pour :

- garantir la coherence transactionnelle
- simplifier le modele de donnees
- garder un historique de schema via Alembic

Le projet ne met pas encore en oeuvre de composant NoSQL. Il faut l'assumer explicitement en soutenance plutot que de le laisser entendre.

### 5. Deploiement par artefacts versionnes

Le workflow CD produit :

- un artefact frontend
- un artefact backend
- un manifeste `release.json`

Le serveur cible active une release via des symlinks `current/*`, ce qui facilite la lisibilite d'une release et la gestion d'un rollback operable.

## Flux metier principal

1. Un besoin arrive par le site public ou par un contact direct.
2. Un utilisateur interne se connecte a l'intranet.
3. Il qualifie le contexte client.
4. Il exploite le module carto/cadastre pour documenter la demande.
5. Il cree ou met a jour un devis.
6. Le devis peut etre exporte en PDF et suivi dans le tableau de bord.

## Schema logique simplifie

```text
Prospect/Client
  -> Client
  -> Quote
      -> cadastre_context

User
  -> role
  -> permissions derivees

Dashboard
  -> tasks
  -> events
  -> notifications
```

## Surfaces techniques couvertes

### Backend

- authentification JWT
- RBAC par permissions
- CRUD clients
- CRUD devis
- export PDF
- dashboard interne
- administration utilisateurs
- endpoints carto/cadastre

### Frontend

- site public
- login et bootstrap de session
- gardes de routes
- pages clients
- pages devis
- dashboard
- administration utilisateurs
- module cadastre

## Choix de conception a pouvoir defendre devant un jury

### Pourquoi un JWT sur cette V1

Le JWT simplifie une API stateless et un frontend separe. Le choix reste pertinent pour une V1 interne, mais il doit etre accompagne d'une discussion honnete sur le stockage du jeton et le durcissement necessaire avant exposition publique sensible.

### Pourquoi un backend par domaines

Ce choix facilite la maintenance fonctionnelle, la lecture du code et la montee en charge progressive du projet sans imposer une architecture trop lourde.

### Pourquoi PostgreSQL + Alembic

Le couple repond bien a un besoin de donnees structurees, de migrations tracees et de coherence sur des entites metier classiques comme utilisateurs, clients, devis et evenements.

## Limites de conception assumees

- pas de NoSQL dans le perimetre courant
- pas encore de couche repository homogenisee partout
- observabilite et journalisation applicative encore a renforcer
- securite de session a durcir pour une production ouverte
- accessibilite encore documentee sous forme de pre-audit, pas d'audit RGAA complet
