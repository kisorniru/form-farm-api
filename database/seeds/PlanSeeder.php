<?php

use App\Plan;
use Illuminate\Database\Seeder;
use Stripe\Plan as StripePlan;
use Stripe\Stripe;

class PlanSeeder extends Seeder
{
  public function __construct()
  {
    Stripe::setApiKey(env('STRIPE_SECRET'));
  }
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {
    $plans = [
      [
        'name' => 'Starter',
        'amount' => 120.00,
        'description' => 'Starter billed Monthly',
        'interval' => 'month',
      ],
      [
        'name' => 'Starter',
        'amount' => 1080.00,
        'description' => 'Starter billed Yearly',
        'interval' => 'year',
      ],
      [
        'name' => 'Growing Business',
        'amount' => 199.00,
        'description' => 'Growing Business billed Monthly',
        'interval' => 'month',
      ],
      [
        'name' => 'Growing Business',
        'amount' => 1552.20,
        'description' => 'Growing Business billed yearly',
        'interval' => 'year',
      ],
      [
        'name' => 'Organization',
        'amount' => 249.99,
        'description' => 'Organization billed monthly',
        'interval' => 'month',
      ],
      [
        'name' => 'Organization',
        'amount' => 2249.99,
        'description' => 'Organization billed Yearly',
        'interval' => 'year',
      ],
    ];

    foreach ($plans as $data) {
      $plan = new Plan($data);
      $stripePlan = StripePlan::create([
        'amount' => $plan->buildStripeAmount(),
        'interval' => $plan->interval,
        'product' => ['name' => $plan->name],
        'metadata' => ['description' => $plan->description],
        'currency' => 'usd',
      ]);
      $plan->stripe_id = $stripePlan->id;
      $plan->save();
    }
  }
}
