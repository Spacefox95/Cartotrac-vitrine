# Backend

Le backend Cartotrac est une API REST développée avec FastAPI.

Technologies principales :

- FastAPI
- SQLAlchemy 2
- PostgreSQL
- Alembic
- JWT

---

# Installation


cd cartotrac-backend
cp .env.example .env
poetry install


---

# Lancer le serveur


poetry run uvicorn src.main:app --reload


API disponible :


http://127.0.0.1:8000


Documentation Swagger :


http://127.0.0.1:8000/docs


---

# Migrations

Appliquer migrations :


make migrate


Créer migration :


make makemigration m="message"


---

# Organisation des domaines

Chaque domaine suit la structure :


domain/
├── models.py
├── schemas.py
├── repository.py
├── service.py
└── router.py


Rôles :

models → SQLAlchemy  
schemas → validation Pydantic  
repository → accès base  
service → logique métier  
router → endpoints API