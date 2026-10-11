# Synapse Medical documentation website — common tasks.
# Run "make" or "make help" to list the targets.
#
# Content source (see scripts/sync-content.sh):
#   make dev SYNAPSE_DIR=../symfony-docker   # live editing of a local checkout
#   make build SYNAPSE_REF=main              # docs/ cloned from another branch

SYNAPSE_DIR ?=
SYNAPSE_REF ?= develop

export SYNAPSE_REF
ifneq ($(SYNAPSE_DIR),)
export SYNAPSE_DIR
endif

.DEFAULT_GOAL := help
.PHONY: help install sync dev build preview clean refresh deploy-dev deploy-prod deploy-check login whoami

## —— Synapse Medical documentation ——————————————————————————————————————
help: ## Outputs this help screen
	@grep -h -E '(^[a-zA-Z0-9_./-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-16s\033[0m %s\n", $$1, $$2}' | \
	sed -e 's/\[32m##/[33m/'

## —— Development ————————————————————————————————————————————————————————
install: ## Install the npm dependencies from package-lock.json
	npm ci

sync: ## Link src/content/docs to the docs/ content (SYNAPSE_DIR or SYNAPSE_REF)
	sh scripts/sync-content.sh

dev: ## Start the dev server with live reload (http://localhost:4321)
	npm run dev

build: ## Build the static site into dist/
	npm run build

preview: build ## Build, then serve dist/ locally
	npm run preview

clean: ## Remove build output, caches and the cloned content
	rm -rf dist .astro .wrangler .synapse src/content/docs

refresh: clean ## Re-clone the docs/ content from SYNAPSE_REF, then build
	npm run build

## —— Cloudflare Workers ————————————————————————————————————————————————————
login: ## Log in to Cloudflare (wrangler)
	npx wrangler login

whoami: ## Show the Cloudflare account wrangler is logged in to
	npx wrangler whoami

deploy-check: build ## Build and validate both deployments without uploading
	npx wrangler deploy --dry-run --env=""
	npx wrangler deploy --dry-run --env dev

deploy-dev: build ## Build and deploy to https://dev-docs.synapse-medical.fr
	sh scripts/deploy.sh dev

deploy-prod: build ## Build and deploy to https://docs.synapse-medical.fr
	sh scripts/deploy.sh prod
