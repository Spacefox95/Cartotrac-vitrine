
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