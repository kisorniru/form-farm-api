<?php

/* @var $factory \Illuminate\Database\Eloquent\Factory */

use App\Document;
use Faker\Generator as Faker;

$factory->define(Document::class, function (Faker $faker) {
  $useTemplate = rand(0, 1) ? true : false;
  $type = 'content';
  return [
    'name' => $faker->jobTitle . ' at ' . $faker->company,
    'status' => 'pending',
    'type' => 'content',
    'use_template' => $useTemplate,
    'content' => $useTemplate ? null : '<p>' . $faker->realText(800, 2) . '</p>',
    'user_id' => 1,
  ];
});
