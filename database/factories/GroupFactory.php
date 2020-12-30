<?php

/* @var $factory \Illuminate\Database\Eloquent\Factory */

use App\Model;
use Faker\Generator as Faker;

$factory->define(\App\Group::class, function (Faker $faker) {
  return [
    'name'  => $faker->jobTitle,
    'description' => $faker->text(),
    'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
    'updated_at' => $faker->dateTimeBetween('-1 year', 'now'),
  ];
});
