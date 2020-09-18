<?php

/* @var $factory \Illuminate\Database\Eloquent\Factory */

use Faker\Generator as Faker;

$factory->define(\App\Template::class, function (Faker $faker) {
  return [
    'name' => $faker->jobTitle,
    'description' => $faker->realText(100, 2),
    'content' => '<p>' . $faker->realText(800, 2) . '</p>',
    'message' => 'Thanks for submitting the form',
    'status' => 'draft',
    'type' => 'content',
    'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
    'updated_at' => $faker->dateTimeBetween('-6 months', 'now'),
  ];
});
