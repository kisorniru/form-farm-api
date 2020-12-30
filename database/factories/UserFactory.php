<?php

/** @var \Illuminate\Database\Eloquent\Factory $factory */

use App\User;
use Illuminate\Support\Str;
use Faker\Generator as Faker;

/*
 *--------------------------------------------------------------------------
 * Model Factories
 *--------------------------------------------------------------------------
 *
 * This directory should contain each of the model factory definitions for
 * your application. Factories provide a convenient way to generate new
 * model instances for testing / seeding your application's database.
 *
 */

$factory->define(User::class, function (Faker $faker) {
  $firstName = $faker->firstName();
  $lastName = $faker->lastName;
  $name = $firstName . ' ' . $lastName;
  return [
    'name' => $name,
    'first_name' => $firstName,
    'last_name' => $lastName,
    'company' => $faker->company,
    'email' => $faker->unique()->safeEmail,
    'email_verified_at' => now(),
    'password' => '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // password
    'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
    'updated_at' => $faker->dateTimeBetween('-1 year', 'now'),
  ];
});
