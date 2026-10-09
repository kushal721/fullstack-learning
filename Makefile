# Shortcuts for everyday tasks. Each target calls an npm script or Docker,
# so package.json stays the single source of truth (CI and git hooks use the
# same npm scripts). `make` is optional: every command also works with npm.

IMAGE ?= fullstack-learning

.DEFAULT_GOAL := help
.PHONY: help install dev check format lint typecheck validate test build \
	docker-build docker-run docker-dev docker-prod docker-down clean

help: ## List the available targets
	@awk 'BEGIN {FS = ":.*## "} /^[a-z-]+:.*## / {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install dependencies exactly as in package-lock.json
	@npm ci

dev: ## Run the API (:3000) and client (:5173) with reload
	@npm run dev

check: ## Run every CI check: format, lint, types, content, tests, build
	@npm run check

format: ## Format all files with Prettier
	@npm run format

lint: ## Lint the whole repo with ESLint
	@npm run lint

typecheck: ## Type-check every workspace
	@npm run typecheck

validate: ## Check learning content ids and references
	@npm run validate

test: ## Run all tests
	@npm test

build: ## Build client and server for production
	@npm run build

docker-build: ## Build the production Docker image
	@docker build -t $(IMAGE) .

docker-run: docker-build ## Run the production image on http://localhost:3000
	@docker run --rm -p 3000:3000 $(IMAGE)

docker-dev: ## Run the dev stack in Docker (client :5173, API :3000)
	@docker compose up

docker-prod: ## Run the production image with Compose on http://localhost:8080
	@docker compose --profile prod up --build app

docker-down: ## Stop the Docker Compose services
	@docker compose --profile prod down

clean: ## Delete build output and test coverage
	@rm -rf client/dist server/dist client/coverage server/coverage
