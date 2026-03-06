# Base de données

Cartotrac utilise PostgreSQL.

---

# Tables principales

### users


id
email
hashed_password
full_name


---

### clients


id
company_name
contact_name
email
phone


---

### quotes


id
reference
client_id
status
total_ht
total_ttc


---

# Migrations

Gestion des migrations avec Alembic.

Appliquer migrations :


make migrate


Créer migration :


make makemigration m="description"