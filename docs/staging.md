# Ambiente de Staging

## Por que precisamos de staging

Hoje o projeto tem dois ambientes: **desenvolvimento** (local) e **producao** (VPS). O deploy vai direto de `main` para producao. Isso significa que:

- Bugs so sao detectados em producao, afetando usuarios reais
- Nao ha como testar integracoes (Judge0, WebSocket, email) em ambiente identico ao de producao antes do deploy
- Migrations arriscadas rodam direto no banco de producao
- Nao e possivel fazer testes de carga ou validacao sem impactar o sistema real

## O que e staging

Staging e uma copia fiel do ambiente de producao, mas sem usuarios reais. Serve para:

- Validar PRs em ambiente real antes do merge
- Testar migrations em banco separado
- Verificar integracoes (Judge0, Redis, WebSocket) com configuracao identica a producao
- Permitir que outros membros do time testem features antes de ir para producao

## Proposta de implementacao

### Opcao 1: Branch `staging` + segundo compose no mesmo VPS

A opcao mais simples e com custo zero.

**Como funciona:**
1. Criar branch `staging` no repositorio
2. Criar `docker-compose.staging.yml` com portas diferentes (ex: 8001, 3001, 5174)
3. Workflow de deploy para staging: push na branch `staging` → deploy no VPS com compose de staging
4. Banco de dados separado (`ifcodes_staging`)

**Estrutura de portas:**

| Servico | Producao | Staging |
|---|---|---|
| Backend | :8000 | :8001 |
| Frontend | :3000 | :3001 |
| Jam Server | :3002 | :3003 |

**Pros:**
- Custo zero (mesmo VPS)
- Simples de implementar
- Compartilha a mesma maquina e rede

**Contras:**
- Compete por recursos (CPU/RAM) com producao
- Se staging consumir muito, producao pode ser afetada
- Nao e 100% isolado

### Opcao 2: VPS separado para staging

**Como funciona:**
1. Provisionar segundo VPS (pode ser menor/mais barato)
2. Mesmo docker-compose.prod.yml, mas com secrets diferentes
3. Deploy automatico via branch `staging` ou manualmente

**Pros:**
- Isolamento completo
- Nao afeta producao
- Mais proximo de um ambiente profissional

**Contras:**
- Custo adicional de infraestrutura
- Mais secrets para gerenciar

### Recomendacao

Comecar com a **Opcao 1** (mesmo VPS, portas diferentes). E suficiente para o estagio atual do projeto e pode ser migrado para a Opcao 2 quando houver mais recursos.

## Fluxo de trabalho com staging

```
feature branch → PR → merge em staging → deploy staging → validacao → merge em main → deploy producao
```

### Workflow CI/CD com staging

| Evento | Acao |
|---|---|
| PR para `main` | Roda testes (PHPUnit, lint, typecheck) |
| Push em `staging` | Deploy automatico no ambiente de staging |
| Push em `main` | Deploy automatico em producao |

## Mudancas necessarias

1. Criar `docker-compose.staging.yml` (baseado no prod, com portas e banco diferentes)
2. Criar workflow `.github/workflows/deploy-staging.yml`
3. Adicionar secrets de staging no GitHub (`VPS_STAGING_PROJECT_PATH` ou um novo caminho no mesmo VPS para isolamento)
4. Criar banco `ifcodes_staging` no PostgreSQL
5. Documentar o fluxo de staging no README

## Quando implementar

- Quando o time crescer e precisar validar features antes de producao
- Quando houver usuarios reais dependendo da estabilidade do sistema
- Quando migrations complexas precisarem ser testadas antes de rodar em producao
