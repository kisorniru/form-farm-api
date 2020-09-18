<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class AccessMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \Closure  $next
     * @return mixed
     */
    public function handle($request, Closure $next)
    {
      $user = Auth::user();

      if (!$user) {
        return response()->json([
          'error' => 'You must login to access to this page.',
          'message' => 'You must login to do this action.',
        ], 403);
      }

      if ($user->is_admin()) {
        return $next($request);
      }

      $route = $request->route();
      $terms = array_filter(preg_split('/\//', $route->uri));
      $methods =
      $section = $terms[1];
      $isValid = false;

      switch ($section) {
        case 'auth':
          return $next($request);
        case 'roles':
        case 'categories':
        case 'templates':
        case 'fields':
          $isValid = $user->hasPrivilege('edit') && ($user->hasAccess('settings'));
          break;
        case 'customers':
        case 'groups':
        case 'users':
          $isValid = $user->hasPrivilege('edit') && ($user->hasAccess('customers'));
          break;
        case 'documents':
          $isValid = $user->hasPrivilege('edit') && ($user->hasAccess('documents'));
          break;
        case 'activity':
          $isValid = $user->hasPrivilege('view') && ($user->hasAccess('dashboard'));
          break;
        default:
          $isValid = false;
          break;
      }

      if ($isValid) {
        return $next($request);
      }

      return response()->json([
        'error' => 'You are not allowed to access to this page.',
        'message' => 'You are not allowed to do this action.',
      ], 403);
    }
}
