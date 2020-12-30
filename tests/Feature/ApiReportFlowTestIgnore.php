<?php

namespace Tests\Feature;

use App\Document;
use App\Report;
use App\User;
use Faker\Factory;
use Tests\TestCase;
use Illuminate\Foundation\Testing\WithFaker;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiReportFlowTest extends TestCase
{
  /**
   * Test if an user (admin or normal) can create a report
   *
   * @return void
   */
  public function testCreateReport ()
  {
    $user = User::inRandomOrder()->first();
    $document = Document::first();
    $report = $this->buildReport();
    $report['document'] = $document->id;

    $response = $this->actingAs($user, 'api')
      ->json('POST', '/api/reports', $report);

    $response->assertStatus(201);
  }

  /**
   * Test if an user (admin or normal) can update a report
   *
   * @return void
   */
  public function testUpdateReport ()
  {
    $user = User::inRandomOrder()->first();
    $report = Report::latest()->first();
    $data = $this->buildReport();

    $response = $this->actingAs($user, 'api')
      ->json('PUT', '/api/reports/'.$report->id, $data);

    $response->assertStatus(200);
    return true;
  }

  /**
   * Test if an user can attach a field to the report
   *
   * @depends testCreateReport
   * @return void
   */
  public function testAddFieldToReport ()
  {
    $user = User::inRandomOrder()->first();
    $report = Report::latest()->first();
    $document = $report->document;
    $field = $document->fields()->first();
    $faker = Factory::create();

    $response = $this->actingAs($user, 'api')
      ->json('POST', '/api/reports/'.$report->id.'/fields', [
        'field' => $field->id,
        'value' => $faker->sentence(),
      ]);

    $response->assertStatus(200);
  }

  /**
   * Test if an user can update an attached field to the report
   *
   * @depends testAddFieldToReport
   * @return void
   */
  public function testUpdateFieldToReport ()
  {
    $user = User::inRandomOrder()->first();
    $report = Report::latest()->first();
    $field = $report->document->fields()->first();
    $faker = Factory::create();

    $response = $this->actingAs($user, 'api')
      ->json('PUT', '/api/reports/'.$report->id.'/fields/'.$field->id, [
        'value' => $faker->sentence(),
      ]);

    $response->assertStatus(200);
  }

  /**
   * Test if an user can update an attached field to the report
   *
   * @depends testUpdateFieldToReport
   * @return void
   */
  public function testDeleteFieldFromReport ()
  {
    $user = User::inRandomOrder()->first();
    $report = Report::latest()->first();
    $field = $report->document->fields()->first();

    $response = $this->actingAs($user, 'api')
      ->json('DELETE', '/api/reports/'.$report->id.'/fields/'.$field->id);

    $response->assertStatus(200);
  }

  /**
   * Test if an user can remove a report
   *
   * @return void
   */
  public function testRemoveReportAsUser ()
  {
    $user = User::where('is_admin', 0)->first();
    $report = Report::latest()->first();

    $response = $this->actingAs($user, 'api')
    ->json('DELETE', '/api/reports/'.$report->id);

    $response->assertStatus(403);
  }

  /**
   * Test if an admin can remove a report
   *
   * @depends testRemoveReportAsUser
   * @return void
   */
  public function testRemoveReportAsAdmin ()
  {
    $admin = User::where('is_admin', 1)->first();
    $report = Report::latest()->first();

    $response = $this->actingAs($admin, 'api')
      ->json('DELETE', '/api/reports/'.$report->id);

    $response->assertStatus(200);
  }

  private function buildReport ()
  {
    $faker = Factory::create();
    $name = $faker->firstName() . ', ' . $faker->jobTitle . ' at ' . $faker->company;

    return [
      'name' => $name,
    ];
  }
}
