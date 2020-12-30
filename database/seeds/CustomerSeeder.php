<?php

use App\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {
    $customer = Customer::create([ // ID 1
      'name' => 'ESPARZA ENTERPRISES'
    ]);

    $customer->createAsStripeCustomer();
  }
}
