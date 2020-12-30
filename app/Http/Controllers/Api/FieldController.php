<?php

namespace App\Http\Controllers\Api;

use App\Field;
use App\Http\Resources\FieldResource;
use App\Http\Controllers\Controller;
use App\Http\Requests\FieldRequest;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Field API controller.
 *
 * This controller contains API actions related to Fields.
 *
 */
class FieldController extends Controller
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
   * Get the list of fields
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\Resources\Json\JsonResource
   */
  public function index (Request $request) : JsonResource
  {
    $search = $request->query('search');
    $limit = $request->query('limit', 10);
    // $document = $request->query('document', 'all');
    $type = $request->query('type', 'all');
    $startTime = $request->query('starttime', null);
    $endTime = $request->query('endtime', null);
    $sortBy = $request->query('sort-by', 'created_at');
    $sort = $request->query('sort', 'DESC');
    $category = $request->query('category', null);

    $fields = Field::when($search, function (Builder $query, $search) {
        return $query->where(function (Builder $query) use ($search) {
          $terms = array_filter(preg_split('/\s\+,/', $search));
          foreach ($terms as $term) {
            $query->orWhere('name', 'like', "%{$term}%")
                  ->orWhere('details', 'like', "%{$term}%")
                  ->orWhere('metadata', 'like', "%{$term}%")
                  ->orWhere('placeholder', 'like', "%{$term}%");
          }
        });
      })
      // ->when($document, function (Builder $query, $document) {
      //   if ($document == 'all') {
      //     return $query;
      //   }
      //   return $query->where('group_id', $document);
      // })
      ->when($type, function (Builder $query, $type) {
        if ($type == 'all') {
          return $query;
        }
        return $query->where('type', $type);
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
      ->when($category, function (Builder $query, $category) {
        if ($category == 'none') {
          $query->whereDoesntHave('categories', function(Builder $query2) {

          });
        }

        if ($category != 'none') {
          $query->whereHas('categories', function(Builder $query2) use ($category) {
            $query2->where('categories.id', $category);
          });
        }

      })
      ->paginate($limit);

    return FieldResource::collection($fields);
  }

  /**
   * Get Field
   *
   * @param \App\Field $field
   * @return \App\Http\Resources\FieldResource
   */
  public function show (Field $field) : FieldResource
  {
    return new FieldResource($field);
  }

  /**
   * Store new Field
   *
   * @param \App\Http\Requests\FieldRequest
   * @return \App\Http\Resources\FieldResource | \Illuminate\Http\JsonResponse
   */
  public function store (FieldRequest $request)
  {
    $data = $request->except([
      'categories',
      'required',
    ]);

    try {
      if ($request->has('required')) {
        $data['is_required'] = $request->required;
      }

      $field = Field::create($data);

      if ($request->has('categories')) {
        $categories = explode(',', $request->categories);
        $field->categories()->sync($categories);
      }

      return new FieldResource($field);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error creating the field',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update Field
   *
   * @param \App\Http\Requests\FieldRequest
   * @param \App\Field $field
   * @return \App\Http\Resources\FieldResource | \Illuminate\Http\JsonResponse
   */
  public function update (FieldRequest $request, Field $field)
  {
    $data = $request->except([
      'categories',
      'slug',
      'required',
    ]);

    try {
      if ($request->has('required')) {
        $data['is_required'] = $request->required;
      }

      $field->update($data);

      if ($request->has('categories')) {
        $categories = explode(',', $request->categories);
        $field->categories()->sync($categories);
      }

      return new FieldResource ($field);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error updating the field',
        'error' => $e->getMessage()
      ]);
    }
  }

  /**
   * Remove field
   *
   * @param \App\Field $field
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroy (Field $field) : JsonResponse
  {
    try {
      $field->delete();
      return response()->json([
        'message' => 'The Field ' . $field->name . ' was removed succesfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error removing the field',
        'error' => $e->getMessage()
      ]);
    }
  }
}
