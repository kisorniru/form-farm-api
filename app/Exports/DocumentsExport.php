<?php

namespace App\Exports;

use App\Document;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;

class DocumentsExport implements FromArray, WithStrictNullComparison
{
  use Exportable;

  protected $data;

  /**
   * Instance of the class
   *
   */
  public function __construct(array $data)
  {
    $this->data = $data;
  }
  /**
   * @return array
   */
  public function array(): array
  {
    return $this->data;
  }
}
