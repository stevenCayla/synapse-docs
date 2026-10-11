# Synapse Medical documentation website — common tasks.
# Run "make" or "make help" to list the targets.
#
# The pages in src/content/docs/ are a snapshot of the application's docs/
# folder (except audit/, maintained here). Refresh it with:
#   make sync SYNAPSE_DIR=../symfony-docker  # from a local checkout
#   make sync SYNAPSE_REF=main               # from a branch of the application

SYNAPSE_DIR ?=
SYNAPSE_REF ?= develop

export SYNAPSE_REF
ifneq ($(SYNAPSE_DIR),)
export SYNAPSE_DIR
endif

.DEFAULT_GOAL := help
.PHONY: help install sync archive dev build preview clean deploy-dev deploy-prod deploy-check login whoami

## —— Synapse Medical documentation ——————————————————————————————————————
help: ## Outputs this help screen
	@grep -h -E '(^[a-zA-Z0-9_./-]+:.*?##.*$$)|(^##)' $(MAKEFILE_LIST) | \
	awk 'BEGIN {FS = ":.*?## "}{printf "\033[32m%-16s\033[0m %s\n", $$1, $$2}' | \
	sed -e 's/\[32m##/[33m/'

## —— Development ————————————————————————————————————————————————————————
install: ## Install the npm dependencies from package-lock.json
	npm ci

sync: ## Refresh src/content/docs from the application's docs/ (SYNAPSE_DIR or SYNAPSE_REF)
	sh scripts/sync-content.sh

archive: ## Archive the current docs as version VERSION=x.y (at release time, before syncing the next version)
	@test -n "$(VERSION)" || { echo "Usage: make archive VERSION=x.y" >&2; exit 1; }
	sh scripts/archive-version.sh $(VERSION)

dev: ## Start the dev server with live reload (http://localhost:4321)
	npm run dev

build: ## Build the static site into dist/
	npm run build

preview: build ## Build, then serve dist/ locally
	npm run preview

clean: ## Remove build output, caches and the temporary clone
	rm -rf dist .astro .wrangler .synapse

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
