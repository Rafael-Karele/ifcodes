# IF Codes

Plataforma de programacao competitiva com correcao automatica de codigo, desenvolvida como projeto integrador do IFMOC.

## Tecnologias

| Camada | Stack |
|---|---|
| Frontend | React 19, TypeScript, Vite, TailwindCSS 4 |
| Backend | Laravel 10, PHP 8.4, Sanctum |
| Banco de dados | PostgreSQL 16 |
| Judge | Judge0 (self-hosted) |
| Jam Sessions | WebSocket sidecar (Node.js 20, Express, ws) |
| Email (dev) | Mailpit |
| Cache/Filas | Redis |
| Infra | Docker Compose |

## Estrutura do repositorio

```
ifcodes/
├── back/src/          # Laravel API
├── front/             # React SPA
├── jam-server/        # WebSocket sidecar para Jam Sessions
├── docs/              # Documentacao (CD, melhorias futuras)
├── .github/workflows/ # CI/CD pipelines
├── docker-compose.yml          # Ambiente de desenvolvimento
└── docker-compose.prod.yml     # Ambiente de producao
```

## Setup de desenvolvimento

### Pre-requisitos

- [Git](https://git-scm.com/downloads)
- [Docker](https://www.docker.com/) com Docker Compose V2

### Instalacao

```bash
git clone https://github.com/Rafael-Karele/ifcodes.git
cd ifcodes
```

Configure o `.env` do backend:

```bash
cp back/src/.env.example back/src/.env
```

Edite `back/src/.env` e preencha `DB_PASSWORD` com a senha definida em `judge0.conf`.

Suba os containers:

```bash
docker compose up -d
docker exec laravel_app php artisan key:generate
docker exec laravel_app php artisan migrate:fresh --seed
```

### Acessando os servicos

| Servico | URL |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Laravel) | http://localhost:8000 |
| Judge0 API | http://localhost:2358 |
| Mailpit (email) | http://localhost:8025 |
| PostgreSQL | localhost:5432 |

## CI/CD

O projeto tem 4 workflows no GitHub Actions:

| Workflow | Trigger | O que faz |
|---|---|---|
| `tests.yml` | PR para main | Detecta mudancas no backend e roda PHPUnit condicionalmente |
| `frontend.yml` | PR para main (front/**) | TypeScript check + ESLint |
| `phpunit.yml` | Chamado por outros workflows | Workflow reutilizavel com PHPUnit + PostgreSQL |
| `deploy.yml` | Push na main | Deploy condicional por servico via SSH |

O deploy so reconstroi os servicos Docker que foram alterados (back, front, jam-server).

Para mais detalhes, veja [docs/CD.md](docs/CD.md) e [docs/melhorias-futuras.md](docs/melhorias-futuras.md).
