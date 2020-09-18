<?php

namespace App\Mail;

use App\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class NotifySubmission extends Mailable
{
  use Queueable, SerializesModels;

  protected $document;

  /**
   * Create a new message instance.
   *
   * @return void
   */
  public function __construct(Document $document)
  {
    $this->document = $document;
  }

  /**
   * Build the message.
   *
   * @return $this
   */
  public function build()
  {
    return $this->from(env('MAIL_FROM_ADDRESS'))
        ->subject('A document has been submitted.')
        ->view('mail.document.submitted')->with([
            'document' => $this->document,
        ]);
  }
}
