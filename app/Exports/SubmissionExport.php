<?php

namespace App\Exports;

use App\Document;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\Exportable;
use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithColumnFormatting;
use Maatwebsite\Excel\Concerns\WithStrictNullComparison;
use PhpOffice\PhpSpreadsheet\Style\NumberFormat;

class SubmissionExport implements FromArray, WithStrictNullComparison, WithColumnFormatting
{
  use Exportable;

  protected $startTime;
  protected $endTime;
  protected $add_name;
  protected $format;

  protected $customer;

  protected $banned_field_types = [
    'info',
  ];

  protected $exportable = [];

  /**
   * Instance of the class
   *
   * @param int $startTime
   * @param int $endTime
   */
  public function __construct($customer, $startTime, $endTime, $add_name, $format)
  {
    $this->customer = $customer;
    $this->startTime = $startTime;
    $this->endTime = $endTime;
    $this->add_name = $add_name;
    $this->format = $format;
  }

  /**
   * Exports the array
   *
   * @return array
   */
  public function array(): array
  {
    return $this->exportable;
  }

  /**
   * Defining column Formats
   *
   * @return array
   */
  public function columnFormats(): array
  {
    $formats = [
      'B' => 'dd/mm/yyyy',
      'J' => '_("$"* #,##0.00_);_("$"* (#,##0.00);_("$"* "-"??_);_(@_)',
    ];

    return $this->format == 'xls' ? $formats : [];
  }

  /**
   * Build the exportable tickets
   *
   */
  public function buildExportableTicketsData()
  {
    $slugs = ['ticket_id', 'date', 'customer', 'lease', 'well_number', 'rig_no', 'arrival_time', 'departure_time', '', 'service_charge', 'unit_no.'];
    $data = [];

    foreach ($this->getSubmissions() as $document) {
      $fields = $this->getSubmissionFields($document, false);
      foreach ($fields as $field) {
        if (in_array($field->slug, $slugs, true)) {
          $key = array_search($field->slug, $slugs, true);
          $data[$document->id][$key] = strtoupper($this->getFieldValue($field));
        }
      }

      // after adding new fields let's fill the empty items
      $data = $this->fillEmptyBlocks($data, $slugs);
    }

    $this->exportable[] = ['TICKET', 'DATE', 'CUSTOMER', 'LEASE', 'WELL', 'RIG', 'START', 'STOP', 'MILES', 'TOTAL', 'UNIT'];
    foreach ($data as $item) {
      $this->exportable[] = $item;
    }
  }

  /**
   * Build dynamic submissions data
   *
   * @param   array   $slugs array of slugs that will be added. if you leave it blank, it will be dynamic (based on the fields marked as exportable)
   */
  public function buildExportableData()
  {
    $bannedTypes = ['info'];
    $names = [];
    $slugs = [];
    $data = [];

    if ($this->add_name) {
      $names[] = 'Submission Name';
      $slugs[] = 'submission_name';
    }

    foreach ($this->getSubmissions() as $document) {
      $fields = $this->getSubmissionFields($document);
      if ($this->add_name) {
        $data[$document->id][0] = isset($document->original_name) ? $document->original_name : $document->name;
      }

      foreach ($fields as $field) {

        // do not add the banned field types
        if (in_array($field->type, $bannedTypes, true)) {
          continue;
        }

        if (!in_array($field->slug, $slugs, true)) {
          $slugs[] = $field->slug;
          $names[] = isset($field->pivot->exportable_name) ? $field->pivot->exportable_name : $field->name;
        }

        if (in_array($field->slug, $slugs, true)) {
          $key = array_search($field->slug, $slugs, true);
          $data[$document->id][$key] = $this->getFieldValue($field);
        }
      }

      // after adding new fields let's fill the empty items
      $data = $this->fillEmptyBlocks($data, $slugs);
    }

    $this->exportable[] = $names;
    foreach ($data as $item) {
      $this->exportable[] = $item;
    }
  }

  /**
   * Build the line with the field names
   */
  private function fillEmptyBlocks($data, $slugs)
  {
    foreach ($data as $id => $doc) {
      foreach ($slugs as $key => $slug) {
        if (!isset($doc[$key])) {
          $doc[$key] = '';
        }
      }

      ksort($doc);
      $data[$id] = $doc;
    }

    return $data;
  }

  /**
   * Get the list of submissions
   *
   * @return \Illuminate\Support\Collection
   */
  private function getSubmissions(): Collection
  {
    return $this->customer->documents()
      ->where('status', 'submitted')
      ->when($this->startTime, function (Builder $query, $startTime) {
        $start = Carbon::createFromTimestamp($startTime);
        $query->whereDate('created_at', '>=', $start->toDateString());
      })
      ->when($this->endTime, function (Builder $query, $endTime) {
        $end = Carbon::createFromTimestamp($endTime);
        $query->whereDate('created_at', '<=', $end->toDateString());
      })
      ->orderBy('parent_id', 'ASC')
      ->orderBy('created_at', 'DESC')
      ->get();
  }

  /**
   * Get Submission Fields
   *
   * @param \App\Document $submission
   * @param boolean $onlyExportable
   * @return \Illuminate\Support\Collection
   */
  private function getSubmissionFields(Document $submission, $onlyExportable = true)
  {
    return $submission->fields()
      ->wherePivot('disabled', false)
      ->when($onlyExportable, function (Builder $query, $onlyExportable) {
        $query->where('document_field.is_exportable', true);
      })
      ->orderBy('document_field.position', 'asc')
      ->get();
  }

  /**
   * Get the field value based on the type of the field
   *
   * @param \App\Field $field
   * @return string
   */
  private function getFieldValue($field)
  {
    try {
      if (!isset($field->pivot->value)) {
        return '';
      }
      switch ($field->type) {
        case 'calculation':
          $data = json_decode($field->pivot->value);
          $total = isset($data->total) ? floatval($data->total) : 0.00;
          return $this->format == 'xls' ? $total : number_format($total, 2);
        case 'signature':
          $path = preg_replace('/^public\//i', '', $field->pivot->value);
          return asset('storage/' . $path);
        case 'date':
          $date = is_numeric($field->pivot->value)
            ? Carbon::createFromTimestamp($field->pivot->value)
            : Carbon::parse($field->pivot->value);

          return $date->format('n/j/Y');
        default:
          return $field->pivot->value;
      }
    } catch (\Exception $e) {
      return '';
    }
  }
}
