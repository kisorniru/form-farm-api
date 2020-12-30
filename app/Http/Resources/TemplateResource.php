<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Carbon;

class TemplateResource extends JsonResource
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
      'status' => $this->status,
      'description' => $this->description,
      'type' => $this->type,
      'content' => $this->content,
      'message' => $this->message,
      'qr_web' => ($this->qr_web) ? url($this->getQRweb()) : '',
      'qr_app' => ($this->qr_app) ? url($this->getQRid()) : '',
      'preview_url' => ($this->pdf_path) ? url($this->getPreviewURL()) : '',
      'preview_updated_at' => Carbon::parse($this->preview_updated_at)->format('m/d/Y'),
      'created_at' => Carbon::parse($this->created_at)->format('m/d/Y'),
      'updated_at' => Carbon::parse($this->updated_at)->format('m/d/Y'),
    ];
  }
}
