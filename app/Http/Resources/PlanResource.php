<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class PlanResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @param  \Illuminate\Http\Request  $request
   * @return array
   */
  public function toArray($request)
  {
    return [
      'id' => $this->id,
      'name' => $this->name,
      'amount' => $this->amount,
      'amount_value' => '$ ' . strval(number_format($this->amount, 2)),
      'interval' => $this->interval,
      'description' => $this->description,
      'stripe_id' => $this->stripe_id,
      'created_at' => Carbon::parse($this->created_at)->format('d/m/Y'),
      'updated_at' => Carbon::parse($this->updated_at)->format('d/m/Y'),
    ];
  }
}
