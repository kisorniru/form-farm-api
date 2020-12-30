<?php

namespace App\Http\Controllers\Api;

use App\Category;
use App\Http\Controllers\Controller;
use App\Http\Requests\CategoryRequest;
use App\Http\Resources\CategoryResource;
use App\Http\Resources\FieldResource;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CategoryController extends Controller
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
   * Get the list of Categories
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\Resources\Json\ResourceCollection
   */
  public function index (Request $request) : ResourceCollection
  {
    $search = $request->query('search');
    $limit = $request->query('limit', 10);
    $sortBy = $request->query('sort-by', 'created_at');
    $sort = $request->query('sort', 'DESC');

    $categories = Category::when($search, function (Builder $query, $search) {
      return $query->where(function (Builder $query) use ($search) {
        $terms = array_filter(preg_split('/\s\+,/', $search));
        foreach ($terms as $term) {
          $query->orWhere('name', 'like', "%{$term}%");
        }
      });
    })
    ->when($sortBy, function (Builder $query, $sortBy) use ($sort) {
      $query->orderBy($sortBy, $sort);
    })
    ->paginate($limit);

    return CategoryResource::collection($categories);
  }

  /**
   * Get Category
   *
   * @param \App\Category $category
   * @return \App\Http\Resources\CategoryResource
   */
  public function show (Category $category) : CategoryResource
  {
    return new CategoryResource($category);
  }

  /**
   * Store new Category
   *
   * @param \App\Http\Requests\CategoryRequest $request
   * @return \App\Http\Resources\CategoryResource | \Illuminate\Http\JsonResponse
   */
  public function store (CategoryRequest $request)
  {
    $data = $request->all();

    try {
      $category = Category::create($data);
      return new CategoryResource($category);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error saving the category',
        'error'   => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update Category
   *
   * @param \App\Http\Requests\CategoryRequest $request
   * @param \App\Category $category
   * @return \App\Http\Resources\FieldResource | \Illuminate\Http\JsonResponse
   */
  public function update (CategoryRequest $request, Category $category)
  {
    $data = $request->all();

    try {
      $category->update($data);

      return new CategoryResource($category);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'There was an error updating the Category',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Remove category
   *
   * @param \App\Category $category
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroy (Category $category) : JsonResponse
  {
    try {
      $category->delete();
      return response()->json([
        'message' => 'The Category ' . $category->name . ' was removed succesfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'There was an error removin the Category.',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Return a the list of fields
   *
   * @param \App\Category $category
   * @return \Illuminate\Http\Resources\Json\ResourceCollection
   */
  public function fields (Category $category) : ResourceCollection
  {
    return FieldResource::collection($category->fields()->get());
  }
}
