<?php

namespace App\Http\Controllers;

use App\Customer;
use App\Exports\SubmissionExport;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use League\Csv\Writer;
use Maatwebsite\Excel\Excel;
use SplTempFileObject;

class CustomerController extends Controller
{
  /**
   * Create a new controller instance.
   *
   */
  public function __construct()
  {
    // $this->middleware('auth:api');
  }

  /**
   * Export documents
   *
   * @param \App\Customer $customer
   * @param \Illuminate\Http\Request $request
   */
  public function documents(Customer $customer, Request $request)
  {
    $format = $request->input('format', 'csv'); // export type: csv (default) or xls
    $template = $request->input('template', 'general');
    $add_name = $request->input('add_name', false); // export type: csv (default) or xls
    $startTime = $request->query('starttime', 0);
    $endTime = $request->query('endtime', 0);

    $export = new SubmissionExport($customer, $startTime, $endTime, $add_name, $format);

    if ($template == 'ticket') {
      $export->buildExportableTicketsData();
    } else {
      $export->buildExportableData();
    }

    $fileName = $this->buildReportName($startTime, $endTime);
    if ($format == 'xls') {
      return $export->download($fileName . '.xlsx', Excel::XLSX);
    } else {
      return $export->download($fileName . '.csv', Excel::CSV);
    }
  }

  /**
   * Build the Report file name, based on the start date and end date
   *
   * @param int $startTime
   * @param int $endTime
   *
   * @return string
   */
  public function buildReportName($startTime, $endTime) {
    $start = $startTime != 0 ? Carbon::createFromTimestamp($startTime) : false;
    $end = $endTime != 0 ? Carbon::createFromTimestamp($endTime) : false;
    $name = [];

    if ($startTime == 0 && $endTime == 0) {
      $name[] = 'All';
    }
    $name[] = 'Submissions';

    if ($startTime != $endTime ) {
      if ($start) $name[] = 'from_' . $start->format('F_d_Y');
      if ($end) $name[] = 'to_' . $end->format('F_d_Y');
    } else {
      if ($start) $name[] = 'from_' . $start->format('F_d_Y');
    }

    return implode('_', $name);
  }
}
