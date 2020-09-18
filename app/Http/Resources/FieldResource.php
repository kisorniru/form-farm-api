<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class FieldResource extends JsonResource
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
      'slug' => $this->slug,
      'type' => $this->type,
      'details' => $this->details,
      'placeholder' => $this->placeholder,
      'metadata' => $this->metadata,
      'categories' => $this->categories->pluck('id'),
      'required' => $this->is_required ? true : false,
      'created_at' => Carbon::parse($this->created_at)->format('d/m/Y'),
      'updated_at' => Carbon::parse($this->updated_at)->format('d/m/Y'),
    ];
  }
}
