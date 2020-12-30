<?php

use App\Field;
use Faker\Factory;
use Illuminate\Database\Seeder;

class FieldSeeder extends Seeder
{
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {
    $faker = Factory::create();

    $fields = [
      [
        'name'        => 'First name',
        'slug'        => 'first_name',
        'type'        => 'text_field',
        'details'     => '',
        'placeholder' => $faker->firstName,
        'metadata'    => null,
        'category'    => 1
      ],
      [
        'name'        => 'Last name',
        'slug'        => 'last_name',
        'type'        => 'text_field',
        'details'     => '',
        'placeholder' => $faker->lastName,
        'metadata'    => null,
        'category'    => 1
      ],
      [
        'name'        => 'Email',
        'slug'        => 'email',
        'type'        => 'text_email',
        'details'     => '',
        'placeholder' => $faker->safeEmail,
        'metadata'    => null,
        'category'    => 1
      ],
      [
        'name'        => 'Phone',
        'slug'        => 'phone',
        'type'        => 'text_tel',
        'details'     => '',
        'placeholder' => $faker->tollFreePhoneNumber,
        'metadata'    => null,
        'category'    => 1
      ],
      [
        'name'        => 'Date',
        'slug'        => 'date',
        'type'        => 'date',
        'details'     => '',
        'placeholder' => '__/__/____',
        'metadata'    => null,
        'category'    => 2
      ],
      [
        'name'        => 'SSN',
        'slug'        => 'ssn',
        'type'        => 'text_field',
        'details'     => '',
        'placeholder' => $faker->ssn,
        'metadata'    => null,
        'category'    => 1
      ],
      [
        'name'        => 'Age',
        'slug'        => 'age',
        'type'        => 'text_number',
        'details'     => '',
        'placeholder' => '40',
        'metadata'    => null,
        'category'    => 2
      ],
      [
        'name'        => 'Message',
        'slug'        => 'message',
        'type'        => 'text_area',
        'details'     => '',
        'placeholder' => '',
        'metadata'    => null,
        'category'    => 2
      ],
      [
        'name'        => 'Password',
        'slug'        => 'password',
        'type'        => 'text_password',
        'details'     => '',
        'placeholder' => '••••••••••••',
        'metadata'    => null,
        'category'    => 2
      ],
      [
        'name'        => 'Signature',
        'slug'        => 'signature',
        'type'        => 'signature',
        'details'     => '',
        'placeholder' => '',
        'metadata'    => null,
        'category'    => 2
      ],
      [
        'name'        => 'Location',
        'slug'        => 'location',
        'type'        => 'location',
        'details'     => '',
        'placeholder' => '',
        'metadata'    => null,
        'category'    => 1
      ],
      [
        'name'        => 'Information',
        'slug'        => 'information',
        'type'        => 'information',
        'details'     => '',
        'placeholder' => '',
        'metadata'    => null,
        'category'    => 2
      ],
    ];

    foreach ($fields as $info) {
      $category = $info['category'];
      unset($info['category']);
      $field = Field::create($info);
      $field->categories()->attach($category);
    }
  }
}
