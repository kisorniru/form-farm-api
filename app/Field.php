<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Spatie\Activitylog\Traits\LogsActivity;

class Field extends Model
{

  use LogsActivity;

  protected static $logFillable = true;

  protected static $logName = 'Field';

  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */
  protected $fillable = [
    'name',
    'slug',
    'type',
    'details',
    'placeholder',
    'metadata',
    'is_required'
  ];

  /**
   * Get the Description of the event
   *
   * @param string
   * @return string
   */
  public function getDescriptionForEvent(string $eventName): string
  {
    return "The Field has been {$eventName}";
  }

  /**
   * The attributes that should be hidden for arrays.
   *
   * @var array
   */
  protected $hidden = [];

  /**
   * The attributes that should be cast to native types.
   *
   * @var array
   */
  protected $casts = [];

  /**
   * The Relationship with categories (belongsToMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function categories(): Relation
  {
    return $this->belongsToMany(Category::class);
  }

  /**
   * The Relationship with templates (belongsToMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function templates(): Relation
  {
    return $this->belongsToMany(Template::class)
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
   * The Relationship with Documents (belongsToMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function documents(): Relation
  {
    return $this->belongsToMany(Document::class)
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
}
