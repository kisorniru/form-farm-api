<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;

class AdminMiddleware
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
    $user = Auth::guard('api')->user();

    if (!$user) {
      return response()->json([
        'error' => 'You must login to access to this page.',
        'message' => 'You must login to do this action.',
      ], 403);
    }

    if (!$user->is_admin()) {
      return response()->json([
        'error' => 'You are not allowed to access to this page.',
        'message' => 'You are not allowed to do this action.',
      ], 403);
    }

    return $next($request);
  }
}
