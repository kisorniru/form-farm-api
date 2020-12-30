<?php

/* @var $factory \Illuminate\Database\Eloquent\Factory */

use Faker\Generator as Faker;

$types = [
  0 => 'multiple_select',
  1 => 'text_field',
  2 => 'text_area',
  3 => 'signature',
  4 => 'location',
  5 => 'radio',
  6 => 'date',
  7 => 'info',
];

$factory->define(\App\Field::class, function (Faker $faker) use ($types) {
  $name = $faker->colorName;
  $type = $types[rand(0, 7)];

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
    'name'        => $faker->colorName,
    'slug'        => preg_replace('/\s+/', '_', strtolower($name)),
    'type'        => $type,
    'details'     => $faker->realText(10),
    'placeholder' => $faker->catchPhrase,
    'metadata'    => json_encode($metadata),
    'created_at' => $faker->dateTimeBetween('-1 year', 'now'),
    'updated_at' => $faker->dateTimeBetween('-1 year', 'now'),
  ];
});
