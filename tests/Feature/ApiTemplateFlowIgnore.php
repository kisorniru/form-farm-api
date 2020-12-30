<?php

namespace Tests\Feature;

use App\Template;
use App\Group;
use App\User;
use Faker\Factory;
use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiTemplateFlowTest extends TestCase
{
  /**
   * Test if the api creates a Document succesfully  as an Admin
   *
   * @return void
   */
  public function testCreateDocumentAdmin ()
  {
    $faker = Factory::create();
    $admin = User::where('is_admin', 1)->first();
    $group = Group::inRandomOrder()->first();

    $response = $this->actingAs($admin, 'api')
      ->json('POST', '/api/documents', [
        'name' => $faker->company,
        'content' => $faker->randomHtml(),
        'group' => $group->id,
      ]);

    $response->assertStatus(201);
  }

  /**
   * Test if document can be updated as an Admin
   *
   * @return void
   */
  public function testUpdateDocumentAdmin ()
  {
    $admin = User::where('is_admin', 1)->first();
    $document = Document::latest()->first();
    $faker = Factory::create();
    $group = Group::inRandomOrder()->first();


    $response = $this->actingAs($admin, 'api')
      ->json('PUT', '/api/documents/'.$document->id, [
        'name' => $document->name . ' updated',
        'content' => $faker->randomHtml(),
        'group' => $group->id,
      ]);

    $response->assertStatus(200);
  }

  /**
   * Test if a document can be duplicated  as an Admin
   *
   * @return void
   */
  public function testDuplicateDocumentAdmin ()
  {
    $admin = User::where('is_admin', 1)->first();
    $document = Document::latest()->first();

    $response = $this->actingAs($admin, 'api')
      ->json('GET', '/api/documents/'.$document->id.'/duplicate');

    $response->assertStatus(201)
      ->assertJsonFragment([
        'name' => 'Copy of ' . $document->name,
      ]);
  }

  /**
   * Test if a document can be removed  as an Admin
   *
   * @return void
   */
  public function testRemoveDocumentAdmin ()
  {
    $admin = User::where('is_admin', 1)->first();
    $document = Document::latest()->first();

    $response = $this->actingAs($admin, 'api')
      ->json('DELETE', '/api/documents/'.$document->id);

    $response->assertStatus(200)
      ->assertJson([
        'message' => 'The Document ' . $document->name . ' was removed succesfully'
      ]);
  }

  /**
   * Test if the api creates a Document succesfully  as a User
   *
   * @return void
   */
  public function testCreateDocumentUser ()
  {
    $faker = Factory::create();
    $user = User::where('is_admin', 0)->first();
    $group = Group::inRandomOrder()->first();

    $response = $this->actingAs($user, 'api')
      ->json('POST', '/api/documents', [
        'name' => $faker->company,
        'content' => $faker->randomHtml(),
        'group' => $group->id,
      ]);

    $response->assertStatus(403);
  }

  /**
   * Test if document can be updated as a User
   *
   * @return void
   */
  public function testUpdateDocumentUser ()
  {
    $user = User::where('is_admin', 0)->first();
    $document = Document::latest()->first();
    $faker = Factory::create();
    $group = Group::inRandomOrder()->first();


    $response = $this->actingAs($user, 'api')
      ->json('PUT', '/api/documents/'.$document->id, [
        'name' => $document->name . ' updated',
        'content' => $faker->randomHtml(),
        'group' => $group->id,
      ]);

    $response->assertStatus(403);
  }

  /**
   * Test if a document can be duplicated  as a User
   *
   * @return void
   */
  public function testDuplicateDocumentUser ()
  {
    $user = User::where('is_admin', 0)->first();
    $document = Document::latest()->first();

    $response = $this->actingAs($user, 'api')
      ->json('GET', '/api/documents/'.$document->id.'/duplicate');

    $response->assertStatus(403);
  }

  /**
   * Test if a document can be removed  as a User
   *
   * @return void
   */
  public function testRemoveDocumentUser ()
  {
    $user = User::where('is_admin', 0)->first();
    $documents = Document::latest()->take(2)->get();

    foreach ($documents as $document) {
      $response = $this->actingAs($user, 'api')
        ->json('DELETE', '/api/documents/'.$document->id);

      $response->assertStatus(403);
    }

  }
}
