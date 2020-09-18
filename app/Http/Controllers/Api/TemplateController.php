<?php

namespace App\Http\Controllers\Api;

use App\Category;
use App\Customer;
use App\Template;
use App\Field;
use App\Group;
use App\Http\Resources\TemplateResource;
use App\Http\Controllers\Controller;
use App\Http\Requests\FieldRequest;
use App\Http\Requests\TemplateRequest;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

/**
 * Template API controller.
 *
 * This controller contains API actions related to Templates.
 *
 */
class TemplateController extends Controller
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
   * List the available Templates
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\Resources\Json\JsonResource
   */
  public function index(Request $request): JsonResource
  {
    $search = $request->query('search');
    $limit = $request->query('limit', 10);
    // $group = $request->query('group', 'all');
    $startTime = $request->query('starttime', null);
    $endTime = $request->query('endtime', null);
    $sortBy = $request->query('sort-by', 'created_at');
    $sort = $request->query('sort', 'DESC');

    $user = Auth::guard('api')->user();

    $customers = $user->customers()->pluck('customers.id')->toArray();
    $groups = $user->groups()->pluck('groups.id')->toArray();

    $templates = Template::where(function (Builder $query) use ($customers, $groups) {
      $query->orWhereHas('customers', function (Builder $query) use ($customers) {
        $query->whereIn('customers.id', $customers);
      });
      $query->orWhereHas('groups', function (Builder $query) use ($groups) {
        $query->whereIn('groups.id', $groups);
      });
    })
      ->when($search, function (Builder $query, $search) {
        return $query->where(function (Builder $query) use ($search) {
          $terms = array_filter(preg_split('/\s\+,/', $search));
          foreach ($terms as $term) {
            $query->orWhere('name', 'like', "%{$term}%")
              ->orWhere('description', 'like', "%{$term}%");
          }
        });
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

    return TemplateResource::collection($templates);
  }

  /**
   * Show Specific Template
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Template $template
   * @return \App\Http\Resources\Template
   */
  public function show(Request $request, Template $template): TemplateResource
  {
    return new TemplateResource($template);
  }

  /**
   * Store new Template
   *
   * @param \App\Http\Requests\TemplateRequest
   * @return \App\Http\Resources\TemplateResource|\Illuminate\Http\JsonResponse
   */
  public function store(TemplateRequest $request)
  {
    $data = $request->except([
      'pdf_data',
    ]);

    try {
      $template = Template::create($data);

      // lets attach the template to user customers
      $user = Auth::guard('api')->user();
      $customers = $user->customers()->get();

      $template->customers()->sync($customers);

      $pdfCreated = false;
      $path = storage_path('app/public/templates/' . $template->id);
      File::makeDirectory($path, 0777, true, true);

      if ($template->type == 'content') {
        if (mb_strlen($template->content) > 0) {
          libxml_use_internal_errors(true);
          $pdf = App::make('dompdf.wrapper');
          $pdf->loadView('templates.skeleton', ['template' => $template]);
          Storage::disk('public')->put('templates/' . $template->id . '/default.pdf', $pdf->download()->getOriginalContent());
          $pdfCreated = true;
        } else {
          $pdfCreated = false;
        }
      } else {
        if ($request->has('pdf_data')) {
          $template->content = '';
          $pdfData = base64_decode(str_replace(' ', '+', $request->pdf_data));
          Storage::disk('public')->put('templates/' . $template->id . '/default.pdf', $pdfData);
          $pdfCreated = true;
        } else {
          $pdfCreated = false;
        }
      }

      if ($pdfCreated) {
        $template->pdf_path = 'public/templates/' . $template->id . '/default.pdf';
        $template->preview_updated_at = Carbon::now();
      }

      $url = config('app.url') . '/#/dashboard/templates/' . $template->id . '/edit';
      $id = Crypt::encrypt($template->id);
      $qrWName = 'public/templates/' . $template->id . '/qrw-' . Str::random(24) . '.png';
      $qrAName = 'public/templates/' . $template->id . '/qra-' . Str::random(24) . '.png';
      $qrWeb = storage_path('app/' . $qrWName);
      $qrApp = storage_path('app/' . $qrAName);

      QrCode::format('png')->size(480)->generate($url, $qrWeb);
      QrCode::format('png')->size(480)->generate($id, $qrApp);

      $template->qr_web = $qrWName;
      $template->qr_app = $qrAName;

      $template->save();

      return new TemplateResource($template);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error saving the template',
        'error' => $e->getMessage()
      ], 400);
    }
  }

  /**
   * Update a Template
   *
   * @param \App\Http\Requests\TemplateRequest
   * @param \App\Template
   * @return \App\Http\Resources\TemplateResource|\Illuminate\Http\JsonResponse
   */
  public function update(TemplateRequest $request, Template $template)
  {
    $data = $request->except([
      'pdf_data',
      'preview_updated_at',
    ]);

    try {
      $pdfCreated = false;
      $template->update($data);

      if ($template->type == 'content') {
        if (mb_strlen($template->content) > 0) {
          libxml_use_internal_errors(true);
          $pdf = App::make('dompdf.wrapper');
          $pdf->loadView('templates.skeleton', ['template' => $template]);
          Storage::disk('public')->put('templates/' . $template->id . '/default.pdf', $pdf->download()->getOriginalContent());
          $pdfCreated = true;
        } else {
          $pdfCreated = false;
        }
      } else {
        if ($request->has('pdf_data')) {
          $template->content = '';
          $image = $request->new_image;
          $pdfData = base64_decode(str_replace(' ', '+', $request->pdf_data));
          Storage::disk('public')->put('templates/' . $template->id . '/default.pdf', $pdfData);
          $pdfCreated = true;
        } else {
          $pdfCreated = false;
        }
      }

      if ($pdfCreated) {
        $data['pdf_path'] = 'public/templates/' . $template->id . '/default.pdf';
        $data['preview_updated_at'] = Carbon::now();
        $template->update($data);
      }

      return new TemplateResource($template);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error Updating the Template',
        'error' => $e->getMessage()
      ], 400);
    }
  }

  /**
   * Remove a Template
   *
   * @param \App\Template
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroy(Template $template): JsonResponse
  {
    try {
      $documents = $template->documents()->count();
      if ($template->documents()->count() > 0) {
        return response()->json([
          'message' => 'The Template ' . $template->name . ' cannot be removed. It has ' . $documents . ' documents.'
        ], 403);
      }

      $template->fields()->sync([]);
      $template->groups()->sync([]);
      $template->customers()->sync([]);
      $template->delete();

      return response()->json([
        'message' => 'The Template ' . $template->name . ' was removed succesfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Cannot remove this Template.',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Remove multiple Templates
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroyTemplates(Request $request): JsonResponse
  {
    try {
      $ids = $request->has('templates') ? explode(',', $request->templates) : [];
      $templates = Template::whereIn('id', $ids)->get();

      foreach ($templates as $template) {
        $template->fields()->sync([]);
        $template->groups()->sync([]);
        $template->customers()->sync([]);
        $template->delete();
      }

      return response()->json([
        'message' => 'The Template ' . $template->name . ' was removed succesfully'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Cannot remove this Template.',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Duplicate a Template
   *
   * @param \App\Template
   * @return \App\Http\Resources\TemplateResource
   */
  public function duplicate(Template $template): TemplateResource
  {
    $duplicate = $template->replicate();
    $duplicate->name = 'Copy of ' . $template->name;
    $duplicate->save();
    foreach ($template->fields as $field) {
      $field->templates()->attach($duplicate);
    }

    return new TemplateResource($duplicate);
  }

  /**
   * Get the template fields
   *
   * @param \App\Template
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function fields(Template $template): JsonResponse
  {
    $fields = $template->fields()->orderBy('field_template.position', 'asc')->get();
    return response()->json([
      'data' => $this->formatFields($fields)
    ]);
  }

  /**
   * Get specific field from template
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Template $template
   * @param \App\Field $field
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function field(Request $request, Template $template, Field $field): JsonResponse
  {
    $data = $template->fields()->find($field->id);
    return response()->json([
      'data' => $this->formatField($data)
    ]);
  }

  /**
   * Attach a field to the template
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Template $template
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function attach(Request $request, Template $template): JsonResponse
  {
    try {
      if ($request->has('field')) {
        $data = $request->only([
          'name',
          'position',
          'details',
          'placeholder',
        ]);

        if ($request->has('metadata')) {
          $data['metadata'] = $request->metadata;
        }

        if ($request->has('required')) {
          $data['is_required'] = $request->required;
        }

        $template->fields()->attach($request->field, $data);
        $field = $template->fields()->find($request->field);
        $this->orderFields($template, $field, $request->position);

        foreach ($template->documents as $document) {
          $document->fields()->attach($field, [
            'value' => ''
          ]);
        }

        return response()->json([
          'message' => 'The field was attached to the template',
          'data'    => $this->formatField($field),
        ]);
      } else {
        throw new Exception('The field is not valid', 1);
      }
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'There was an error attaching the field',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Update a field in the template
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Template $template
   * @param \App\Field $field
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function updateField(FieldRequest $request, Template $template, Field $field): JsonResponse
  {
    try {
      $data = $request->only([
        'name',
        'position',
        'details',
        'placeholder',
      ]);

      if ($request->has('metadata')) {
        $data['metadata'] = $request->metadata;
      }

      if ($request->has('required')) {
        $data['is_required'] = $request->required;
      }

      if ($request->has('type')) {
        $field->update([
          'type' => $request->type
        ]);
      }

      $template->fields()->updateExistingPivot($field, $data);
      $updated = $template->fields()->find($field->id);

      return response()->json([
        'message' => 'The field was attached to the template',
        'data'    => $this->formatField($updated),
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'there was an error updating the field',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Detach a field from template
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Template $template
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function detach(Request $request, Template $template): JsonResponse
  {
    try {
      if ($request->has('field')) {
        $template->fields()->detach($request->field);
      }

      return response()->json([
        'message' => 'The field was detached from the template'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'There was an error detaching the field',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * reorder the fields in a template
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Template $template
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function reOrder(Request $request, Template $template): JsonResponse
  {
    try {
      $position = $request->position;
      $fieldId = $request->field;
      $updated = $template->fields()->find($fieldId);

      $this->orderFields($template, $updated, $position);

      $fields = $template->fields()->orderBy('field_template.position', 'asc')->get();
      return response()->json($fields);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'There was an error reordering the fields',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Get a list of customers to give access to them
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Template $template
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function customers(Request $request, Template $template): JsonResponse
  {
    $customers = $template->customers()->get();
    return response()->json($customers->toArray());
  }

  /**
   * Attach a customer to the template
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Template $template
   * @param \App\Customer $customer
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function attachCustomer(Request $request, Template $template, Customer $customer): JsonResponse
  {
    $template->customers()->attach($customer);
    return response()->json([
      'message' => 'the customer was attached to the template',
    ]);
  }

  /**
   * Detach a customer from the template
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Template $template
   * @param \App\Customer $customer
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function detachCustomer(Request $request, Template $template, Customer $customer): JsonResponse
  {
    $template->customers()->detach($customer);
    return response()->json([
      'message' => 'the customer was detached from the template',
    ]);
  }

  /**
   * Get a list of groups to give access to them
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Template $template
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function groups(Request $request, Template $template): JsonResponse
  {
    $groups = $template->groups()->get();
    return response()->json($groups->toArray());
  }

  /**
   * Attach a group to the template
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Template $template
   * @param \App\Group $group
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function attachGroup(Request $request, Template $template, Group $group): JsonResponse
  {
    $template->groups()->attach($group);
    return response()->json([
      'message' => 'the group was attached to the template',
    ]);
  }

  /**
   * Detach a group from the template
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Template $template
   * @param \App\Group $group
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function detachGroup(Request $request, Template $template, Group $group): JsonResponse
  {
    $template->groups()->detach($group);
    return response()->json([
      'message' => 'the group was detached from the template',
    ]);
  }

  /**
   * Attach Fields, that comes from the PDF, to the Templates
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Template $template
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function attachPDFJsonFields(Request $request, Template $template): JsonResponse
  {
    try {
      $fields = $request->get('fields', []);
      // $generalCategory = Category::firstOrCreate(['name' => 'General']);

      foreach ($fields as $jField) {
        switch ($jField['type']) {
          case 'number':
            $field = Field::create([
              'name' => $jField['id'],
              'slug' => $jField['id'],
              'type' => 'text_number',
            ]);

            // $field->categories()->attach($generalCategory);
            $template->fields()->attach($field, [
              'name' => $jField['id'],
              'position' => $jField['position'],
            ]);
            break;
          case 'box':
            $field = Field::create([
              'name' => $jField['id'],
              'slug' => $jField['id'],
              'type' => 'radio',
              'metadata' => $jField['metadata']
            ]);

            // $field->categories()->attach($generalCategory);
            $template->fields()->attach($field, [
              'name' => $jField['id'],
              'position' => $jField['position'],
              'metadata' => $jField['metadata']
            ]);
            break;
          default:
            $field = Field::create([
              'name' => $jField['id'],
              'slug' => $jField['id'],
              'type' => 'text_field',
            ]);

            // $field->categories()->attach($generalCategory);
            $template->fields()->attach($field, [
              'name' => $jField['id'],
              'position' => $jField['position']
            ]);
            break;
        }
      }

      $fields = $template->fields()->orderBy('field_template.position', 'asc')->get();
      return response()->json([
        'message' => 'The fields were added successfully',
        'data' => $this->formatFields($fields)
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'There was an error creating the fields',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * reorder the fields in a template
   *
   * @param \App\Template $template
   * @param \App\Field $updated
   * @param int $position
   * @return void
   */
  private function orderFields($template, $updated, $position)
  {
    $fields = $template->fields()->get();

    foreach ($fields as $field) {
      $updatedPosition = $field->pivot->position;

      if ($field->id == $updated->id) {
        $updatedPosition = $position;
      } elseif ($position < $updated->pivot->position) {
        if ($field->pivot->position >= $position && $field->pivot->position <= $updated->pivot->position) {
          $updatedPosition = $field->pivot->position + 1;
        }
      } elseif ($position > $updated->pivot->position) {
        if ($field->pivot->position >= $updated->pivot->position && $field->pivot->position <= $position) {
          $updatedPosition = $field->pivot->position - 1;
        }
      }

      $template->fields()->updateExistingPivot($field, [
        'position' => $updatedPosition,
      ]);
    }
  }

  /**
   * Format the list of fields
   *
   * @param \Illuminate\Database\Eloquent\Collection   fields
   * @return array
   */
  private function formatFields(Collection $fields): array
  {
    $formatted = [];
    foreach ($fields as $field) {
      $formatted[] = $this->formatField($field);
    }

    return $formatted;
  }

  /**
   * Format the field
   *
   * @param \App\Field $field
   * return array
   */
  private function formatField(Field $field): array
  {
    return [
      'id' => $field->id,
      'name' => isset($field->pivot->name) ? $field->pivot->name : $field->name,
      'position' => isset($field->pivot->position) ? $field->pivot->position : $field->id,
      'slug' => $field->slug,
      'type' => $field->type,
      'details' => isset($field->pivot->details) ? $field->pivot->details : $field->details,
      'placeholder' => isset($field->pivot->placeholder) ? $field->pivot->placeholder : $field->placeholder,
      'metadata' => isset($field->pivot->metadata) ? $field->pivot->metadata : $field->metadata,
      'required' => $field->is_required ? true : false,
      'created_at' => Carbon::parse($field->created_at)->format('d/m/Y'),
      'updated_at' => Carbon::parse($field->updated_at)->format('d/m/Y'),
    ];
  }
}
