# Validation de Deploiement

## Objectif

Cette note documente le niveau reel de preparation au deploiement de Cartotrac et la facon de le valider sans sur-promesse.

## Ce qui est deja industrialise

### CI

Le workflow `CI` verifie :

- lint frontend
- type-check frontend
- build frontend
- lint backend via `ruff`
- compilation Python
- tests backend

### CD

Le workflow `CD` prepare une release avec :

- choix automatique `staging` ou `production`
- artefact `frontend-dist.tar.gz`
- artefact `backend-release.tar.gz`
- manifeste `release.json`
- deploiement SSH optionnel via secrets d'environnement GitHub

### Structure de release

Le serveur cible conserve des releases versionnees puis active la release courante par symlink :

- `releases/<release>/frontend`
- `releases/<release>/backend`
- `current/frontend`
- `current/backend`

Cette approche facilite :

- la tracabilite
- la verification d'une release
- un rollback operable

## Ce qui peut etre presente comme "valide"

### Valide au niveau depot

- pipeline CI/CD present
- packaging de release documente
- prerequis de deploiement identifies
- variables et secrets attendus explicitement listes
- build frontend et validations backend prevues dans la pipeline

## Validation technique executee le 24 avril 2026

La chaine locale de pre-validation a ete rejouee avec succes sur le depot :

- lint frontend OK
- type-check frontend OK
- build frontend OK
- lint backend `ruff` OK
- tests backend OK

Cette validation permet d'affirmer que le projet est packageable et deployable au niveau depot. Elle ne remplace pas une recette sur un environnement `staging` reel.

### Non valide tant qu'aucun environnement n'est prouve

- disponibilite effective d'un serveur cible
- configuration reverse proxy
- HTTPS reel
- supervision de production
- sauvegardes et restauration
- recette post-deploiement sur une URL publique

## Procedure de validation recommandee avant demonstration

1. Executer les verifications locales de qualite.
2. Verifier que la base de donnees est disponible et migree.
3. Lancer la CI sur une branche dediee.
4. Generer les artefacts de release.
5. Deployer sur `staging`.
6. Jouer une recette smoke.
7. N'autoriser `production` qu'apres validation humaine.

## Recette smoke post-deploiement

- l'URL publique frontend repond
- l'API `/api/v1/health` repond
- la connexion fonctionne
- un utilisateur non admin ne voit pas les routes admin
- la liste clients charge
- la liste devis charge
- le PDF d'un devis est telechargeable

## Formulation defendable en soutenance

Cartotrac n'est pas seulement "deployable en theorie" : le depot contient deja une vraie chaine CI/CD, un packaging de release, une separation `staging/production` et une procedure de bascule par artefacts. En revanche, il faut rester precis : sans preuve d'un environnement distant effectivement configure et recette, on parle d'un deploiement prepare et validable, pas d'une production deja homologuee.
