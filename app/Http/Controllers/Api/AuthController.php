<?php

namespace App\Http\Controllers\Api;

use App\User;
use App\Http\Controllers\Controller;
use App\Http\Requests\UserRegisterRequest;
use App\Http\Requests\UserAuthenticationRequest;
use App\Http\Resources\RoleResource;
use App\Http\Resources\UserResource;
use Carbon\Carbon;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\JsonResponse;
use Illuminate\Mail\Message;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tymon\JWTAuth\Facades\JWTAuth;

/**
 * Auth API controller.
 *
 * This controller contains API actions related to authentication.
 *
 * @SuppressWarnings(PHPMD.StaticAccess)
 */
class AuthController extends Controller
{
  /**
   * Create a new controller instance.
   *
   */
  public function __construct()
  {
    $this->middleware('auth:api', [
      'except' => [
        'login',
        'password',
        'register',
      ],
    ]);
  }
  /**
   * Get a JWT via given credentials.
   *
   * @return \Illuminate\Http\Requests\UserAuthenticationRequest
   * @return \Illuminate\Http\JsonResponse
   */
  public function login(UserAuthenticationRequest $request): JsonResponse
  {
    $credentials = $request->only([
      'email',
      'password',
    ]);
    $keep30days = $request->input('keep30days', false);

    if ($keep30days) {
      $customTTL = 1440 * ($keep30days ? 30 : 1); // keep it for 30 days or 1 day
      JWTAuth::factory()->setTTL($customTTL);
    }

    if (!($token = $this->getAuth()->attempt($credentials))) {
      return response()->json([
        'error' => 'The email/password is not valid.',
      ], 401);
    }
    return $this->respondWithToken($token, $keep30days);
  }

  /**
   * Register new Users
   *
   * @param \App\Http\Requests\UserRegisterRequest
   * @return \Illuminate\Http\JsonResponse
   */
  public function register (UserRegisterRequest $request) : JsonResponse
  {
    $data = $request->only([
      'name',
      'first_name',
      'last_name',
      'company',
      'email',
    ]);

    $data['password'] = Hash::make($request->password);
    $user = User::create($data);

    if ($user) {
      if (!($token = $this->getAuth()->attempt($data))) {
        return response()->json([
          'error' => 'Unauthorized',
        ], 401);
      }
    } else {
      return response()->json([
        'error' => 'Bad Request',
      ], 400);
    }
    return $this->respondWithToken($token);
  }

  /**
   * Get the authenticated User.
   *
   * @return \Illuminate\Http\JsonResponse
   */
  public function me(): JsonResponse
  {
    $user = $this->getAuth()->user();
    $role = $user->getTheUserRole();

    return response()->json([
      'user' => new UserResource($user),
      'role' => new RoleResource($role),
    ]);
  }

  /**
   * Log the user out (Invalidate the token).
   *
   * @return \Illuminate\Http\JsonResponse
   */
  public function logout(): JsonResponse
  {
    try {
      $this->getAuth()->logout();
      return response()->json([
        'message' => 'Successfully logged out',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => $e->getMessage()
      ]);
    }
  }

  /**
   * Refresh a token.
   *
   * @return \Illuminate\Http\JsonResponse
   */
  public function refresh(): JsonResponse
  {
    return $this->respondWithToken($this->getAuth()->refresh());
  }

  /**
   * Recover a password.
   *
   * @return \Illuminate\Http\JsonResponse
   */
  public function password(): JsonResponse
  {
    try {
      $credentials = request([
        'email',
      ]);
      $response = Password::sendResetLink($credentials, function (Message $message) {
        $message->subject($this->getEmailSubject());
      });
      if ($response === Password::INVALID_USER) {
        return response()->json([
          'error' => 'User not found',
        ], 404);
      }
      return response()->json([
        'message' => 'E-mail sent to user',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error sending the email',
        'error' => $e->getMessage()
      ]);
    }
  }
  /**
   * Get the token array structure.
   *
   * @param  string $token
   * @return \Illuminate\Http\JsonResponse
   */
  protected function respondWithToken(string $token, bool $keep30Days = null): JsonResponse
  {
    return response()->json([
      'access_token' => $token,
      'token_type' => 'bearer',
      'expires_in' => $this->getAuth()->factory()->getTTL(),
    ]);
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
