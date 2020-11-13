<?php

use App\Customer;
use App\User;
use Illuminate\Database\Seeder;

class UserSeeder extends Seeder
{
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {

    $users = [
      [
        'name' => 'José Galdámez',
        'first_name' => 'José',
        'last_name' => 'Galdámez',
        'password' => '$2y$10$l29kqRkmCT6eCbF3SO1s3uc5pcUmRX7DZ26.Vo2KSC/eqqcJjl4.O', // abcd1234
        'company' => 'Kettle, LLC',
        'email' => 'jose@kettle.io',
        'phone_number' => '(234) 235-2350',
        'is_admin' => 1,
        'group' => 1,
      ],
      [
        'name' => 'José Galdámez',
        'first_name' => 'José',
        'last_name' => 'Galdámez',
        'password' => '$2y$10$l29kqRkmCT6eCbF3SO1s3uc5pcUmRX7DZ26.Vo2KSC/eqqcJjl4.O', // abcd1234
        'company' => 'Kettle, LLC',
        'email' => 'test@test.com',
        'phone_number' => '(234) 235-2350',
        'is_admin' => 1,
        'group' => 1,
      ],
      [
        'name' => 'Drew Witmer',
        'first_name' => 'Drew',
        'last_name' => 'Witmer',
        'password' => '$2y$10$1fOd4jSDJ7I1aQZnuitTD.Finj9MYnB7yCSZ02F4EbTv05cQBPeAm',
        'company' => 'Kettle, LLC',
        'email' => 'drew@kettle.io',
        'phone_number' => '7603100783',
        'is_admin' => 1,
        'group' => 1,
      ],
      [
        'name' => 'Adan Archila',
        'first_name' => 'Adan',
        'last_name' => 'Archila',
        'password' => '$2y$10$uBMoam72hbT0LzJ7hMjduuRc3vqIYzXDRMWsbpJyGqYKv9RxzzRj6',
        'company' => 'AMP',
        'email' => 'adan@amp.build',
        'is_admin' => 1,
        'group' => 1,
      ],
      [
        'name' => 'Chad Alderson',
        'first_name' => 'Chad',
        'last_name' => 'Alderson',
        'password' => '$2y$10$WaGd8jqGIdUrO6/7W8lO7u6HfTJmphflfuAfiGIrz8DEBLBcBw/dK',
        'company' => 'AMP',
        'email' => 'chad@amp.build',
        'is_admin' => 1,
      ],
      [
        'name' => 'Justin Eddleman',
        'first_name' => 'Justin',
        'last_name' => 'Eddleman',
        'password' => '$2y$10$5nt7nBlH781LjxLWmVC8nO/Z7uRHGcu7EIz7YDN2510Iy53AZvbGa',
        'company' => 'Axxis',
        'email' => 'justin.eddleman@axxisgroup.com',
        'phone_number' => '661-903-2947',
        'is_admin' => 1,
      ],
      [
        'name' => 'Monkey Wrench',
        'first_name' => 'Monkey',
        'last_name' => 'Wrench',
        'password' => '$2y$10$aZuivPuAPcb6azHvwIrfg.iNMcTjiwvxCOgR0KHRNLcr.jDAR48e6',
        'company' => 'MMI Services',
        'email' => 'monkey@mmi-services.com',
        'is_admin' => 1,
      ],
    ];

    foreach ($users as $data) {
      $group = isset($data['group']) ? $data['group'] : null;

      if ($group) {
        unset($data['group']);
      }

      $user = User::create($data);

      if ($group) {
        $user->groups()->attach($group);
      }
      $user->customers()->attach(1); // attach to the Customer "Sparza Enterprises"

      if ($data['is_admin'] == 1) {
        $user->roles()->attach(1); // attach the Admin role
      }
    }
  }
}
