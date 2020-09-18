<?php

namespace App\Http\Controllers\Api;

use App\Document;
use App\Field;
use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Template;
use Carbon\Carbon;
use Exception;
use Illuminate\Contracts\Encryption\DecryptException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;

class ServicesController extends Controller
{
  public function __construct()
  {
    //
  }

  /**
   * Decoded Qr Codes
   *
   * TODO: remove Fake behaivor
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function decoded_qrcodes(Request $request): JsonResponse
  {
    $decoded_qrcode = $request->input('decoded_qrcode');

    try {
      if ($decoded_qrcode) {
        $hash = $decoded_qrcode["hash"];
        $document = Document::find($hash);
        if (!$document) {
          $decrypted = decrypt($decoded_qrcode["hash"]);
          $document = Document::find($decrypted);
        }

        return response()->json([
          'data' => [
            new DocumentResource($document)
          ]
        ]);
      }
    } catch (DecryptException $e) {
      return response()->json([
        'message' => 'Error in Encryption'
      ], 400);
    } catch (Exception $e) {
      return response()->json([
        'message' => 'The data is invalid',
        'error' => $e->getMessage()
      ], 400);
    }
  }
}
