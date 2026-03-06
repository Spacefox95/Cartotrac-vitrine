# Cartotrac

Cartotrac est une plateforme web pour une entreprise de services par drone.

Le projet comprend :

- un **site vitrine public**
- un **intranet sécurisé pour les opérations**

Fonctionnalités actuelles :

- authentification sécurisée
- gestion des utilisateurs
- gestion des clients
- gestion des devis

Fonctionnalités prévues :

- planification missions
- prévisualisation 3D
- intégration IGN
- intégration cadastre
- comptabilité

---

# Architecture

Cartotrac est composé de deux applications :


cartotrac/
├── cartotrac-backend
├── cartotrac-frontend
├── docs
├── docker-compose.yml
├── Makefile
└── README.md


Backend :

- FastAPI
- SQLAlchemy 2
- PostgreSQL
- Alembic
- JWT Authentication

Frontend :

- React 19
- TypeScript
- Vite
- Redux Toolkit
- Material UI

---

# Quick Start

## 1. Lancer la base de données


make up


PostgreSQL sera disponible sur :


localhost:5432


---

## 2. Lancer le backend


cd cartotrac-backend
cp .env.example .env
poetry install
poetry run uvicorn src.main:app --reload


API :


http://127.0.0.1:8000


Documentation Swagger :


http://127.0.0.1:8000/docs


---

## 3. Lancer le frontend


cd cartotrac-frontend
cp .env.example .env
npm install
npm run dev


Frontend :


http://localhost:5173


---

# Base de données

Appliquer les migrations :


make migrate


Créer une migration :


make makemigration m="description"


---

# Documentation

Documentation détaillée disponible dans :


docs/


- Authentification : `docs/auth.md`
- Architecture : `docs/architecture.md`

---

# Commandes utiles

Lancer la base :


make up


Arrêter les containers :


make down


Logs :


make logs


Backend :


make backend


Frontend :


make frontend


Tests backend :


make test-back


---

# Roadmap

### Sprint 1

- Auth JWT
- CRUD clients
- CRUD devis
- Dashboard

### Sprint 2

- flotte drones
- missions
- planning

### Sprint 3

- visualisation 3D
- CesiumJS

### Sprint 4

- API cadastre
- API IGN