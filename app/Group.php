<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Spatie\Activitylog\Traits\LogsActivity;

class Group extends Model
{

  use LogsActivity;

  protected static $logFillable = true;

  protected static $logName = 'Group';

  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */
  protected $fillable = [
    'name', 'description'
  ];

  /**
   * Get the Description of the event
   *
   * @param string
   * @return string
   */
  public function getDescriptionForEvent(string $eventName): string
  {
    return "The Group has been {$eventName}";
  }


  /**
   * The relationship with User (belongsToMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function users(): Relation
  {
    return $this->belongsToMany(User::class);
  }

  /**
   * The relationship with Templates (hasMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function templates(): Relation
  {
    return $this->belongsToMany(Template::class)->withTimestamps();
  }

  /**
   * The relationship with Customers (belongsTo)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function customer(): Relation
  {
    return $this->belongsTo(Customer::class);
  }

  /**
   * The relationship with Roles (belongsToMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function roles(): Relation
  {
    return $this->belongsToMany(Role::class);
  }
}
