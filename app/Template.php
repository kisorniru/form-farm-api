<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Spatie\Activitylog\Traits\LogsActivity;

class Template extends Model
{
  use LogsActivity;

  protected static $logFillable = true;

  protected static $logName = 'Template';

  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */
  protected $fillable = [
    'name',
    'description',
    'content',
    'message',
    'status',
    'type',
    'pdf_path',
    'preview_updated_at',
    'qr_web',
    'qr_app',
  ];

  /**
   * Get the Description of the event
   *
   * @param string
   * @return string
   */
  public function getDescriptionForEvent(string $eventName): string
  {
    return "The Template has been {$eventName}";
  }


  /**
   * The Relationship with fields (belongsToMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function fields () : Relation
  {
    return $this->belongsToMany(Field::class)
                ->withPivot([
                  'name',
                  'position',
                  'details',
                  'placeholder',
                  'metadata',
                  'is_required',
                  'created_at',
                  'updated_at',
                ])
                ->withTimestamps();
  }

  /**
   * The Relationship with groups (belongsToMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function groups () : Relation
  {
    return $this->belongsToMany(Group::class)->withTimestamps();
  }

  /**
   * The Relationship with Documents (hasMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function documents () : Relation
  {
    return $this->hasMany(Document::class);
  }

  /**
   * The Relationship with Customers(belongsToMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function customers(): Relation
  {
    return $this->belongsToMany(Customer::class)->withTimestamps();
  }

  /**
   * Get the preview URL.
   *
   * @return string|null
   */
  public function getPreviewURL(): ?string
  {
    $url = null;
    if ($this->pdf_path) {
      $path = preg_replace('/^public\//i', '', $this->pdf_path);
      $url = asset('storage/' . $path);
    }
    return $url;
  }
  /**
   * Get the Web QR Code URL.
   *
   * @return string|null
   */
  public function getQRweb(): ?string
  {
    $url = null;
    if ($this->qr_web) {
      $path = preg_replace('/^public\//i', '', $this->qr_web);
      $url = asset('storage/' . $path);
    }
    return $url;
  }
  /**
   * Get the Id QR Code URL.
   *
   * @return string|null
   */
  public function getQRid(): ?string
  {
    $url = null;
    if ($this->qr_app) {
      $path = preg_replace('/^public\//i', '', $this->qr_app);
      $url = asset('storage/' . $path);
    }
    return $url;
  }



}
