<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Spatie\Activitylog\Traits\LogsActivity;

class Document extends Model
{
  use LogsActivity;

  protected static $logFillable = true;

  protected static $logName = 'Document';

  protected $fillable = [
    'name',
    'status',
    'type',
    'preview',
    'qr_web',
    'qr_app',
    'use_template',
    'content',
    'pdf_id',
    'original_name',
    'parent_id',
  ];

  protected $casts = [
    'use_template' => 'boolean',
  ];

  /**
   * Get the Description of the event
   *
   * @param string
   * @return string
   */
  public function getDescriptionForEvent(string $eventName): string
  {
    return "The Document has been {$eventName}";
  }


  /**
   * The relationship with Template (Belongs To)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function template(): Relation
  {
    return $this->belongsTo(Template::class);
  }

  /**
   * the relationship with user (Belongs To)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function user(): Relation
  {
    return $this->belongsTo(User::class);
  }

  /**
   * The Relationship with the receiver (Has One)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function receiver(): Relation
  {
    return $this->hasOne(Receiver::class);
  }

  /**
   * The relationship with Fields (Belongs To Many)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function fields(): Relation
  {
    return $this->belongsToMany(Field::class)
      ->withPivot([
        'created_at',
        'updated_at',
        'value',
        'disabled',
        'name',
        'details',
        'placeholder',
        'metadata',
        'is_required',
        'position',
        'is_exportable',
        'exportable_name',
      ])
      ->withTimestamps();
  }

  /**
   * The relationship with Customer (BelongsTo)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function customer(): Relation
  {
    return $this->belongsTo(Customer::class);
  }

  /**
   * Get the preview URL.
   *
   * @return string|null
   */
  public function getPreviewURL(): ?string
  {
    $url = null;
    if ($this->preview) {
      $path = preg_replace('/^public\//i', '', $this->preview);
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

  /**
   * Get the pdf Template name
   *
   * @return string
   */
  public function getPdfTemplate(): string
  {
    if (!is_null($this->pdf_id)) {
      return $this->pdf_id;
    }

    return 'documents.skeleton';
  }

  /**
   * Get the parent document
   *
   * @return Document|null
   */
  public function getParent()
  {
    if ($this->parent_id) {
      return Document::find($this->parent_id);
    }

    return null;
  }
}
