<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Spatie\Activitylog\Traits\LogsActivity;

class Category extends Model
{
  use LogsActivity;

  protected static $logFillable = true;

  protected static $logName = 'Category';

  protected $fillable = [
    'name',
  ];

  /**
   * Get the Description of the event
   *
   * @param string
   * @return string
   */
  public function getDescriptionForEvent(string $eventName): string
  {
    return "The Category has been {$eventName}";
  }

  /**
   * The relationship with fields (belongsToMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function fields(): Relation
  {
    return $this->belongsToMany(Field::class);
  }
}
