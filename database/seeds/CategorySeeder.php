<?php

use App\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {
    // factory(\App\Category::class, 20)->create();
    Category::create([ // ID 1
      'name' => 'Contact Information'
    ]);

    Category::create([ // ID 2
      'name' => 'General'
    ]);
  }
}
