up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

db:
	docker compose up -d db

backend:
	cd cartotrac-backend && poetry run uvicorn src.main:app --reload --host 127.0.0.1 --port 8000

frontend:
	cd cartotrac-frontend && npm run dev

migrate:
	cd cartotrac-backend && poetry run alembic upgrade head

makemigration:
	cd cartotrac-backend && poetry run alembic revision --autogenerate -m "$(m)"

test-back:
	cd cartotrac-backend && poetry run pytest

lint-front:
	cd cartotrac-frontend && npm run lint