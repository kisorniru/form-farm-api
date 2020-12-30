<?php

namespace Tests\Feature;

use App\User;
use App\Group;
use Faker\Factory;
use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiUserFlowTest extends TestCase
{
  /**
   * Test to create User
   *
   * @return array
   * @return int
   */
  public function testCreateUserAsAdmin ()
  {
    $faker = Factory::create();
    $admin = User::where('is_admin', 1)->first();
    $group = Group::inRandomOrder()->first();
    $response = $this->actingAs($admin, 'api')
                    ->json('POST', '/api/users', [
                      'email' => $faker->safeEmail,
                      'first_name' => $faker->firstName('male'),
                      'last_name' => 'admin',
                      'password' => 'test',
                      'group'    => $group->id,
                    ]);
    $id = $response->decodeResponseJson()['data']['id'];
    $response->assertStatus(201);
    return $id;
  }

  /**
   * a Test that update the user
   *
   * @depends testCreateUserAsAdmin
   * @return int
   */
  public function testUpdateUserAsAdmin ($userId)
  {
    $admin = User::where('is_admin', 1)->first();
    $group = Group::inRandomOrder()->first();
    $response = $this->actingAs($admin, 'api')
                    ->json('PUT', '/api/users/'. $userId, [
                      'first_name' => 'test updated',
                      'last_name' => 'Test updated',
                      'group'    => $group->id,
                    ]);

    $response->assertStatus(200);

    return $userId;
  }

  /**
   * a Test that toggle the admin flag in the created user
   *
   * @depends testCreateUserAsAdmin
   * @return int
   */
  public function testToggleAdminAsAdmin ($userId)
  {
    $admin = User::where('is_admin', 1)->first();
    $response = $this->actingAs($admin, 'api')
                  ->json('GET', '/api/users/' . $userId . '/toggle/');

    $response->assertStatus(200)
      ->assertJsonFragment([
        'admin' => true
      ]);
  }

  /**
   * a Test that checks if the group can be attached to a user
   *
   * @depends testUpdateUserAsAdmin
   * @return int
   */
  public function testAttachGroupToUserAsAdmin ($userId)
  {
    $admin = User::where('is_admin', 1)->first();
    $groups = Group::inRandomOrder()->take(5)->get();
    $ids = '';
    foreach ($groups as $group) {
      $ids .= strlen($ids) == 0 ? $group->id : ','.$group->id;
    }

    $response = $this->actingAs($admin, 'api')
                    ->json('POST', '/api/users/'.$userId.'/groups/attach', [
                      'groups' => $ids,
                    ]);

    $response->assertStatus(200)
      ->assertJsonFragment([
        'id' => $userId,
      ]);

    return $userId;
  }

  /**
   * a Test that checks if the group can be attached to a user
   *
   * @depends testAttachGroupToUserAsAdmin
   * @return int
   */
  public function testDetachGroupFromUserAsAdmin ($userId)
  {
    $admin = User::where('is_admin', 1)->first();
    $user = User::find($userId);
    $groups = $user->groups()->get();
    $ids = '';
    foreach ($groups as $group) {
      $ids .= strlen($ids) == 0 ? $group->id : ','.$group->id;
    }

    $response = $this->actingAs($admin, 'api')
                    ->json('POST', '/api/users/'.$userId.'/groups/detach', [
                      'groups' => $ids,
                    ]);

    $response->assertStatus(200)
      ->assertJsonFragment([
        'id' => $userId,
      ]);

    return $userId;
  }

  /**
   * Test that will remove a user
   *
   * @depends testDetachGroupFromUserAsAdmin
   * @return int
   */
  public function testDeleteUserAsAdmin ($userId)
  {
    $admin = User::where('is_admin', 1)->first();
    $user = User::find($userId);
    $response = $this->actingAs($admin, 'api')
                  ->json('DELETE', '/api/users/'.$userId);

    $response->assertStatus(200)
      ->assertJson([
        'data' => [
          'message' => 'The user ' . $user->name . ' was deleted.',
        ],
      ]);
  }

  /**
   * Test to create User
   *
   * @return array
   * @return void
   */
  public function testCreateUserAsNormal ()
  {
    $faker = Factory::create();
    $user = User::where('is_admin', 0)->first();
    $group = Group::inRandomOrder()->first();
    $response = $this->actingAs($user, 'api')
                    ->json('POST', '/api/users', [
                      'email' => $faker->safeEmail,
                      'first_name' => $faker->firstName('male'),
                      'last_name' => $faker->lastName,
                      'password' => 'test',
                      'group'    => $group->id,
                    ]);

    $response->assertStatus(403);
  }

  /**
   * a Test that update the user
   *
   * @return int
   */
  public function testUpdateUserAsNormal ()
  {
    $user = User::where('is_admin', 0)->inRandomOrder()->first();
    $group = Group::inRandomOrder()->first();
    $response = $this->actingAs($user, 'api')
                    ->json('PUT', '/api/users/'. $user->id, [
                      'first_name' => 'test updated',
                      'last_name' => 'Test updated',
                      'group'    => $group->id,
                    ]);

    $response->assertStatus(403);
  }

  /**
   * a Test that toggle the admin flag in the user
   *
   * @return void
   */
  public function testToggleAdminAsNormal ()
  {
    $user = User::where('is_admin', 0)->first();
    $response = $this->actingAs($user, 'api')
                  ->json('GET', '/api/users/' . $user->id . '/toggle/');

    $response->assertStatus(403);
  }

  /**
   * a Test that checks if the group can be attached to a user
   *
   * @return void
   */
  public function testAttachGroupToUserAsNormal ()
  {
    $user = User::where('is_admin', 0)->first();
    $groups = Group::inRandomOrder()->take(5)->get();
    $ids = '';
    foreach ($groups as $group) {
      $ids .= strlen($ids) == 0 ? $group->id : ','.$group->id;
    }

    $response = $this->actingAs($user, 'api')
                    ->json('POST', '/api/users/'.$user->id.'/groups/attach', [
                      'groups' => $ids,
                    ]);

    $response->assertStatus(403);
  }

  /**
   * a Test that checks if the group can be attached to a user
   *
   * @return void
   */
  public function testDetachGroupFromUserAsNormal ()
  {
    $user = User::where('is_admin', 0)->first();
    $groups = $user->groups()->get();
    $ids = '';
    foreach ($groups as $group) {
      $ids .= strlen($ids) == 0 ? $group->id : ','.$group->id;
    }

    $response = $this->actingAs($user, 'api')
      ->json('POST', '/api/users/'.$user->id.'/groups/detach', [
        'groups' => $ids,
      ]);

    $response->assertStatus(403);
  }

  /**
   * Test that will remove a user
   *
   * @return void
   */
  public function testDeleteUserAsNormal ()
  {
    $user = User::where('is_admin', 0)->first();
    $response = $this->actingAs($user, 'api')
      ->json('DELETE', '/api/users/'.$user->id);

    $response->assertStatus(403);
  }
}
