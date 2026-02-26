<?php

namespace Tests\Feature\Authorization;

use App\Models\User;
use Database\Seeders\RBAC\RoleSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RouteAuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected User $student;
    protected User $professor;
    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleSeeder::class);

        $this->student = User::factory()->create();
        $this->student->assignRole('student');

        $this->professor = User::factory()->create();
        $this->professor->assignRole('professor');

        $this->admin = User::factory()->create();
        $this->admin->assignRole('admin');
    }

    // ─── Rotas públicas (qualquer autenticado) ───

    public function test_any_authenticated_user_can_get_user_info(): void
    {
        $this->actingAs($this->student)->getJson('/api/user')->assertOk();
        $this->actingAs($this->professor)->getJson('/api/user')->assertOk();
        $this->actingAs($this->admin)->getJson('/api/user')->assertOk();
    }

    public function test_any_authenticated_user_can_get_roles(): void
    {
        $this->actingAs($this->student)->getJson('/api/user/roles')->assertOk();
    }

    public function test_any_authenticated_user_can_get_permissions(): void
    {
        $this->actingAs($this->student)->getJson('/api/user/permissions')->assertOk();
    }

    public function test_any_authenticated_user_can_list_atividades(): void
    {
        $this->actingAs($this->student)->getJson('/api/atividades')->assertSuccessful();
    }

    public function test_any_authenticated_user_can_access_turmas_route(): void
    {
        // Turma index has business logic that may return 403 if user has no aluno/professor profile,
        // but the important thing is it doesn't return 401 (auth middleware passes)
        $response = $this->actingAs($this->student)->getJson('/api/turmas');
        $this->assertNotEquals(401, $response->status());
    }

    public function test_any_authenticated_user_can_list_cursos(): void
    {
        $this->actingAs($this->student)->getJson('/api/cursos')->assertSuccessful();
    }

    public function test_any_authenticated_user_can_list_problemas(): void
    {
        $this->actingAs($this->student)->getJson('/api/problemas')->assertSuccessful();
    }

    public function test_any_authenticated_user_can_list_submissoes(): void
    {
        $this->actingAs($this->student)->getJson('/api/submissoes')->assertSuccessful();
    }

    public function test_any_authenticated_user_can_access_jam_sessions_route(): void
    {
        // Jam sessions index requires turma_id param, so it may return 422,
        // but the important thing is it doesn't return 401 or 403 (passes auth + no role needed)
        $response = $this->actingAs($this->student)->getJson('/api/jam-sessions?turma_id=999');
        $this->assertNotContains($response->status(), [401, 403]);
    }

    // ─── Rotas de professor/admin — Student deve receber 403 (POST routes) ───
    // POST (store) routes don't use model binding, so role middleware runs and returns 403

    public function test_student_cannot_create_atividade(): void
    {
        $this->actingAs($this->student)
            ->postJson('/api/atividades', [])
            ->assertForbidden();
    }

    public function test_student_cannot_create_problema(): void
    {
        $this->actingAs($this->student)
            ->postJson('/api/problemas', [])
            ->assertForbidden();
    }

    public function test_student_cannot_create_turma(): void
    {
        $this->actingAs($this->student)
            ->postJson('/api/turmas', [])
            ->assertForbidden();
    }

    public function test_student_cannot_vincular_aluno(): void
    {
        $this->actingAs($this->student)
            ->postJson('/api/turmas/1/vincular-aluno/1')
            ->assertForbidden();
    }

    public function test_student_cannot_desvincular_aluno(): void
    {
        $this->actingAs($this->student)
            ->deleteJson('/api/turmas/1/desvincular-aluno/1')
            ->assertForbidden();
    }

    public function test_student_cannot_get_submissions_by_activity(): void
    {
        $this->actingAs($this->student)
            ->getJson('/api/turmas/1/atividades/1/submissoes')
            ->assertForbidden();
    }

    public function test_student_cannot_create_jam_session(): void
    {
        $this->actingAs($this->student)
            ->postJson('/api/jam-sessions', [])
            ->assertForbidden();
    }

    public function test_student_cannot_update_jam_session(): void
    {
        $this->actingAs($this->student)
            ->putJson('/api/jam-sessions/1', [])
            ->assertForbidden();
    }

    public function test_student_cannot_start_jam_session(): void
    {
        $this->actingAs($this->student)
            ->postJson('/api/jam-sessions/1/start')
            ->assertForbidden();
    }

    public function test_student_cannot_finish_jam_session(): void
    {
        $this->actingAs($this->student)
            ->postJson('/api/jam-sessions/1/finish')
            ->assertForbidden();
    }

    public function test_student_cannot_give_feedback_jam_session(): void
    {
        $this->actingAs($this->student)
            ->putJson('/api/jam-sessions/1/feedback/1')
            ->assertForbidden();
    }

    public function test_student_cannot_notify_jam_result(): void
    {
        $this->actingAs($this->student)
            ->postJson('/api/jam-sessions/notify-result')
            ->assertForbidden();
    }

    // ─── Professor PODE acessar rotas de professor (não recebe 403) ───

    public function test_professor_can_create_atividade(): void
    {
        $response = $this->actingAs($this->professor)
            ->postJson('/api/atividades', []);

        $this->assertNotEquals(403, $response->status());
    }

    public function test_professor_can_create_problema(): void
    {
        $response = $this->actingAs($this->professor)
            ->postJson('/api/problemas', []);

        $this->assertNotEquals(403, $response->status());
    }

    public function test_professor_can_create_turma(): void
    {
        $response = $this->actingAs($this->professor)
            ->postJson('/api/turmas', []);

        $this->assertNotEquals(403, $response->status());
    }

    public function test_professor_can_create_jam_session(): void
    {
        $response = $this->actingAs($this->professor)
            ->postJson('/api/jam-sessions', []);

        $this->assertNotEquals(403, $response->status());
    }

    // ─── Rotas de admin — Student e Professor devem receber 403 ───

    public function test_student_cannot_list_alunos(): void
    {
        $this->actingAs($this->student)
            ->getJson('/api/alunos')
            ->assertForbidden();
    }

    public function test_student_cannot_create_aluno(): void
    {
        $this->actingAs($this->student)
            ->postJson('/api/alunos', [])
            ->assertForbidden();
    }

    public function test_student_cannot_list_professores(): void
    {
        $this->actingAs($this->student)
            ->getJson('/api/professores')
            ->assertForbidden();
    }

    public function test_student_cannot_create_professor(): void
    {
        $this->actingAs($this->student)
            ->postJson('/api/professores', [])
            ->assertForbidden();
    }

    public function test_professor_can_list_alunos(): void
    {
        $this->actingAs($this->professor)
            ->getJson('/api/alunos')
            ->assertSuccessful();
    }

    public function test_professor_cannot_create_aluno(): void
    {
        $this->actingAs($this->professor)
            ->postJson('/api/alunos', [])
            ->assertForbidden();
    }

    public function test_professor_cannot_list_professores(): void
    {
        $this->actingAs($this->professor)
            ->getJson('/api/professores')
            ->assertForbidden();
    }

    public function test_professor_cannot_create_professor(): void
    {
        $this->actingAs($this->professor)
            ->postJson('/api/professores', [])
            ->assertForbidden();
    }

    // ─── Admin PODE acessar tudo ───

    public function test_admin_can_list_alunos(): void
    {
        $this->actingAs($this->admin)
            ->getJson('/api/alunos')
            ->assertSuccessful();
    }

    public function test_admin_can_list_professores(): void
    {
        $this->actingAs($this->admin)
            ->getJson('/api/professores')
            ->assertSuccessful();
    }

    public function test_admin_can_create_atividade(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/atividades', []);

        $this->assertNotEquals(403, $response->status());
    }

    public function test_admin_can_create_problema(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/problemas', []);

        $this->assertNotEquals(403, $response->status());
    }

    public function test_admin_can_create_jam_session(): void
    {
        $response = $this->actingAs($this->admin)
            ->postJson('/api/jam-sessions', []);

        $this->assertNotEquals(403, $response->status());
    }

    // ─── Rotas sem autenticação devem retornar 401 ───

    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
        $this->getJson('/api/atividades')->assertUnauthorized();
        $this->getJson('/api/turmas')->assertUnauthorized();
        $this->getJson('/api/alunos')->assertUnauthorized();
    }
}
