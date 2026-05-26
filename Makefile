SHELL := /bin/bash
.DEFAULT_GOAL := start

.PHONY: start dev up down logs db backend frontend migrate makemigration test-back lint-front

start:
	@set -m; \
	docker compose up -d db; \
	(cd cartotrac-backend && if [ -x .venv/bin/uvicorn ]; then .venv/bin/uvicorn src.main:app --reload --host 127.0.0.1 --port 8000; else poetry run uvicorn src.main:app --reload --host 127.0.0.1 --port 8000; fi) & backend_pid=$$!; \
	(cd cartotrac-frontend && npm run dev) & frontend_pid=$$!; \
	trap 'kill $$backend_pid $$frontend_pid 2>/dev/null; wait $$backend_pid $$frontend_pid 2>/dev/null' INT TERM EXIT; \
	wait -n $$backend_pid $$frontend_pid

dev: start

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

db:
	docker compose up -d db

backend:
	cd cartotrac-backend && if [ -x .venv/bin/uvicorn ]; then .venv/bin/uvicorn src.main:app --reload --host 127.0.0.1 --port 8000; else poetry run uvicorn src.main:app --reload --host 127.0.0.1 --port 8000; fi

frontend:
	cd cartotrac-frontend && npm run dev

migrate:
	cd cartotrac-backend && if [ -x .venv/bin/alembic ]; then .venv/bin/alembic upgrade head; else poetry run alembic upgrade head; fi

makemigration:
	cd cartotrac-backend && if [ -x .venv/bin/alembic ]; then .venv/bin/alembic revision --autogenerate -m "$(m)"; else poetry run alembic revision --autogenerate -m "$(m)"; fi

test-back:
	cd cartotrac-backend && if [ -x .venv/bin/pytest ]; then BCRYPT_ROUNDS=4 PYTHONPATH=. .venv/bin/pytest; else BCRYPT_ROUNDS=4 PYTHONPATH=. poetry run pytest; fi

lint-front:
	cd cartotrac-frontend && npm run lint
