<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\PlanRequest;
use App\Http\Resources\PlanResource;
use App\Plan;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Stripe\Plan as StripePlan;
use Stripe\Stripe;

class PlanController extends Controller
{
  public function __construct()
  {
    Stripe::setApiKey(env('STRIPE_SECRET'));
    $this->middleware('auth:api');
    $this->middleware('admin', [
      'except' => [
        'index',
        'show'
      ]
    ]);
  }

  /**
   * List of the available Plans
   *
   * @param \Illuninate\Http\Request $request
   * @return \Illuminate\Http\Resources\Json\JsonResource
   */
  public function index(Request $request): JsonResource
  {
    $search = $request->query('search', null);
    $limit = $request->query('limit', 10);
    $startTime = $request->query('starttime', null);
    $endTime = $request->query('endtime', null);
    $sortBy = $request->query('sort-by', 'created_at');
    $sort = $request->query('sort', 'DESC');

    $plans = Plan::when($search, function (Builder $query, $search) {
      return $query->where(function (Builder $query) use ($search) {
        $terms = array_filter(preg_split('/\s\+,/', $search));
        foreach ($terms as $term) {
          $query->orWhere('name', 'like', "%{$term}%")
            ->orWhere('description', 'like', "%{$term}%");
        }
      });
    })
    ->when($startTime, function (Builder $query, $startTime) {
      $start = Carbon::createFromTimestamp($startTime);
      $query->whereDate('created_at', '>=', $start->toDateString());
    })
    ->when($endTime, function (Builder $query, $endTime) {
      $end = Carbon::createFromTimestamp($endTime);
      $query->whereDate('created_at', '<=', $end->toDateString());
    })
    ->when($sortBy, function (Builder $query, $sortBy) use ($sort) {
      $query->orderBy($sortBy, $sort);
    })

    ->paginate($limit);

    return PlanResource::collection($plans);
  }

  /**
   * Show a plan
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Plan $plan
   * @return \App\Http\Resources\PlanResource
   */
  public function show(Request $request, Plan $plan): PlanResource
  {
    return new PlanResource($plan);
  }

  /**
   * Store new plans
   *
   * @param \App\Http\Requests\PlanRequest $request
   * @return \App\Http\Resources\PlanResource
   */
  public function store(PlanRequest $request): PlanResource
  {
    $data = $request->only([
      'name',
      'interval',
      'amount',
      'description',
    ]);

    $plan = new Plan($data);

    $stripePlan = StripePlan::create([
      'amount' => $plan->buildStripeAmount(),
      'interval' => $plan->interval,
      'product' => [
        'name' => $plan->name,
      ],
      'metadata' => [
        'description' => $plan->description,
      ],
      'currency' => 'usd',
    ]);

    $plan->stripe_id = $stripePlan->id;
    $plan->save();

    return new PlanResource($plan);
  }

  /**
   * Update a plan
   *
   * @param \App\Http\Requests\PlanRequest $request
   * @param \App\Plan $plan
   * @return \App\Http\Resources\PlanResource
   */
  public function update(PlanRequest $request, Plan $plan): PlanResource
  {
    // cannot change the amount, currency or billing cycle
    $data = $request->only([
      'name',
      'description',
    ]);

    $plan->update($data);

    return new PlanResource($plan);
  }

  /**
   * Remove a plan
   *
   * @param \App\Plan $plan
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroy(Plan $plan): JsonResponse
  {
    try {
      $plan->delete();

      return response()->json([
        'message' => 'The plan was removed',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'The plan cannot be removed',
        'error' => $e->getMessage(),
      ], 500);
    }
  }
}
