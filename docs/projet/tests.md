# Strategie de Tests

## Objectif

Cette piece rassemble les preuves de qualite verifiables dans le depot et clarifie ce qui est deja automatise, ce qui releve de la recette, et ce qui manque encore.

## Approche retenue

Le projet combine actuellement :

- des verifications statiques frontend
- des tests d'integration backend sur les droits d'acces et parcours critiques
- une reproduction automatisee dans la CI

L'objectif n'est pas encore une couverture exhaustive, mais une base fiable sur les chemins les plus structurants de la V1.

## Verifications automatisees en place

### Frontend

- `npm run lint`
- `npm run check`
- `npm run build`

Ces commandes verifient la qualite syntaxique, le typage TypeScript et la build de production.

### Backend

- `PYTHONPATH=. pytest src/tests/test_rbac_api.py -q`
- en CI et via `make test-back`, la variable `BCRYPT_ROUNDS=4` est appliquee pour garder des tests rapides tout en conservant un cout plus fort par defaut dans l'application

La suite `test_rbac_api.py` couvre notamment :

- login + `/auth/me`
- role et permissions remontes a l'utilisateur courant
- refus d'acces en cas de permissions insuffisantes
- CRUD selon les droits
- telechargement PDF d'un devis
- synthese dashboard et gestion d'evenements

### CI

Le workflow `CI` reproduit ces verifications sur GitHub Actions pour le frontend et le backend.

## Ce que les tests prouvent deja

- l'authentification n'est pas factice
- le RBAC est controle cote backend
- certains parcours metier critiques repondent avec les bons statuts HTTP
- le frontend reste typable et buildable
- le projet dispose d'une base de validation industrialisable

## Ce qui reste a ajouter

### Backend

- tests CRUD clients et devis plus exhaustifs
- tests d'erreur sur collisions, entites introuvables et donnees invalides
- tests du domaine carto avec reponses mockees
- tests de performance ou a minima de non-regression sur les parcours critiques

### Frontend

- tests composants/pages
- tests de navigation
- tests d'accessibilite automatises
- smoke tests end-to-end

### Recette fonctionnelle

- parcours prospect -> contact/devis
- parcours manager -> client -> devis -> PDF
- parcours admin -> users -> dashboard

## Commandes de reference

Depuis la racine du depot :

```sh
make test-back
cd cartotrac-frontend && npm run lint
cd cartotrac-frontend && npm run check
cd cartotrac-frontend && npm run build
```

## Validation executee le 24 avril 2026

Resultats verifies localement dans ce depot :

- `cartotrac-frontend`: `npm run lint` OK
- `cartotrac-frontend`: `npm run check` OK
- `cartotrac-frontend`: `npm run build` OK
- `cartotrac-backend`: `.venv/bin/ruff check src` OK
- `cartotrac-backend`: `BCRYPT_ROUNDS=4 PYTHONPATH=. .venv/bin/pytest src/tests/test_rbac_api.py -q` OK
- resultat backend constate : `15 passed in 1.09s`

Point d'attention conserve :

- la build frontend remonte encore un avertissement de taille de bundle Vite, sans bloquer la generation des artefacts

## Formulation defendable en soutenance

Le projet ne dispose pas encore d'une suite exhaustive, mais il presente deja une strategie de tests coherente pour une V1 : controles statiques frontend, tests d'integration backend sur les droits et les parcours structurants, et execution automatisee en CI. Le bon discours consiste a montrer la base existante, puis la feuille de route vers les tests front et end-to-end.
