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

## 2. Migrar deploy para GitHub Container Registry (GHCR)

**Prioridade:** Baixa
**Impacto:** Pipeline de deploy mais robusto

Detalhes completos em [docs/CD.md](./CD.md#evolucao-futura-github-container-registry-ghcr).
