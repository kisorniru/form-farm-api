<?php

namespace Tests\Feature;

use App\User;
use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiAuthFlowTest extends TestCase
{

  /**
   * Test an invalid User
   *
   * @return void
   */
  public function testInvalidUser ()
  {
    $response = $this->json('POST', '/api/auth/login', [
      'email' => 'test@test.test',
      'password' => 'test',
    ]);

    $response
      ->assertStatus(401)
      ->assertJson([
        'error' => 'The email/password is not valid.'
      ]);
  }

  /**
   * Test Unanthenticated User Getting info
   *
   * @return void
   */
  public function getUnauthenticatedUserInfo ()
  {
    $response = $this->json('GET', '/api/auth/me', [], [
      'authorization' => 'bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9mb3JtLWZhcm0udGVzdFwvYXBpXC9hdXRoXC9sb2dpbiIsImlhdCI6MTU2NjQwNjg3MSwiZXhwIjoxNTY2NDEwNDcxLCJuYmYiOjE1NjY0MDY4NzEsImp0aSI6Ikp0UTlQRFJrVkxzYXJxTUwiLCJzdWIiOjEzNiwicHJ2IjoiODdlMGFmMWVmOWZkMTU4MTJmZGVjOTcxNTNhMTRlMGIwNDc1NDZhYSJ9.j9H61CRId3Mm-SxP_-uT-vYEzhl8-GjZF9lh4z-Vpnc',
    ]);

    $response
      ->assertStatus(401)
      ->assertJson([
        'message' => 'Unauthenticated.'
      ]);
  }

  /**
   * a Test that will check if the auth process works good
   *
   * @return array
   */
  public function testLogin()
  {
    $user = factory(User::class)->create();

    $response = $this->json('POST', '/api/auth/login', [
      'email' => $user->email,
      'password' => 'password'
    ]);

    $token = $response->decodeResponseJson()['access_token'];

    $response
      ->assertStatus(200)
      ->assertJsonFragment([
        'token_type' => 'bearer',
      ]);

    return [
      'user' => $user,
      'token'=> $token,
    ];
  }

  /**
   * a Test that will check if can retrieve the current user
   *
   * @depends testLogin
   * @return void
   */
  public function testAuthenticatedUser ()
  {
    $user = User::inRandomOrder()->first();
    $response = $this->actingAs($user, 'api')
      ->json('GET', '/api/auth/me');

    $response
      ->assertStatus(200)
      ->assertJsonFragment([
        'id' => $user->id,
        'email' => $user->email,
      ]);
  }

}
