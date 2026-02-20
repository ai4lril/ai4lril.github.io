# ILHRF Data Collection Platform — Makefile
# Run `make help` for available targets

COMPOSE := docker compose
COMPOSE_HTTP2 := $(COMPOSE) -f compose.yml -f compose-http2.yml --profile http2

YB_NODE := ilhrf-yugabyte-node1
YB_BASE := /home/yugabyte/yb_data

.PHONY: help up down up-http2 certs build logs logs-backend logs-frontend ps restart clean
.PHONY: db-inspect db-status db-databases db-tables db-connect db-logs db-migrate-status db-health

help:
	@echo "ILHRF Data Collection Platform"
	@echo ""
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  up          Start stack (HTTP, recommended for dev) — Frontend: http://localhost:5577, API: http://localhost:5566/api"
	@echo "  down        Stop and remove containers"
	@echo "  up-http2    Start stack with HTTP/2 + TLS — https://localhost (run certs first)"
	@echo "  certs       Generate self-signed certs for HTTP/2 dev"
	@echo "  build       Build or rebuild images"
	@echo "  ps          List containers"
	@echo "  logs        Follow logs (all services)"
	@echo "  logs-backend  Follow backend logs"
	@echo "  logs-frontend Follow frontend logs"
	@echo "  restart     Restart stack (down + up)"
	@echo "  clean       Stop and remove containers, networks, volumes"
	@echo ""
	@echo "YugaByteDB diagnostics:"
	@echo "  db-inspect       Inspect container (status, env, ports)"
	@echo "  db-status        Cluster status (yugabyted status)"
	@echo "  db-databases     List databases"
	@echo "  db-tables        List tables in ilhrf_data_collection"
	@echo "  db-connect       Test YSQL connectivity"
	@echo "  db-logs          YugaByteDB container logs (tail 100)"
	@echo "  db-migrate-status  Prisma migration status"
	@echo "  db-health        Run health check (yugabyted + ysqlsh)"

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

certs:
	./scripts/generate-dev-certs.sh

up-http2: certs
	$(COMPOSE_HTTP2) up -d

down-http2:
	$(COMPOSE_HTTP2) down

build:
	$(COMPOSE) build

ps:
	$(COMPOSE) ps -a

logs:
	$(COMPOSE) logs -f

logs-backend:
	$(COMPOSE) logs -f backend

logs-frontend:
	$(COMPOSE) logs -f frontend

restart: down up

clean: down
	$(COMPOSE) down -v 2>/dev/null || true

# YugaByteDB diagnostics
db-inspect:
	docker container inspect $(YB_NODE) --format 'Status: {{.State.Status}} | Running: {{.State.Running}} | Started: {{.State.StartedAt}}'
	@echo "---"
	docker inspect $(YB_NODE) --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -E '^YSQL_|^YB_'

db-status:
	docker exec $(YB_NODE) yugabyted status --base_dir=$(YB_BASE)

db-databases:
	docker exec $(YB_NODE) bin/ysqlsh -h 127.0.0.1 -U yugabyte -d yugabyte -t -c '\l'

db-tables:
	docker exec $(YB_NODE) bin/ysqlsh -h 127.0.0.1 -U yugabyte -d ilhrf_data_collection -t -c '\dt'

db-connect:
	docker exec $(YB_NODE) bin/ysqlsh -h 127.0.0.1 -U yugabyte -d yugabyte -c 'SELECT version()'

db-logs:
	docker logs $(YB_NODE) --tail 100

db-migrate-status:
	docker exec ilhrf-data-backend pnpm exec prisma migrate status

db-health:
	@docker exec $(YB_NODE) sh -c 'yugabyted status --base_dir=$(YB_BASE) 2>/dev/null | grep -q "Status.*Running" && bin/ysqlsh -h 127.0.0.1 -U yugabyte -d yugabyte -c "SELECT 1" 2>/dev/null' && echo "OK" || echo "FAIL"
