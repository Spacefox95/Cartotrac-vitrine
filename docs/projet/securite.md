# Securite Justifiee

## Objectif

Cette note explique les mecanismes de securite deja en place, les choix retenus sur la V1 et les points de durcissement encore necessaires avant une exposition plus sensible.

## Mesures actuellement en place

### Authentification

- login reel cote backend
- emission d'un JWT signe
- expiration du jeton
- endpoint `/auth/me` pour recharger le profil courant

### Protection des mots de passe

- hashage `bcrypt`
- verification cote serveur uniquement

### Autorisation

- roles applicatifs simples : `admin`, `manager`, `sales`, `viewer`
- permissions derivees centralisees dans `src/core/permissions.py`
- controle d'acces cote backend par dependance `require_permission(...)`
- miroir cote frontend pour masquer les zones non autorisees

### Protection API

- CORS limite aux origines de developpement locales
- validation d'entree par Pydantic cote backend
- validation de formulaires par Zod cote frontend
- erreurs HTTP explicites selon les cas d'echec

### Donnees et architecture

- acces base via SQLAlchemy et sessions encadrees
- migrations tracees avec Alembic
- appels carto externes realises depuis le backend, pas directement depuis le navigateur pour la logique metier principale

## Justification des choix V1

### JWT Bearer

Le JWT simplifie le fonctionnement d'une API separee du frontend et permet une session stateless simple a comprendre et a deployer. C'est un choix raisonnable pour une V1 ou un intranet leger.

### RBAC simple

Un modele de permissions fin mais lisible permet de repondre vite au besoin metier sans construire une usine a gaz IAM trop tot.

### Validation double front/back

La validation frontend ameliore l'experience utilisateur, tandis que la validation backend reste la source de verite pour proteger l'application.

## Risques connus et dette de securite

### Stockage du token en `localStorage`

Le projet stocke actuellement le jeton dans `localStorage`. Ce choix est acceptable pour une V1 interne ou un prototype, mais il augmente l'exposition en cas de faille XSS.

### Secret applicatif par defaut

La configuration contient une valeur par defaut `change-me`. Elle doit obligatoirement etre remplacee par un secret robuste via l'environnement avant tout deploiement reel.

### Session perfectible

Le projet ne montre pas encore :

- rotation de refresh token
- revocation de session
- cookie `HttpOnly`
- journalisation securite
- limitation de tentatives de connexion

### Observabilite securite encore legere

Les logs, alertes et procedures d'incident ne sont pas encore formalisés dans le depot.

## Mesures minimales avant mise en production publique

1. Forcer un `SECRET_KEY` non par defaut et des variables d'environnement completes.
2. Passer `app_debug` a `false` hors developpement.
3. Etudier un passage vers session `HttpOnly` ou un schema plus robuste de gestion de session.
4. Ajouter des logs securite et une trace des actions sensibles.
5. Definir une politique de rotation et de suppression des comptes internes.

## Formulation defendable en soutenance

La securite de Cartotrac n'est pas un simple argument marketing : l'application met deja en oeuvre authentification reelle, hashage mot de passe, permissions, validations d'entree et cloisonnement frontend/backend. En revanche, le niveau de durcissement vise aujourd'hui une V1 structuree ; une mise en production ouverte demande encore un renforcement de la gestion de session, des secrets et de l'observabilite.
