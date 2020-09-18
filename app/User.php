<?php

namespace App;

use Illuminate\Notifications\Notifiable;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Spatie\Activitylog\Traits\LogsActivity;
use Tymon\JWTAuth\Contracts\JWTSubject;

class User extends Authenticatable implements JWTSubject
{
  use Notifiable;
  use LogsActivity;

  protected static $logFillable = true;

  protected static $logName = 'User';

  /**
   * The attributes that are mass assignable.
   *
   * @var array
   */
  protected $fillable = [
    'name', 'email', 'password', 'first_name', 'last_name', 'is_admin', 'company', 'image', 'phone_number'
  ];

  /**
   * The attributes that should be hidden for arrays.
   *
   * @var array
   */
  protected $hidden = [
    'password', 'remember_token', 'api_token'
  ];

  /**
   * The attributes that should be cast to native types.
   *
   * @var array
   */
  protected $casts = [
    'email_verified_at' => 'datetime',
  ];

  /**
   * Get the Description of the event
   *
   * @param string
   * @return string
   */
  public function getDescriptionForEvent(string $eventName): string
  {
    return "The User has been {$eventName}";
  }


  /**
   * Get the identifier that will be stored in the subject claim of the JWT.
   *
   * @return mixed
   */
  public function getJWTIdentifier()
  {
    return $this->getKey();
  }
  /**
   * Return a key value array, containing any custom claims to be added to
   * the JWT.
   *
   * @return array
   */
  public function getJWTCustomClaims()
  {
    return [];
  }

  /**
   * Check if the User is an Admin
   *
   * @return boolean
   */
  public function is_admin ()
  {
    return $this->hasPrivilege('edit') && $this->hasAccess('everything');
  }

  /**
   * Check if the user has Access
   * - Everything (everything)
   * - Customers (customers)
   * - Dashboard (dashboard)
   * - Settings (settings)
   * - Documents (documents)
   *
   * @param string $access
   * @return boolean
   */
  public function hasAccess($access)
  {
    $role = $this->getTheUserRole();
    if ($role) {
      return strpos($role->access, $access) !== false;
    }

    return false;
  }

  /**
   * Check if the user has privileges
   * - View (view)
   * - View & Edit (edit)
   *
   * @param string $privilege
   * @return boolean
   */
  public function hasPrivilege($privilege)
  {
    $role = $this->getTheUserRole();
    if ($role) {
      return strpos($role->privileges, $privilege) !== false;
    }

    return false;
  }

  /**
   * The relationship with Groups (belongsToMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function groups(): Relation
  {
    return $this->belongsToMany(Group::class);
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
   * The relationship with Customer (hasMany)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function customers(): Relation
  {
    return $this->belongsToMany(Customer::class);
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

  /**
   * Get the image URL.
   *
   * @return string|null
   */
  public function getImageURL(): ?string
  {
    $url = null;
    if ($this->image) {
      $path = preg_replace('/^public\//i', '', $this->image);
      $url = asset('storage/' . $path);
    }
    return $url;
  }

  /**
   * Return the User role
   *
   * @param int $complete
   * @return object|int|null
   */
  public function getTheUserRole($complete = true)
  {
    $role = $this->roles()->first();
    $group = $this->groups()->first();

    if ($role) {
      return $complete ? $role : $role->id;
    }

    if ($group) {
      $role = $group->roles()->first();
      if ($role) {
        return $complete ? $role : $role->id;
      }
    }

    return null;
  }
}
