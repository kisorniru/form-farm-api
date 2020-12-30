<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;

class Role extends Model
{
  protected $fillable = [
    'name',
    'description',
    'privileges',
    'access',
  ];

  /**
   * The relation with groups (Belongs to many)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function groups(): Relation
  {
    return $this->belongsToMany(Group::class);
  }

  /**
   * The relationship with Users (Belongs to many)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function users(): Relation
  {
    return $this->belongsToMany(User::class);
  }
}
