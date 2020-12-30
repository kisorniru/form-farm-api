<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\RoleRequest;
use App\Http\Resources\RoleResource;
use App\Role;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RoleController extends Controller
{
  public function __construct()
  {
    $this->middleware('admin', [
      'except' => [
        'index',
        'show'
      ]
    ]);
  }

  /**
   * Get the list of Roles
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\Resources\Json\JsonResource
   */
  public function index(Request $request): JsonResource
  {
    $search = $request->query('search', null);
    $limit = $request->query('limit', 10);
    $sortBy = $request->query('sort-by', 'created_at');
    $sort = $request->query('sort', 'DESC');

    $roles = Role::when($search, function(Builder $query, $search) {
      return $query->where(function (Builder $query) use ($search) {
        $terms = array_filter(preg_split('/\s\+,/', $search));
        foreach ($terms as $term) {
          $query->orWhere('name', 'like', "%{$term}%")
                ->orWhere('description', 'like', "%{$term}%");
        }
      });
    })
    ->when($sortBy, function(Builder $query, $sortBy) use ($sort) {
      $query->orderBy($sortBy, $sort);
    })
    ->paginate($limit);

    return RoleResource::collection($roles);
  }

  /**
   * Get Role
   *
   * @param \App\Role $role
   * @return \App\Http\Resources\RoleResource
   */
  public function show(Role $role): RoleResource
  {
    return new RoleResource($role);
  }

  /**
   * Store new Role
   *
   * @param \App\Http\Requests\RoleRequest $request
   * @param \App\Http\Resources\RoleResource | \Illuminate\HttpJsonResponse
   */
  public function store(RoleRequest $request)
  {
    $data = $request->only([
      'name',
      'description',
      'privileges',
      'access'
    ]);

    try {
      $role = Role::create($data);
      return new RoleResource($role);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error saving the Role',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update Role
   *
   * @param \App\Http\Requests\RoleRequest $request
   * @param \App\Role $role
   * @return \App\Http\Resources\RoleResource | Illuminate\Http\HttpJsonResponse
   */
  public function update(RoleRequest $request, Role $role)
  {
    $data = $request->only([
      'name',
      'description',
      'privileges',
      'access'
    ]);

    try {
      $role->update($data);
      return new RoleResource($role);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error updating the Role',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Remove role
   *
   * @param \App\Role $role
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroy(Role $role): JsonResponse
  {
    try {
      $role->users()->sync([]);
      $role->groups()->sync([]);

      $role->delete();

      return response()->json([
        'message' => 'The role was removed',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'There was an error removing the role',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Remove role
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroyMany(Request $request): JsonResponse
  {
    try {
      $ids = $request->has('roles') ? explode(',', $request->roles) : [];
      $roles = Role::whereIn('id', $ids)->get();

      foreach ($roles as $role) {
        $role->users()->sync([]);
        $role->groups()->sync([]);
        $role->delete();
      }

      return response()->json([
        'message' => 'The roles were removed',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'There was an error removing the roles',
        'error' => $e->getMessage()
      ], 500);
    }
  }
}
