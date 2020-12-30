<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class GroupResource extends JsonResource
{
  /**
   * Transform the resource into an array.
   *
   * @param  \Illuminate\Http\Request  $request
   * @return array
   */
  public function toArray($request)
  {
    $data = [
      'id' => $this->id,
      'name' => $this->name,
      'description' => $this->description,
      'customer' => $this->customer_id,
      'role' => $this->roles()->count() > 0 ? $this->roles()->first()->id : null,
      'created_at' => Carbon::parse($this->created_at)->format('d/m/Y'),
      'updated_at' => Carbon::parse($this->updated_at)->format('d/m/Y'),
    ];

    if ($request->query('with')) {
      $data['templates'] = $this->templates()->count() ? $this->templates()->get() : [];
    }

    return $data;
  }
}
