# Continuous Deployment (CD)

## Como funciona

O deploy automatico e acionado quando um push e feito na branch `main` (geralmente via merge de PR).

### Fluxo

1. **Testes** — O workflow roda os testes PHPUnit como garantia extra antes do deploy
2. **Deploy** — Se os testes passarem, conecta no VPS via SSH e executa:
   - `git pull origin main` — atualiza o codigo
   - `docker compose up -d --build` — reconstroi e reinicia os containers
   - `php artisan migrate --force` — roda migrations pendentes
   - `php artisan config:cache` — limpa e recria o cache de configuracao

### Workflow

O arquivo `.github/workflows/deploy.yml` contem dois jobs:
- **tests** — mesmos testes do CI (PHPUnit + PostgreSQL)
- **deploy** — depende de `tests`, usa [appleboy/ssh-action](https://github.com/appleboy/ssh-action) para conectar no VPS

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
