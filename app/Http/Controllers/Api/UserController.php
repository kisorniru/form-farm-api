<?php

namespace App\Http\Controllers\Api;

use App\Customer;
use App\Group;
use App\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserGroupRequest;
use App\Http\Requests\UserUpdateRequest;
use App\Http\Requests\UserRequest;
use App\Http\Resources\UserResource;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Http\Requests\UserRegisterRequest;
use App\Http\Resources\RoleResource;
use App\Role;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

/**
 * User API controller.
 *
 * This controller contains API actions related to users.
 *
 * @SuppressWarnings(PHPMD.StaticAccess)
 */
class UserController extends Controller
{
  /**
   * Create a new controller instance.
   *
   */
  public function __construct()
  {
    $this->middleware('auth:api');
  }

  /**
   * Get a list of users.
   * This Route allows to filter the users
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\Resources\Json\JsonResource
   */
  public function index (Request $request) : JsonResource
  {
    $search = $request->query('search');
    $limit = $request->query('limit', 10);
    $type = $request->query('type', 'all');
    $group = $request->query('group', 'all');
    $customer = $request->query('customer', null);
    $sortBy = $request->query('sort-by', 'created_at');
    $sort = $request->query('sort', 'DESC');

    $data = User::select('users.*')
              ->when($search, function (Builder $query, $search) {
                return $query->where(function (Builder $query) use ($search) {
                  $terms = array_filter(preg_split('/\s\+,/', $search));
                  foreach ($terms as $term) {
                    $query->orWhere('name', 'like', "%{$term}%")
                          ->orWhere('first_name', 'like', "%{$term}%")
                          ->orWhere('last_name', 'like', "%{$term}%")
                          ->orWhere('company', 'like', "%{$term}%");
                  }
                });
              })
              ->when($type, function (Builder $query, $type) {
                switch ($type) {
                  case 'admin':
                    return $query->where('is_admin', true);
                  case 'normal':
                    return $query->where('is_admin', false);
                  default:
                    return $query;
                }
              })
              ->when($group, function (Builder $query, $group) {
                if ($group == 'all') {
                  return $query;
                }
                $groups = array_filter(preg_split('/,/', $group));
                $query->join('group_user', 'group_user.user_id', '=', 'users.id');
                $query->whereIn('group_user.group_id', $groups);
              })
              ->when($sortBy, function (Builder $query, $sortBy) use ($sort) {
                $query->orderBy($sortBy, $sort);
              })
              ->when($customer, function (Builder $query, $customer) {
                $query->whereHas('customers', function (Builder $query2) use ($customer) {
                  $query2->where('customers.id', $customer);
                });
              })
              ->paginate($limit);

    return UserResource::collection($data);
  }

  /**
   * Get single user
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\User $user
   * @return \App\Http\Resources\UserResource
   */
  public function show (Request $request, User $user) : UserResource
  {
    return new UserResource($user);
  }

