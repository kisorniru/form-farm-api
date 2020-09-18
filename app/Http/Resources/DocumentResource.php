<?php

namespace App\Http\Resources;

use Carbon\Carbon;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
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
      'id' =>  $this->id,
      'name' => $this->name,
      'use_template' => $this->use_template,
      'template' => $this->template ? $this->template->id : null,
      'type' => $this->type,
      'content' => $this->use_template ? null : $this->content,
      'preview_url' => ($this->preview) ? url($this->getPreviewURL()) : '',
      'qr_web' => ($this->qr_web) ? url($this->getQRweb()) : '',
      'qr_app' => ($this->qr_app) ? url($this->getQRid()) : '',
      'customer' => $this->customer_id,
      'customer_name' => $this->customer ? $this->customer->name : null,
      'user' => $this->user_id,
      'user_name' => $this->user ? $this->user->name : null,
      'status' => $this->status,
      'isSubmitted' => $this->status == 'submitted' ? true : false,
      'submitter' => $this->status == 'submitted' && isset($this->receiver) ? $this->receiver->submitter->id : null,
      'submitter_name' => $this->status == 'submitted' && isset($this->receiver) ? $this->receiver->submitter->name : null,
      'created_at' => Carbon::parse($this->created_at)->format('m/d/Y'),
      'updated_at' => Carbon::parse($this->updated_at)->format('m/d/Y'),
    ];
  }
}
