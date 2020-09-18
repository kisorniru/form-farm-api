<?php

namespace App\Http\Controllers\Api;

use App\Customer;
use App\Group;
use App\Http\Controllers\Controller;
use App\Http\Requests\GroupRequest;
use App\Http\Resources\GroupResource;
use App\Http\Resources\RoleResource;
use App\Role;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Group API controller.
 *
 * This controller contains API actions related to groups.
 *
 * @SuppressWarnings(PHPMD.StaticAccess)
 */
class GroupController extends Controller
{

  /**
   * Create a new controller instance.
   *
   */
  public function __construct () {
    $this->middleware('auth:api');
  }

  /**
   * Get a list of groups.
   * This Route allows to filter the groups
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\Resources\Json\JsonResource
   */
  public function index (Request $request) : JsonResource
  {
    $search = $request->query('search');
    $limit = $request->query('limit', 10);
    $customer = $request->query('customer', null);
    $sortBy = $request->query('sort-by', 'created_at');
    $sort = $request->query('sort', 'DESC');
    $with = $request->query('with', null);

    $data = Group::when($search, function (Builder $query, $search) {
              return $query->where(function (Builder $query) use ($search) {
                $terms = array_filter(preg_split('/\s\+,/', $search));
                foreach ($terms as $term) {
                  $query->orWhere('name', 'like', "%{$term}%")
                        ->orWhere('description', 'like', "%{$term}%");
                }
              });
            })
            ->when($with, function (Builder $query, $with) {
              $query->with($with);
            })
            ->when($sortBy, function (Builder $query, $sortBy) use ($sort) {
              $query->orderBy($sortBy, $sort);
            })
            ->when($customer, function (Builder $query, $customer) {
              $query->where('customer_id', $customer);
            })
            ->paginate($limit);
    return GroupResource::collection($data);
  }

  /**
   * Get single group
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Group $group
   * @return \App\Http\Resources\GroupResource
   */
  public function show (Request $request, Group $group) : GroupResource
  {
    return new GroupResource($group);
  }

  /**
   * Store new Group
   *
   * @param \App\Http\Requests\GroupRequest $request
   * @return \App\Http\Resources\GroupResource | \Illuminate\Http\JsonResponse
   */
  public function store (GroupRequest $request)
  {
    $data = $request->only([
      'name',
      'description',
      'customer',
    ]);

    try {
      $group = Group::create($data);

      if ($request->has('customer')) {
        $customer = Customer::where('id', $request->customer)->first();
        if ($customer) {
          $group->customer()->associate($customer);
          $group->save();
        }
      }

      if ($request->has('role')) {
        $group->roles()->sync([ $request->role ]);
      }

      return new GroupResource($group);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error creating the group',
        'error' => $e->getMessage(),
      ], 500);
    }

  }

  /**
   * Update Group
   *
   * @param \App\Http\Requests\GroupRequest $request
   * @param \App\Group $group
   * @return \App\Http\Resources\GroupResource | \Illuminate\Http\JsonResponse
   */
  public function update (GroupRequest $request, Group $group)
  {
    $data = $request->except([
      'customer',
    ]);

    try {
      $group->update($data);

      if ($request->has('customer')) {
        $customer = Customer::where('id', $request->customer)->first();
        if ($customer) {
          $group->customer()->associate($customer);
          $group->save();
        }
      }

      if ($request->has('role')) {
        $group->roles()->sync([ $request->role ]);
      }

      return new GroupResource($group);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error updating the group',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Remove Group
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Group $group
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroy (Request $request, Group $group) : JsonResponse
  {
    try {
      $group->users()->detach();
      $group->roles()->detach();
      $group->delete();

      return response()->json(['data' => [
        'message' => 'The group ' . $group->name . ' was deleted.'
      ]]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error removing the group',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Remove multiple Groups
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroyGroups (Request $request) : JsonResponse
  {
    try {
      $ids = $request->has('groups') ? explode(',', $request->groups) : [];
      $groups = Group::whereIn('id', $ids)->get();

      foreach ($groups as $group) {
        $group->users()->detach();
        $group->roles()->detach();
        $group->delete();
      }

      return response()->json([
        'message' => 'The groups were removed successfully.'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Cannot remove this Group, remove the users first.',
        'error'   => $e->getMessage(),
      ], 400);
    }
  }

  /**
   * List roles for this group
   *
   * @param \App\Group $group
   * @return \Illuminate\Http\JsonResource
   */
  public function listRoles(Group $group): JsonResource
  {
    $roles = $group->roles()->get();
    return RoleResource::collection($roles);
  }

  /**
   * Attach role to group
   *
   * @param \App\Group $group
   * @param \App\Role $role
   * @return \Illuminate\Http\JsonResponse
   */
  public function attachRole(Group $group, Role $role): JsonResponse
  {
    $group->roles()->attach($role);
    return response()->json([
      'message' => 'The role was attached',
    ]);
  }

  /**
   * Detach role from user
   *
   * @param \App\Group $group
   * @param \App\Role $role
   * @return \Illuminate\Http\JsonResponse
   */
  public function detachRole(Group $group, Role $role): JsonResponse
  {
    $group->roles()->detach($role);
    return response()->json([
      'message' => 'The role was detached',
    ]);
  }
}
