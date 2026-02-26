# Melhorias Futuras

Sugestoes de melhorias identificadas durante otimizacoes do projeto. Nao sao urgentes, mas devem ser consideradas conforme o projeto evolui.

---

## 1. Migrar para Nginx + PHP-FPM

**Prioridade:** Media
**Impacto:** Performance e confiabilidade do backend em producao

### Situacao atual

O backend roda com `php artisan serve`, o servidor de desenvolvimento built-in do PHP. Ele e single-threaded e nao foi projetado para producao.

### Proposta

Substituir `php artisan serve` por **Nginx** como reverse proxy + **PHP-FPM** para processar requests PHP.

### Mudancas necessarias

1. Trocar a imagem base do Dockerfile de `php:8.4-cli` de volta para `php:8.4-fpm`
2. Adicionar um container Nginx ao `docker-compose.prod.yml`
3. Criar configuracao Nginx (`nginx.conf`) com proxy para PHP-FPM
4. Remover o `command: "php artisan serve ..."` do `docker-compose.prod.yml`
5. Atualizar a porta exposta (Nginx na 80/443 em vez do artisan na 8000)

### Beneficios

- **Multi-threaded**: PHP-FPM gerencia um pool de workers, atendendo multiplas requests simultaneas
- **Melhor performance**: Nginx serve arquivos estaticos diretamente sem passar pelo PHP
- **Mais robusto**: Nginx tem health checks, rate limiting, e logging avancado
- **Padrao da industria**: Setup recomendado para Laravel em producao

### Exemplo de arquitetura

```
Client → Nginx (porta 80) → PHP-FPM (porta 9000) → Laravel
```

### Quando fazer

- Quando o numero de usuarios simultaneos crescer
- Quando precisar de HTTPS terminado no container (Nginx + certbot)
- Quando notar lentidao ou timeouts no backend

### Referencias

- [Laravel Deployment - Nginx](https://laravel.com/docs/deployment#nginx)
- [PHP-FPM Configuration](https://www.php.net/manual/en/install.fpm.configuration.php)

---

## 2. Remover volume mounts de codigo em producao

**Prioridade:** Media
**Impacto:** Consistencia, seguranca e performance do deploy

### Situacao atual

O `docker-compose.prod.yml` monta o codigo do host como volume:

```yaml
backend_app:
  volumes:
    - ./back/src/:/var/www/html:z
    - /var/www/html/vendor
```

Isso faz com que o `COPY src/ .` e o `composer install` do Dockerfile sejam ignorados em runtime — o container usa o codigo do filesystem do VPS. O deploy real e o `git pull`, nao o build da imagem.

### Proposta

Remover os volume mounts de codigo e deixar a imagem Docker ser a unica fonte de verdade:

```yaml
backend_app:
  build:
    context: ./back
    dockerfile: src/docker/php/Dockerfile
  container_name: laravel_app
  # sem volume de codigo
```

### Comparacao

| Aspecto | Com volume (atual) | Sem volume (recomendado) |
|---|---|---|
| Consistencia | Depende do estado do filesystem | Imagem imutavel e reproduzivel |
| Rollback | Manual (`git checkout`) | Troca a tag da imagem |
| Performance | I/O passa pelo bind mount | Filesystem nativo do container |
| Seguranca | Codigo editavel em runtime | Codigo read-only na imagem |
| Dockerfile | `COPY` e `install` sao desperdicio | `COPY` e `install` sao o deploy real |
| Vendor | Volume anonimo pode ficar desatualizado | Sempre fresh do `composer install` |

### Mudancas necessarias

1. Remover `volumes` de codigo de `backend_app` e `queue_worker` no `docker-compose.prod.yml`
2. Garantir que o Dockerfile copia tudo que e necessario (`COPY src/ .`)
3. Ajustar deploy para fazer `docker compose build` + `up -d` (sem depender de `git pull` para o codigo)
4. Manter volumes apenas para dados persistentes (ex: `postgres_data`)

### Quando fazer

- Idealmente junto com a migracao para GHCR (item 3 abaixo)
- Pode ser feito antes, mas o maior beneficio vem quando o build acontece no CI e nao no VPS

### Nota sobre desenvolvimento

Em desenvolvimento local, volumes de codigo sao uteis para hot-reload. A solucao e ter um `docker-compose.yml` separado para dev (com volumes) e o `docker-compose.prod.yml` sem volumes.

---

## 3. Migrar deploy para GitHub Container Registry (GHCR)

**Prioridade:** Baixa
**Impacto:** Pipeline de deploy mais robusto

Detalhes completos em [docs/CD.md](./CD.md#evolucao-futura-github-container-registry-ghcr).
