# CI/CD Cartotrac

## CI

Le workflow `CI` lance automatiquement :

- le lint frontend
- le type-check frontend
- le build frontend
- le `ruff check` backend
- la compilation Python backend
- les tests backend `pytest`

Fichier : `.github/workflows/ci.yml`

## CD

Le workflow `CD` :

- se déclenche sur `develop` pour `staging`
- se déclenche sur `main` pour `production`
- peut aussi être lancé manuellement avec choix de l'environnement
- reconstruit le frontend et le backend
- produit deux artefacts :
  - `frontend-dist.tar.gz`
  - `backend-release.tar.gz`
- produit aussi un `release.json`
- déploie en SSH si les secrets GitHub sont configurés dans l'environnement GitHub ciblé

Fichier : `.github/workflows/cd.yml`

## Environnements GitHub

La version production de la CD s'appuie sur les environnements GitHub :

- `staging`
- `production`

Chaque environnement peut porter :

- ses propres secrets
- son URL applicative
- ses règles de protection
- son approbation manuelle avant déploiement

Pour une vraie mise en prod, configure une règle d'approbation sur l'environnement `production`.

## Secrets GitHub attendus

- secrets à définir dans `staging` et/ou `production`
- `DEPLOY_HOST`
- `DEPLOY_USER`
- `DEPLOY_PORT`
  Optionnel. Valeur par défaut : `22`
- `DEPLOY_PATH`
  Dossier racine de déploiement sur la machine distante
- `DEPLOY_SSH_KEY`
  Clé privée utilisée par GitHub Actions
- `DEPLOY_POST_COMMAND`
  Optionnel. Commande exécutée après extraction et bascule des symlinks

## Variables GitHub recommandées

- `APP_URL`
  URL publique de l'environnement, affichée dans l'interface GitHub Deployments

## Structure distante créée

Le workflow CD prépare :

- `$DEPLOY_PATH/releases/<git-sha>/frontend/dist`
- `$DEPLOY_PATH/releases/<git-sha>/backend/...`
- `$DEPLOY_PATH/current/frontend`
- `$DEPLOY_PATH/current/backend`

Les chemins `current/*` sont des symlinks vers la release active.

Chaque release contient aussi :

- `$DEPLOY_PATH/releases/<release>/release.json`

## Exemple de post-command

Exemple de valeur pour `DEPLOY_POST_COMMAND` :

```sh
cd /var/www/cartotrac/current/backend && poetry install --no-interaction && sudo systemctl restart cartotrac-backend
```

Adapte cette commande selon ton serveur, ton reverse proxy et la manière dont tu sers le frontend.

## Recommandation prod

Pour un usage production propre :

1. crée les environnements GitHub `staging` et `production`
2. mets les secrets SSH dans chaque environnement
3. ajoute une approbation manuelle sur `production`
4. renseigne `APP_URL` dans chaque environnement
5. teste d'abord un push sur `develop`
