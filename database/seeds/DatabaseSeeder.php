<?php

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
  /**
   * Seed the application's database.
   *
   * @return void
   */
  public function run()
  {
    $this->call(RoleSeeder::class);
    $this->call(PlanSeeder::class);
    $this->call(CustomerSeeder::class);
    $this->call(GroupSeeder::class);
    $this->call(CategorySeeder::class);
    $this->call(UserSeeder::class);
    $this->call(FieldSeeder::class);
    // $this->call(TemplateSeeder::class);
    // $this->call(DocumentSeeder::class);
  }
}
