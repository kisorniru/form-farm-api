<?php

/* @var $factory \Illuminate\Database\Eloquent\Factory */

use App\Category;
use Faker\Generator as Faker;

$factory->define(Category::class, function (Faker $faker) {
  return [
    'name' => $faker->words(rand(1, 5), true),
    'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
    'updated_at' => $faker->dateTimeBetween('-1 year', 'now'),
  ];
});
