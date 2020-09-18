<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class CustomerResource extends JsonResource
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
      'initials' => $this->initials(),
      'name' => $this->name,
      'email' => !is_null($this->email) ? $this->email : '',
      'header' => $this->header ? url($this->getHeaderURL()) : '',
      'footer' => $this->footer ? url($this->getFooterURL()) : '',
      'icon' => $this->icon ? url($this->getIconURL()) : '',
      'created_at' => Carbon::parse($this->created_at)->format('m/d/Y'),
      'updated_at' => Carbon::parse($this->updated_at)->format('m/d/Y'),
    ];

    if ($request->query('with')) {
      $data['templates'] = $this->templates()->count() ? $this->templates()->get() : [];
    }

    return $data;
  }
}
