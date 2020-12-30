<?php

namespace App\Mail;

use App\Document;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Contracts\Queue\ShouldQueue;

class SendDocument extends Mailable
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
        ->subject('You have received a document.')
        ->view('mail.document.send')->with([
            'document' => $this->document,
        ]);
  }
}
