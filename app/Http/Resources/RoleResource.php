<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleResource extends JsonResource
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
      'description' => $this->description,
      'privileges' => $this->privileges,
      'access' => $this->access,
      'created_at' => Carbon::parse($this->created_at)->format('m/d/Y'),
      'updated_at' => Carbon::parse($this->updated_at)->format('m/d/Y'),
    ];
  }
}
