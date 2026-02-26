# Continuous Deployment (CD)

## Como funciona

O deploy automatico e acionado quando um push e feito na branch `main` (geralmente via merge de PR).

### Fluxo

1. **Detect changes** — Identifica quais diretorios foram alterados (`back/`, `front/`, `jam-server/`)
2. **Testes** — Roda PHPUnit apenas se houve mudancas no backend (`back/**`)
3. **Deploy** — Conecta no VPS via SSH e executa:
   - `git pull origin main` — atualiza o codigo
   - `docker compose up -d --build <servicos>` — reconstroi apenas os servicos afetados
   - `php artisan migrate --force` + `config:cache` — apenas se o backend mudou

### Deploy condicional por servico

O deploy so reconstroi os containers que foram afetados:

| Mudanca em | Servicos rebuilds |
|---|---|
| `back/**` | `backend_app`, `queue_worker` + migrations + config:cache |
| `front/**` | `frontend_app` |
| `jam-server/**` | `jam_server` |

Se nenhum desses paths mudou (ex: apenas docs ou CI), faz apenas `git pull` sem rebuild.

### Workflow

O arquivo `.github/workflows/deploy.yml` contem tres jobs:
- **changes** — detecta quais partes do projeto mudaram usando [dorny/paths-filter](https://github.com/dorny/paths-filter)
- **tests** — roda PHPUnit (via workflow reutilizavel `phpunit.yml`) apenas se o backend mudou
- **deploy** — depende de `changes` e `tests`, usa [appleboy/ssh-action](https://github.com/appleboy/ssh-action) para conectar no VPS

---

## Configurando os Secrets no GitHub

Os seguintes secrets precisam estar configurados no repositorio:

| Secret | Descricao | Exemplo |
|---|---|---|
| `VPS_SSH_KEY` | Chave SSH privada (conteudo completo do arquivo) | `-----BEGIN OPENSSH PRIVATE KEY-----...` |
| `VPS_HOST` | IP ou hostname do VPS | `187.77.56.31` |
| `VPS_USER` | Usuario SSH no VPS | `root` ou `deploy` |
| `VPS_PROJECT_PATH` | Caminho absoluto do projeto no VPS | `/home/deploy/ifcodes` |

### Como configurar via CLI

```bash
# Chave SSH (do arquivo)
gh secret set VPS_SSH_KEY < ~/.ssh/id_ed25519

# Host
gh secret set VPS_HOST -b "187.77.56.31"

# Usuario
gh secret set VPS_USER -b "root"

# Caminho do projeto
gh secret set VPS_PROJECT_PATH -b "/caminho/do/projeto"
```

### Como configurar via interface web

1. Va em **Settings > Secrets and variables > Actions** no repositorio
2. Clique em **New repository secret**
3. Adicione cada secret com o nome e valor correspondente

---

## Abordagem atual: SSH + Git Pull

A abordagem atual e simples e direta:
- O GitHub Actions conecta via SSH no VPS
- Faz `git pull` para atualizar o codigo
- Reconstroi os containers com `docker compose up -d --build`

### Pros
- Simples de configurar e entender
- Nao precisa de registry externo
- Build acontece no proprio VPS (usa cache local do Docker)
- Rapido para projetos pequenos/medios

### Contras
- O VPS precisa ter acesso ao repositorio Git
- Build consome recursos do VPS (CPU/RAM)
- Nao ha versionamento de imagens (rollback manual)
- Se o build falhar, o VPS pode ficar em estado inconsistente

---

## Evolucao futura: GitHub Container Registry (GHCR)

Uma alternativa mais robusta seria usar o GHCR para armazenar imagens Docker:

### Como funcionaria

1. CI builda a imagem Docker no GitHub Actions
2. Push da imagem para `ghcr.io/rafael-karele/ifcodes:latest`
3. No VPS, faz `docker compose pull` + `docker compose up -d`

### Pros
- Build nao consome recursos do VPS
- Imagens versionadas (facil rollback com tags)
- Mais proximo de um pipeline profissional
- VPS nao precisa de acesso ao codigo-fonte

### Contras
- Mais complexo de configurar
- Precisa manter Dockerfiles otimizados para producao
- Precisa gerenciar autenticacao do GHCR no VPS
- Imagens grandes podem demorar para push/pull

### Quando migrar

Considere migrar para GHCR quando:
- O build estiver demorando muito no VPS
- Precisar de rollback rapido e confiavel
- O time crescer e precisar de mais controle sobre versoes
- Quiser separar completamente o build do deploy

---

## Veja tambem

- [Melhorias Futuras](./melhorias-futuras.md) — Sugestoes de melhorias como migracao para Nginx + PHP-FPM
