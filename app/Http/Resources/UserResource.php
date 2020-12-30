<?php

namespace App\Http\Resources;

use App\Http\Resources\GroupResource;
use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
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
      'image' => $this->image ? $this->getImageURL() : '',
      'first_name' => $this->first_name,
      'last_name' => $this->last_name,
      'email' => $this->email,
      'phone_number' => $this->phone_number,
      'company' => $this->company,
      'admin' => $this->is_admin(),
      'customer' => $this->customers()->first(),
      'group' => $this->groups()->first(),
      'role' => $this->getTheUserRole(false),
      'created_at' => Carbon::parse($this->created_at)->format('d/m/Y'),
      'updated_at' => Carbon::parse($this->updated_at)->format('d/m/Y'),
    ];
  }
}
