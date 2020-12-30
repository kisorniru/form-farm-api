<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Laravel\Cashier\Billable;
use Spatie\Activitylog\Traits\LogsActivity;

class Customer extends Model
{
  use LogsActivity;
  use Billable;

  protected static $logFillable = true;

  protected static $logName = 'Customer';

  protected $fillable = [
    'name',
    'email',
    'header',
    'footer',
    'icon'
  ];

  /**
   * Get the Description of the event
   *
   * @param string
   * @return string
   */
  public function getDescriptionForEvent(string $eventName): string
  {
    return "The Customer has been {$eventName}";
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
   * The relation with Groups (hasMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function groups(): Relation
  {
    return $this->hasMany(Group::class);
  }

  /**
   * The relationship with Documents (hasMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function documents(): Relation
  {
    return $this->hasMany(Document::class);
  }

  /**
   * The relationship with templates (hasMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function templates(): Relation
  {
    return $this->belongsToMany(Template::class)->withTimestamps();
  }

  public function owner(): Relation
  {
    return $this->belongsTo(User::class);
  }

  /**
   * Get the Header URL.
   *
   * @return string|null
   */
  public function getHeaderURL(): ?string
  {
    $url = null;
    if ($this->header) {
      $path = preg_replace('/^public\//i', '', $this->header);
      $url = asset('storage/' . $path);
    }
    return $url;
  }

  /**
   * Get the Header URL.
   *
   * @return string|null
   */
  public function getFooterURL(): ?string
  {
    $url = null;
    if ($this->footer) {
      $path = preg_replace('/^public\//i', '', $this->footer);
      $url = asset('storage/' . $path);
    }
    return $url;
  }
  /**
   * Get the Header URL.
   *
   * @return string|null
   */
  public function getIconURL(): ?string
  {
    $url = null;
    if ($this->icon) {
      $path = preg_replace('/^public\//i', '', $this->icon);
      $url = asset('storage/' . $path);
    }
    return $url;
  }

  /**
   * Get the Initials of the Customer
   *
   * @return string
   */
  public function initials () : string
  {
    $words = explode(" ", $this->name);
    $acronym = "";

    foreach ($words as $w) {
    $acronym .= $w[0];
    }

    return strtoupper(substr($acronym, 0, 2));
  }
}
