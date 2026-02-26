<?php

namespace Tests\Feature\Authorization;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * Catch-all test: every route behind auth:sanctum MUST have a role middleware
 * or be explicitly whitelisted here.
 *
 * If a developer adds a new endpoint without role protection and without
 * adding it to the whitelist, this test FAILS — forcing them to think
 * about authorization.
 */
class RouteProtectionTest extends TestCase
{
    /**
     * Routes that are deliberately open to ALL authenticated users.
     * Any new public route must be added here intentionally.
     */
    private array $whitelistedRoutes = [
        // User info
        'GET api/user',
        'PATCH api/user',
        'GET api/user/roles',
        'GET api/user/permissions',
        'POST api/user/change-password',

        // Atividades (leitura)
        'GET api/atividades',
        'GET api/atividades/{atividade}',

        // Turmas (leitura)
        'GET api/turmas',
        'GET api/turmas/{turma}',
        'GET api/turmas/{turma_id}/listar-alunos',

        // Cursos
        'GET api/cursos',

        // Problemas (leitura)
        'GET api/problemas',
        'GET api/problemas/{problema}',

        // Submissões (leitura + criação por qualquer autenticado)
        'GET api/submissoes',
        'GET api/submissoes/{submissao}',
        'POST api/submissoes',
        'GET api/submissoes/atividades/{atividade}',

        // Correção
        'GET api/correcao/busca-por-submissao/{submissao}',

        // Auth
        'POST logout',

        // Jam Sessions (participação)
        'GET api/jam-sessions',
        'GET api/jam-sessions/{id}',
        'POST api/jam-sessions/{id}/join',
        'PUT api/jam-sessions/{id}/code',
        'POST api/jam-sessions/{id}/submit',
        'GET api/turmas/{id}/jam-session/active',
    ];

    public function test_all_sanctum_routes_have_role_middleware_or_are_whitelisted(): void
    {
        $unprotectedRoutes = [];

        foreach (Route::getRoutes() as $route) {
            $middleware = $route->gatherMiddleware();

            // Only check routes that require authentication
            if (! in_array('auth:sanctum', $middleware)) {
                continue;
            }

            // Check if route has any role middleware
            $hasRoleMiddleware = false;
            foreach ($middleware as $m) {
                if (str_starts_with($m, 'role:') || str_starts_with($m, 'role_or_permission:') || str_starts_with($m, 'permission:')) {
                    $hasRoleMiddleware = true;
                    break;
                }
            }

            if ($hasRoleMiddleware) {
                continue;
            }

            // Check if it's whitelisted
            $methods = $route->methods();
            $uri = $route->uri();

            $isWhitelisted = false;
            foreach ($methods as $method) {
                if ($method === 'HEAD') {
                    continue;
                }
                $routeSignature = "{$method} {$uri}";
                if (in_array($routeSignature, $this->whitelistedRoutes)) {
                    $isWhitelisted = true;
                    break;
                }
            }

            if (! $isWhitelisted) {
                $methodsList = implode('|', array_filter($route->methods(), fn ($m) => $m !== 'HEAD'));
                $unprotectedRoutes[] = "{$methodsList} {$uri}";
            }
        }

        $this->assertEmpty(
            $unprotectedRoutes,
            "The following routes require auth:sanctum but have NO role middleware and are NOT whitelisted.\n"
            . "Either add role middleware or add them to the whitelist in RouteProtectionTest:\n"
            . implode("\n", array_map(fn ($r) => "  - {$r}", $unprotectedRoutes))
        );
    }
}
