<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Spatie\Activitylog\Models\Activity;

class ActivityController extends Controller
{
  public function __construct()
  {
  }


  /**
   * Get the latest activity
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function latest(Request $request): JsonResponse
  {
    $limit = $request->query('limit', 10);
    $sortBy = $request->query('sort-by', 'created_at');
    $sort = $request->query('sort', 'DESC');

    $latest = Activity::when($sortBy, function (Builder $query, $sortBy) use ($sort) {
      $query->orderBy($sortBy, $sort);
    })
    ->take($limit)
    ->get();
    $activity = [];

    foreach ($latest as $info) {
      $activity[] = [
        'type' => $info->log_name,
        'description' => $info->description,
        'subject' => isset($info->subject) ? $info->subject->name : '',
        'user' => isset($info->causer) ? $info->causer->name : '',
      ];
    }

    return response()->json($activity);
  }
}
