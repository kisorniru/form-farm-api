<?php

namespace Tests\Feature;

use App\Document;
use App\Field;
use App\Group;
use App\User;
use Faker\Factory;
use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiFieldFlowTest extends TestCase
{
  private $types = [
    0 => 'multiple_select',
    1 => 'text_field',
    2 => 'text_area',
    3 => 'signature',
    4 => 'location',
    5 => 'radio',
    6 => 'date',
    7 => 'info',
  ];

  /**
   * Test the api if an admin can create a field
   *
   * @return void
   */
  public function testCreateFieldAsAdmin ()
  {
    $admin = User::where('is_admin', 1)->first();
    $document = Document::latest()->first();
    $field = $this->getFakeFieldData();
    $field['document'] = $document->id;

    $response = $this->actingAs($admin, 'api')
      ->json('POST', '/api/fields', $field);

    $response->assertStatus(201);
  }

  /**
   * Test the api if an admin can update a field
   *
   * @return void
   */
  public function testUpdateFieldAsAdmin ()
  {
    $admin = User::where('is_admin', 1)->first();
    $field = Field::latest()->first();
    $data = $this->getFakeFieldData();

    $response = $this->actingAs($admin, 'api')
      ->json('PUT', '/api/fields/'.$field->id, $data);

    $response->assertStatus(200);
  }

  /**
   * Test the api if an admin can remove a field
   *
   * @return void
   */
  public function testDeleteFieldAsAdmin ()
  {
    $admin = User::where('is_admin', 1)->first();
    $field = Field::latest()->first();

    $response = $this->actingAs($admin, 'api')
      ->json('DELETE', '/api/fields/'.$field->id);

    $response->assertStatus(200);
  }

    /**
   * Test the api if a user can create a field
   *
   * @return void
   */
  public function testCreateFieldAsUser ()
  {
    $user = User::where('is_admin', 0)->first();
    $document = Document::latest()->first();
    $field = $this->getFakeFieldData();
    $field['document'] = $document->id;

    $response = $this->actingAs($user, 'api')
      ->json('POST', '/api/fields', $field);

    $response->assertStatus(403);
  }

  /**
   * Test the api if a user can update a field
   *
   * @return void
   */
  public function testUpdateFieldAsUser ()
  {
    $user = User::where('is_admin', 0)->first();
    $field = Field::latest()->first();
    $data = $this->getFakeFieldData();

    $response = $this->actingAs($user, 'api')
      ->json('PUT', '/api/fields/'.$field->id, $data);

    $response->assertStatus(403);
  }

  /**
   * Test the api if a user can remove a field
   *
   * @return void
   */
  public function testDeleteFieldAsUser ()
  {
    $user = User::where('is_admin', 0)->first();
    $field = Field::latest()->first();

    $response = $this->actingAs($user, 'api')
      ->json('DELETE', '/api/fields/'.$field->id);

    $response->assertStatus(403);
  }

  private function getFakeFieldData ()
  {
    $faker = Factory::create();
    $name = $faker->colorName;
    $type = $this->types[rand(0, 7)];

    if ($type == 'multiple_select' || $type == 'radio') {
      $options = $faker->words(rand(1, 10), false);
      $metadata['options'] = [];
      foreach ($options as $key => $option) {
        $metadata['options'][] = [
          'id' => $option,
          'label' => $option
        ];
      }
    } else {
      $metadata = null;
    }

    return [
      'position'    => $faker->randomDigit,
      'name'        => $faker->colorName,
      'slug'        => preg_replace('/\s+/', '_', strtolower($name)),
      'type'        => $type,
      'details'     => $faker->realText(10),
      'placeholder' => $faker->catchPhrase,
      'metadata'    => json_encode($metadata),
    ];
  }
}
