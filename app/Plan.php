<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Plan extends Model
{
  protected $fillable = [
    'name',
    'amount',
    'interval',
    'description',
    'stripe_id',
  ];

  protected $casts = [
    'amount' => 'float',
  ];


  /**
   * return the Plan name in kebab case
   *
   * @return string|null
   */
  public function getThePlanId(): ?string
  {
    return strtolower(implode('-',explode(" ", $this->name)));
  }

  /**
   * Convert the Plan amount to a Stripe amount
   *
   * @return int
   */
  public function buildStripeAmount(): int
  {
    return (int)($this->amount * 100);
  }
}
