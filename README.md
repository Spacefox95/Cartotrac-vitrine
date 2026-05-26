
```md
# Cartotrac

Plateforme web Cartotrac :
- site vitrine
- intranet sécurisé
- gestion clients
- gestion devis
- évolutions futures : drones, missions, comptabilité, prévisualisation 3D, IGN, cadastre

## Démarrage rapide

Base de données :
`make up`

Backend :
`cd cartotrac-backend`
`cp .env.example .env`
`poetry install`
`poetry run uvicorn src.main:app --reload --host 127.0.0.1 --port 8000`

Frontend :
`cd cartotrac-frontend`
`cp .env.example .env`
`npm install`
`npm run dev`

## CI/CD

Le repo embarque maintenant :

- une CI GitHub Actions pour le frontend et le backend
- une CD GitHub Actions `staging` / `production`
- un packaging de release avec manifeste
- un déploiement SSH optionnel via environnements GitHub

Référence :
`docs/architecture/cicd.md`

## Dossier projet

Un dossier de preuves projet est disponible dans `docs/projet` :

- cadrage et périmètre
- conception et décisions d'architecture
- accessibilité et limites connues
- sécurité justifiée
- stratégie de tests
- validation de déploiement

Point d'entrée :
`docs/projet/README.md`
