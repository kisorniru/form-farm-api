<?php

namespace App\Http\Controllers\Api;

use App\Customer;
use App\Http\Controllers\Controller;
use App\Http\Requests\CustomerRequest;
use App\Http\Resources\CustomerResource;
use App\Plan;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class CustomerController extends Controller
{
  /**
   * Create a new controller instance
   *
   */
  public function __construct()
  {
    $this->middleware('auth:api');
  }

  /**
   * Get the list of Customers
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\Resources\Json\ResourceCollection
   */
  public function index(Request $request): ResourceCollection
  {
    $search = $request->query('search');
    $limit = $request->query('limit', 10);
    $startTime = $request->query('starttime', null);
    $endTime = $request->query('endtime', null);
    $sortBy = $request->query('sort-by', 'created_at');
    $sort = $request->query('sort', 'DESC');
    $with = $request->query('with', null);

    $customers = Customer::when($search, function (Builder $query, $search) {
      return $query->where(function (Builder $query) use ($search) {
        $terms = array_filter(preg_split('/\s\+,/', $search));
        foreach ($terms as $term) {
          $query->orWhere('name', 'like', "%{$term}%");
        }
      });
    })
      ->when($with, function (Builder $query, $with) {
        $query->with($with);
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

    return CustomerResource::collection($customers);
  }


  /**
   * Get Customer
   *
   * @param \App\Customer $customer
   * @return \App\Http\Resources\CustomerResource
   */
  public function show(Customer $customer): CustomerResource
  {
    return new CustomerResource($customer);
  }

  /**
   * Store new Customer
   *
   * @param \App\Http\Requests\CustomerRequest $request
   * @return \App\Http\Resources\CustomerResource | \Illuminate\Http\JsonResponse
   */
  public function store(CustomerRequest $request)
  {
    $data = $request->all();
    $user = Auth::guard('api')->user();

    try {
      $customer = Customer::create($data);
      $customer->owner()->associate($user);
      $customer->users()->attach($user);

      $customer->createAsStripeCustomer([
        'email' => $user->email,
        'name' => $user->name,
        'metadata' => [
          'first_name' => $user->first_name,
          'last_name' => $user->last_name,
          'customer' => $customer->name,
        ]
      ]);

      return new CustomerResource($customer);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error saving the customer',
        'error'   => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update Customer
   *
   * @param \App\Http\Requests\CustomerRequest $request
   * @param \App\Customer $customer
   * @return \App\Http\Resources\FieldResource | \Illuminate\Http\JsonResponse
   */
  public function update(CustomerRequest $request, Customer $customer)
  {
    $headerToRemove = null;
    $footerToRemove = null;
    $iconToRemove = null;

    $data = $request->except([
      'new_header',
      'new_footer',
      'new_icon',
      'header',
      'footer',
      'icon',
    ]);

    try {
      if ($request->has('new_header')) {
        $headerToRemove = $customer->header;
        $b64 = $request->new_header;

        if ($b64) {
          $encode = substr($b64, 0, strpos($b64, ',') + 1);
          $length = strpos($encode, ';') - (strpos($encode, '/') + 1);
          $extension = substr($encode, strpos($encode, '/') + 1, $length);
          $imageName = 'customers/' . $customer->id . '/' . Str::random(32) .'.'. $extension;
          $image = str_replace($encode, '', $b64);
          $image = str_replace(' ', '+', $image);
          Storage::disk('public')->put($imageName, base64_decode($image));
          $data['header'] = 'public/' . $imageName;
        }
      }

      if ($request->has('new_footer')) {
        $footerToRemove = $customer->footer;
        $b64 = $request->new_footer;

        if ($b64) {
          $encode = substr($b64, 0, strpos($b64, ',') + 1);
          $length = strpos($encode, ';') - (strpos($encode, '/') + 1);
          $extension = substr($encode, strpos($encode, '/') + 1, $length);
          $imageName = 'customers/' . $customer->id . '/' . Str::random(32) .'.'. $extension;
          $image = str_replace($encode, '', $b64);
          $image = str_replace(' ', '+', $image);
          Storage::disk('public')->put($imageName, base64_decode($image));
          $data['footer'] = 'public/' . $imageName;
        }
      }

      if ($request->has('new_icon')) {
        $iconToRemove = $customer->icon;
        $b64 = $request->new_icon;

        if ($b64) {
          $encode = substr($b64, 0, strpos($b64, ',') + 1);
          $length = strpos($encode, ';') - (strpos($encode, '/') + 1);
          $extension = substr($encode, strpos($encode, '/') + 1, $length);
          $imageName = 'customers/' . $customer->id . '/' . Str::random(32) .'.'. $extension;
          $image = str_replace($encode, '', $b64);
          $image = str_replace(' ', '+', $image);
          Storage::disk('public')->put($imageName, base64_decode($image));
          $data['icon'] = 'public/' . $imageName;
        }
      }

      if ($headerToRemove) {
        Storage::delete($headerToRemove);
      }

      if ($footerToRemove) {
        Storage::delete($footerToRemove);
      }

      if ($iconToRemove) {
        Storage::delete($iconToRemove);
      }

      $customer->update($data);

      return new CustomerResource($customer);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'There was an error updating the Customer',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Remove customer
   *
   * @param \App\Customer $customer
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroy(Customer $customer): JsonResponse
  {
    try {
      $customer->users()->sync([]);
      $customer->delete();

      return response()->json([
        'message' => 'The Customer ' . $customer->name . ' was removed succesfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'There was an error removing the Customer. Please remove the data related to this Customer',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Get the list of Customers
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroyCustomers(Request $request): JsonResponse
  {
    try {
      $ids = $request->has('customers') ? explode(',', $request->customers) : [];
      $customers = Customer::whereIn('id', $ids)->get();

      foreach ($customers as $customer) {
        $customer->delete();
      }

      return response()->json([
        'message' => 'The customers were removed successfully.'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Cannot remove these Customers.',
        'error'   => $e->getMessage(),
      ], 400);
    }
  }

  /**
   * Get the subscription information of this customer
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Customer $customer
   * @return \Illuminate\Http\JsonResponse
   */
  public function subscriptions(Request $request, Customer $customer): JsonResponse
  {
    $paymentMethods = $customer->paymentMethods();
    $methods = [];
    foreach ($paymentMethods as $pm) {
      $methods[] = $pm->asStripePaymentMethod();
    }
    $subscriptions = $customer->subscriptions()->get();
    $subscriptionInfo = null;
    if ($subscriptions->count() > 0) {
      $subscription = $customer->subscription($subscriptions[0]->name);
      $subscriptionStripe = $subscription->asStripeSubscription();
      $plan = Plan::where('stripe_id', $subscriptionStripe->plan->id)->first();
      $subscriptionInfo = $subscription;
      $subscriptionInfo['period_start'] = $subscriptionStripe->current_period_start;
      $subscriptionInfo['period_end'] = $subscriptionStripe->current_period_end;
      $subscriptionInfo['plan'] = $plan;
    }

    return response()->json([
      'hasSubscription' => $subscriptions->count() > 0 ? true : false,
      'paymentMethods' => $methods,
      'subscription' => $subscriptionInfo,
    ]);
  }

  /**
   * Generate the subscription Intent
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Customer $customer
   * @return \Illuminate\Http\JsonResponse
   */
  public function intent(Request $request, Customer $customer): JsonResponse
  {
    $intent = $customer->createSetupIntent();
    $intent['st_key'] = env('STRIPE_KEY');
    return response()->json($intent);
  }

  /**
   * Add a payment method
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Customer $customer
   * @return \Illuminate\Http\JsonResponse
   */
  public function addPaymentMethod(Request $request, Customer $customer): JsonResponse
  {
    try {
      if ($request->has('paymentMethod')) {
        if ($customer->hasPaymentMethod()) {
          $paymentMethod = $customer->addPaymentMethod($request->paymentMethod);
          $customer->updateDefaultPaymentMethod($paymentMethod);
          $customer->updateDefaultPaymentMethodFromStripe();

        } else {
          $customer->addPaymentMethod($request->paymentMethod);
        }

        return response()->json([
          'message' => 'The payment methods was added'
        ]);
      } else {
        return response()->json([
          'message' => 'The payment method is required'
        ], 400);
      }
    } catch (\Exception $e) {
      return response()->json([
        'message' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * add a Subscription
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Customer $customer
   * @return \Illuminate\Http\JsonResponse
   */
  public function addSubscription(Request $request, Customer $customer): JsonResponse
  {
    try {
      $planId = $request->has('planId') ? $request->planId : null;

      if (!$planId) {
        return response()->json([
          'message' => 'You should choose a plan'
        ], 400);
      }

      if ($customer->hasPaymentMethod()) {
        $paymentMethod = $customer->defaultPaymentMethod();
      } else {
        $paymentMethod = $customer->paymentMethods()->first();
      }

      $plan = Plan::find($planId);
      // $planName = $plan->name . '_' . $plan->interval . 'ly';
      $planName = 'main';

      if ($customer->subscribed($planName)) {
        $customer->subscription('main')->swap($plan->stripe_id);
        return response()->json([
          'message' => 'The plan was changed.'
        ]);
      }

      if (!$plan) {
        return response()->json([
          'message' => 'Choose a valid plan',
        ], 400);
      }

      $customer->newSubscription($planName, $plan->stripe_id)->create($paymentMethod->id);
      return response()->json([
        'message' => 'Subscribed'
      ]);
    } catch (\Exception $e) {
      return response()->json(['message' => $e->getMessage()]);
    }

  }

  public function deletePaymentMethod(Request $request, Customer $customer): JsonResponse
  {
    $paymentMethodId = $request->has('payment_method') ? $request->payment_method : null;

    if (!$paymentMethodId) {
      return response()->json([
        'message' => 'The payment method is not valid',
      ], 400);
    }

    try {
      $customer->removePaymentMethod($paymentMethodId);

      return response()->json([
        'message' => 'The payment method was removed',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Cannot remove this payment method',
        'error' => $e->getMessage(),
      ], 400);
    }
  }

  /**
   * remove all the Subscriptions
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Customer $customer
   * @return \Illuminate\Http\JsonResponse
   */
  public function deletePaymentMethods(Request $request, Customer $customer): JsonResponse
  {
    try {
      $customer->deletePaymentMethods();

      return response()->json([
        'message' => 'The payment methods were removed',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error removing payment methods',
      ], 500);
    }
  }
}