  /**
   * Store new Users
   *
   * @param \App\Http\Requests\UserRequest $request
   * @return \App\Http\Resources\UserResource | \Illuminate\Http\JsonResponse
   */
  public function store (UserRequest $request)
  {
    $data = $request->except([
      'groups',
      'role',
      'password',
      'customer',
      'image',
      'new_image'
    ]);

    try {
      $data['name'] = $data['first_name'] . ' ' . $data['last_name'];
      $data['password'] = Hash::make($request->password);
      $data['is_admin'] = false;
      $user = User::create($data);
      if ($request->has('groups')) {
        foreach ($request->groups as $id) {
          $user->groups()->attach($id);
        }
      }

      if ($request->has('customer')) {
        $customer = Customer::where('id', $request->customer)->first();
        if ($customer) {
          $user->customers()->attach($customer);
        }
      }

      if ($request->has('new_image')) {
        $image = $request->new_image;
        $encode = substr($image, 0, strpos($image, ',') + 1);
        $length = strpos($encode, ';') - (strpos($encode, '/') + 1);
        $extension = substr($encode, strpos($encode, '/') + 1, $length);
        $imageName = 'users/' . $user->id . '/' . Str::random(32) .'.'. $extension;
        $image = str_replace($encode, '', $image);
        $image = str_replace(' ', '+', $image);
        Storage::disk('public')->put($imageName, base64_decode($image));

        $user->image = 'public/' . $imageName;
        $user()->save();
      }

      if ($request->has('role')) {
        $user->roles()->sync([ $request->role ]);
      }

      return new UserResource($user);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error creating the user',
        'error' => $e->getMessage(),
      ], 500);
    }

  }

  /**
   * Update User
   *
   * @param \App\Http\Requests\UserRequest $request
   * @param \App\User $user
   * @return \App\Http\Resources\UserResource | \Illuminate\Http\JsonResponse
   */
  public function update (UserRequest $request, User $user)
  {
    $data = $request->except([
      'role',
      'group',
      'id',
      'customer',
      'image',
      'new_image',
      'old_password',
      'new_password',
      'password_repeat',
    ]);

    try {
      $data = $this->buildName($data, $user);

      if (isset($data['password'])) {
        $data['password'] = Hash::make($data['password']);
      }

      if ($request->has('group')) {
        $user->groups()->detach($user->groups()->first());
        $user->groups()->attach($request->group);
      }

      if ($request->has('customer')) {
        $customer = Customer::where('id', $request->customer)->first();
        if ($customer) {
          $user->customers()->attach($customer);
        }
      }

      if ($request->has('new_image')) {
        $image = $request->new_image;
        $encode = substr($image, 0, strpos($image, ',') + 1);
        $length = strpos($encode, ';') - (strpos($encode, '/') + 1);
        $extension = substr($encode, strpos($encode, '/') + 1, $length);
        $imageName = 'users/' . $user->id . '/' . Str::random(32) .'.'. $extension;
        $image = str_replace($encode, '', $image);
        $image = str_replace(' ', '+', $image);
        Storage::disk('public')->put($imageName, base64_decode($image));

        $data['image'] = 'public/' . $imageName;
      }

      if ($request->has('new_password')) {
        if($request->has('old_password')) {
          if(!Hash::check($request->old_password, $user->password)) {
            return response()->json([
              'message' => 'the password is Invalid',
              'errors' => [
                'old_password' => 'The password is invalid.'
              ]
            ], 400);
          }
        } else {
          return response()->json([
            'message' => 'the password is Invalid',
            'errors' => [
              'old_password' => 'The password is invalid.'
            ]
          ], 400);
        }

        if ($request->has('password_repeat')) {
          if ($request->new_password !== $request->password_repeat) {
            return response()->json([
              'message' => 'the passwords doesn\'t match',
              'errors' => [
                'password_repeat' => 'the passwords doesn\'t match'
              ]
            ], 400);
          } else {
            $data['password'] = Hash::make($request->new_password);
          }
        } else {
          return response()->json([
            'message' => 'the password is required',
            'errors' => [
              'password_repeat' => 'The password must be filled.'
            ]
          ], 400);
        }
      }

      if ($request->has('role')) {
        $user->roles()->sync([ $request->role ]);
      }

      $user->update($data);

      return new UserResource($user);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error updating the user',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Remove User
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\User $user
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroy (Request $request, User $user) : JsonResponse
  {
    try {
      $user->groups()->detach();
      $user->roles()->detach();
      $user->customers()->detach();
      $user->delete();

      return response()->json([
        'message' => 'The user ' . $user->name . ' was deleted.'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error removing the user',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Remove multiple users
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroyUsers(Request $request) : JsonResponse
  {
    try {
      $ids = $request->has('users') ? explode(',', $request->users) : [];
      $users = User::whereIn('id', $ids)->get();

      foreach ($users as $user) {
        if ($user->documents()->count() > 0) {
          throw new \Exception("this user has documents", 1);
        }

        $user->customers()->sync([]);
        $user->groups()->sync([]);
        $user->roles()->sync([]);
        $user->delete();
      }

      return response()->json([
        'message' => 'The users were removed successfully.'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Cannot remove this User, remove the documents first.',
        'error'   => $e->getMessage(),
      ], 400);
    }
  }

  /**
   * Attach User to Group or groups
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\User $user
   * @return \App\Http\Resources\UserResource | \Illuminate\Http\JsonResponse
   */
  public function attachGroups (Request $request, User $user)
  {
    try {
      $groups = explode(',', $request->groups);
      foreach($groups as $id) {
        $group = Group::find($id);
        if ($group) {
          $user->groups()->attach($group);
        }
      }

      return new UserResource($user);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error attaching groups',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Detach groups from User
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\User $user
   * @return \App\Http\Resources\UserResource | \Illuminate\Http\JsonResponse
   */
  public function detachGroups (Request $request, User $user)
  {
    try {
      $groups = explode(',', $request->groups);
      foreach($groups as $id) {
        $group = Group::find($id);
        if ($group) {
          $user->groups()->detach($group);
        }
      }

      return new UserResource($user);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error detaching the groups',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * toggle the Admin status of an Admin
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\User $user
   * @return \App\Http\Resources\UserResource | \Illuminate\Http\JsonResponse
   */
  public function toggleAdmin (Request $request, User $user)
  {
    $admin = $this->getAuth()->user();
    if ($admin->is_admin()) {
      $user->is_admin = !$user->is_admin;
      $user->save();

      return new UserResource($user);
    } else {
      return response()->json([
        'message' => 'You are not allowed to do this action',
      ], 403);
    }
  }

  /**
   *
   * @param \App\User $user
   * @return \Illuminate\Http\JsonResource
   */
  public function listRoles(User $user): JsonResource
  {
    $roles = $user->roles()->get();
    return RoleResource::collection($roles);
  }

  /**
   * Attach role to user
   *
   * @param \App\User $role
   * @param \App\Role $role
   * @return \Illuminate\Http\JsonResponse
   */
  public function attachRole(User $user, Role $role): JsonResponse
  {
    $user->roles()->attach($role);
    return response()->json([
      'message' => 'The role was attached',
    ]);
  }

  /**
   * Detach role from user
   *
   * @param \App\User $role
   * @param \App\Role $role
   * @return \Illuminate\Http\JsonResponse
   */
  public function detachRole(User $user, Role $role): JsonResponse
  {
    $user->roles()->detach($role);
    return response()->json([
      'message' => 'The role was detached',
    ]);
  }

  /**
   * re build the name based on first_name & last_name
   *
   * @param array $data
   * @param \App\User $user
   * @return array
   */
  private function buildName ($data, $user)
  {
    if (isset($data['first_name']) || isset($data['last_name'])) {
      if (!isset($data['first_name'])) {
        $data['name'] = $user->first_name . ' ' . $data['last_name'];
      }

      if (!isset($data['last_name'])) {
        $data['name'] = $data['first_name'] . ' ' . $user->last_name;
      }

      if (isset($data['first_name']) && isset($data['last_name'])) {
        $data['name'] = $data['first_name'] . ' ' . $data['last_name'];
      }
    }
    return $data;
  }

  /**
   * Get the auth instance.
   *
   * @return \Illuminate\Contracts\Auth\Guard
   */
  private function getAuth(): Guard
  {
    return Auth::guard('api');
  }
}
