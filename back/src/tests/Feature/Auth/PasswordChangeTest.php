<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class PasswordChangeTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_change_password_with_valid_credentials(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('current-password'),
        ]);

        $response = $this->actingAs($user)->postJson('/user/change-password', [
            'current_password' => 'current-password',
            'new_password' => 'new-password',
            'new_password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Senha alterada com sucesso. Por favor, faça login novamente.'
            ]);

        // Verify password was actually changed
        $user->refresh();
        $this->assertTrue(Hash::check('new-password', $user->password));
    }

    public function test_must_change_password_flag_is_cleared_after_password_change(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('current-password'),
            'must_change_password' => true,
        ]);

        // Verify the flag is initially set
        $this->assertTrue($user->must_change_password);

        $response = $this->actingAs($user)->postJson('/user/change-password', [
            'current_password' => 'current-password',
            'new_password' => 'new-password',
            'new_password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(200);

        // Verify the flag is cleared after password change
        $user->refresh();
        $this->assertFalse($user->must_change_password);
    }

    public function test_user_tokens_are_deleted_after_password_change(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('current-password'),
        ]);

        // Create some tokens
        $token1 = $user->createToken('token1');
        $token2 = $user->createToken('token2');

        $this->assertCount(2, $user->tokens);

        $response = $this->actingAs($user)->postJson('/user/change-password', [
            'current_password' => 'current-password',
            'new_password' => 'new-password',
            'new_password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(200);

        // Verify tokens were deleted
        $user->refresh();
        $this->assertCount(0, $user->tokens);
    }

    public function test_password_change_fails_with_incorrect_current_password(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('current-password'),
        ]);

        $response = $this->actingAs($user)->postJson('/user/change-password', [
            'current_password' => 'wrong-password',
            'new_password' => 'new-password',
            'new_password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'A senha atual está incorreta.'
            ]);

        // Verify password was not changed
        $user->refresh();
        $this->assertTrue(Hash::check('current-password', $user->password));
    }

    public function test_password_change_requires_authentication(): void
    {
        $response = $this->postJson('/user/change-password', [
            'current_password' => 'current-password',
            'new_password' => 'new-password',
            'new_password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(401);
    }

    public function test_password_change_validates_minimum_length(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('current-password'),
        ]);

        $response = $this->actingAs($user)->postJson('/user/change-password', [
            'current_password' => 'current-password',
            'new_password' => 'short',
            'new_password_confirmation' => 'short',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['new_password']);
    }

    public function test_password_change_requires_confirmation(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('current-password'),
        ]);

        $response = $this->actingAs($user)->postJson('/user/change-password', [
            'current_password' => 'current-password',
            'new_password' => 'new-password',
            'new_password_confirmation' => 'different-password',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['new_password']);
    }

    public function test_must_change_password_flag_remains_false_when_already_false(): void
    {
        $user = User::factory()->create([
            'password' => Hash::make('current-password'),
            'must_change_password' => false,
        ]);

        // Verify the flag is initially false
        $this->assertFalse($user->must_change_password);

        $response = $this->actingAs($user)->postJson('/user/change-password', [
            'current_password' => 'current-password',
            'new_password' => 'new-password',
            'new_password_confirmation' => 'new-password',
        ]);

        $response->assertStatus(200);

        // Verify the flag is still false after password change
        $user->refresh();
        $this->assertFalse($user->must_change_password);
    }
}
