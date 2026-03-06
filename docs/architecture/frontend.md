# Frontend

Le frontend Cartotrac est développé avec :

- React 19
- TypeScript
- Vite
- Redux Toolkit
- Material UI

---

# Installation


cd cartotrac-frontend
npm install


---

# Lancer le frontend


npm run dev


Application disponible :


http://localhost:5173


---

# Structure


src/

app/
store/
router/

features/
auth/
clients/
quotes/
dashboard/

shared/
api/
components/
utils/


---

# Communication API

Toutes les requêtes utilisent :


/api/v1


Authentification :


Authorization: Bearer <token>