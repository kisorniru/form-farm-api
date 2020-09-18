<?php

namespace App;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Relation;
use Spatie\Activitylog\Traits\LogsActivity;

class Receiver extends Model
{

  use LogsActivity;

  protected static $logFillable = true;

  protected static $logName = 'Receiver';

  protected $fillable = [
    'email',
    'status',
    'sent_on',
  ];

  /**
   * Get the Description of the event
   *
   * @param string
   * @return string
   */
  public function getDescriptionForEvent(string $eventName): string
  {
    if ($eventName == 'created') {
      return 'The document was sent to the receiver';
    }

    return "The Receiver has been {$eventName}";
  }


  /**
   * The relationship with Document (belongs To)
   *
   * @return \Illuminate\Database\Eloquent\Relations\Relation
   */
  public function document () : Relation
  {
    return $this->belongsTo(Document::class);
  }

  /**
   * The relationship with Submittter (belongsTo)
   */
  public function submitter () : Relation
  {
    return $this->belongsTo(User::class);
  }
}
