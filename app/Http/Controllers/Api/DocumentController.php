<?php

namespace App\Http\Controllers\Api;

use App\Customer;
use App\Template;
use App\Field;
use App\Receiver;
use App\Document;
use App\Http\Controllers\Controller;
use App\Http\Resources\DocumentResource;
use App\Http\Requests\DocumentRequest;
use App\Http\Requests\DocumentFieldRequest;
use App\Mail\NotifySubmission;
use App\Mail\SendDocument;
use Carbon\Carbon;
use Exception;
use Illuminate\Contracts\Auth\Guard;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Smalot\PdfParser\Parser;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class DocumentController extends Controller
{
  /**
   * The instance of this controller
   *
   */
  public function __construct ()
  {
    $this->middleware('auth:api');
  }

  /**
   * List
   * Return the list of Documents
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\Resources\Json\JsonResource
   */
  public function index (Request $request) : JsonResource
  {
    $search = $request->query('search');
    $limit = $request->query('limit', 10);
    $startTime = $request->query('starttime', null);
    $endTime = $request->query('endtime', null);
    $customer = $request->query('customer', null);
    $sortBy = $request->query('sort-by', 'created_at');
    $sort = $request->query('sort', 'DESC');
    $status = $request->query('status', 'draft,pending');
    $ignore = $request->query('ignore', null);

    $documents = Document::when($search, function (Builder $query, $search) {
        return $query->where(function (Builder $query) use ($search) {
          $terms = array_filter(preg_split('/\s\+,\,/', $search));
          foreach ($terms as $term) {
            $query->orWhere('name', 'like', "%{$term}%");
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
      ->when($customer, function (Builder $query, $customer) {
        $query->where('customer_id', $customer);
      })
      ->when($status, function (Builder $query, $status) {
        $terms = explode(',', $status);
        $query->whereIn('status', $terms);
      })
      ->when($ignore, function (Builder $query, $ignore) {
        $terms = explode(',', $ignore);
        $query->whereNotIn('status', $terms);
      })
      ->paginate($limit);

    return DocumentResource::collection($documents);
  }

  /**
   * List all the submissions (Documents that where submitted/delivered)
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\Resources\Json\JsonResource
   */
  public function submissions(Request $request): JsonResource
  {
    $search = $request->query('search');
    $limit = $request->query('limit', 5);
    $startTime = $request->query('starttime', null);
    $endTime = $request->query('endtime', null);
    $sortBy = $request->query('sort-by', 'created_at');
    $sort = $request->query('sort', 'DESC');
    $status = $request->query('status', 'submitted');
    $ignore = $request->query('ignore', null);
    $submitter = $request->query('submitter', null);
    $customer = $request->query('customer', null);

    $documents = Document::when($search, function (Builder $query, $search) {
        return $query->where(function (Builder $query) use ($search) {
          $terms = array_filter(preg_split('/\s\+,\,/', $search));
          foreach ($terms as $term) {
            $query->orWhere('name', 'like', "%{$term}%");
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
      ->when($status, function (Builder $query, $status) {
        $terms = explode(',', $status);
        $query->whereIn('status', $terms);
      })
      ->when($ignore, function (Builder $query, $ignore) {
        $terms = explode(',', $ignore);
        $query->whereNotIn('status', $terms);
      })
      ->when($submitter, function (Builder $query, $submitter) {
        $query->whereHas('receiver', function (Builder $query2) use ($submitter) {
          $query2->where('submitter_id', $submitter);
        });
      })
      ->when($customer, function (Builder $query, $customer) {
        $query->where('customer_id', $customer);
      })
      ->paginate($limit);

    return DocumentResource::collection($documents);
  }

  /**
   * Show Document
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Document $document
   * @return \App\Http\Resources\DocumentResource
   */
  public function show (Request $request, Document $document) : DocumentResource
  {
    return new DocumentResource($document);
  }

  /**
   * Store new Document
   *
   * @param \App\Http\Requests\DocumentRequest $request
   * @return \App\Http\Resources\DocumentResource | \Illuminate\Http\JsonResponse
   */
  public function store (DocumentRequest $request)
  {
    try {
      $user = $this->getAuth()->user();

      $status = 'draft';
      $data = $request->only([
        'use_template',
        'type',
        'content',
        'name',
      ]);

      $document = new Document($data);
      $document->user()->associate($user);
      $document->save();

      $path = storage_path('app/public/documents/' . $document->id);
      File::makeDirectory($path, 0777, true, true);

      if ($request->use_template || $request->type == 'pdf') {
        $status = 'pending';
      }

      if ($request->has('template')) {
        $template = Template::find($request->template);
        $document->template()->associate($template);

        $fileName = 'public/documents/' . $document->id . '/' . Str::random(32) . '.pdf';
        $document->preview = $fileName;
        Storage::copy($template->pdf_path, $fileName);
        $document->save();
      }

      if ($request->has('content')) {
        if (!$document->use_template && $document->type == 'content') {
          $document->preview = $this->updateDocumentPreview($document);
          $document->save();
        }
      }

      if ($request->has('customer')) {
        $customer = Customer::where('id', $request->customer)->first();
        if ($customer) {
          $document->customer()->associate($customer);
        }
      }

      $update = $this->generateQrCodes($document);
      $update['status'] = $status;
      $document->update($update);

      $this->insertDefaultFields($document);

      return new DocumentResource($document);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error saving the Document',
        'error'   => $e->getMessage()
      ], 400);
    }

  }

  /**
   * Update a Document
   *
   * @param \App\Http\Requests\DocumentRequest $request
   * @param \App\Document
   * @return \App\Http\Resources\DocumentResource | \Illuminate\Http\JsonResponse
   */
  public function update (DocumentRequest $request, Document $document)
  {
    try {
      $status = 'draft';
      $data = $request->only([
        'use_template',
        'type',
        'content',
        'name',
      ]);

      $document->update($data);

      if ($request->has('customer')) {
        $customer = Customer::where('id', $request->customer)->first();
        if ($customer) {
          $document->customer()->associate($customer);
          $document->save();
        }
      }

      if ($document->use_template) {
        if ($request->has('template')) {
          $template = Template::find($request->template);
          if ($template && $request->template != $document->template_id) {
            $document->template()->associate($request->template);

            $fileToDelete = null;
            if ($document->preview) {
              $fileToDelete = $document->preview;
            }

            if ($template->pdf_path) {
              $fileName = 'public/documents/' . $document->id . '/' . Str::random(32) . '.pdf';
              $document->preview = $fileName;
              $document->status = 'draft';
              Storage::copy($template->pdf_path, $fileName);
            } else {
              $document->preview = 'public/' . $this->updateDocumentPreview($document);
            }

            if ($fileToDelete) {
              Storage::delete($fileToDelete);
            }

            $document->save();
          }
        } else {
          $status = 'pending';
        }
      } else {
        if ($document->type == 'content') {
          if ($request->has('content')) {
            if (!$document->use_template && $document->type == 'content') {
              $document->preview = 'public/' . $this->updateDocumentPreview($document);
              $document->status = 'draft';
              $document->save();
            }
          }
        } else {
          if ($request->has('pdf_data')) {
            if (!$document->use_template && $document->type == 'pdf') {
              $fileToDelete = null;
              if ($document->preview) {
                $fileToDelete = $document->preview;
              }

              $document->content = '';
              $pdfData = base64_decode(str_replace(' ', '+', $request->pdf_data));
              $name = 'documents/' . $document->id . '/' . Str::random(32) . '.pdf';
              Storage::disk('public')->put($name, $pdfData);
              $document->preview = 'public/' . $name;
              $document->save();

              if ($fileToDelete) {
                Storage::delete($fileToDelete);
              }
            }
          } else {
            $status = 'pending';
          }
        }
      }

      if ($document->status != $status) {
        $document->update([ 'status' => $status ]);
      }

      return new DocumentResource($document);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error updating the Document',
        'error'   => $e->getMessage(),
      ], 400);
    }
  }

  /**
   * Remove a Document
   *
   * @param \App\Document $document
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroy (Document $document) : JsonResponse
  {
    try {
      $document->fields()->sync([]);
      $document->delete();

      Storage::deleteDirectory('public/documents/' . $document->id);

      return response()->json([
        'message' => 'The document ' . $document->name . ' was removed successfully.'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Cannot remove this Document.',
        'error'   => $e->getMessage(),
      ], 400);
    }
  }

  /**
   * Remove multiple Documents
   *
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function destroyDocuments (Request $request) : JsonResponse
  {
    try {
      $ids = $request->has('documents') ? explode(',', $request->documents) : [];
      $documents = Document::whereIn('id', $ids)->get();

      foreach ($documents as $document) {
        $document->fields()->sync([]);
        $document->delete();
      }

      return response()->json([
        'message' => 'The documents were removed successfully.'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Cannot remove this Document.',
        'error'   => $e->getMessage(),
      ], 400);
    }
  }

  /**
   * duplicate a Document
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Document $document
   * @return \App\Http\Resources\DocumentResource
   */
  public function duplicate (Request $request, Document $document) : DocumentResource
  {
    $name = $request->has('name') ? $request->name : 'Copy of ' . $document->name;
    $status = $request->has('status') ? $request->status : 'draft';
    $duplicate = $this->duplicateDocument($document, $name, $status);
    return new DocumentResource($duplicate);
  }

  /**
   * Send the submission to the receiver an email to the receiver
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Document $document
   * @return \Illuminate\Http\JsonResponse
   */
  public function send (Request $request, Document $document) : JsonResponse
  {
    try {
      if ($request->has('email')) {
        $this->sendDocument($document, $request->email);

        return response()->json([
          'message' => 'The Document was sent to ' . $request->email
        ]);
      }
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error sending the document',
        'error'   => $e->getMessage()
      ], 400);
    }
  }

  /**
   * Get the list of fields
   *
   * @param \App\Document $document
   * @return \Illuminate\Http\JsonResponse
   */
  public function fields (Document $document) : JsonResponse
  {
    $fields = $document->fields()->wherePivot('disabled', false)->orderBy('document_field.position', 'asc')->get();
    $data = $this->formatFields($document->template, $document, $fields);

    return response()->json([
      'data' => $data,
    ]);
  }

  /**
   * Get a field of a document
   *
   * @param \App\Document $document
   * @param \App\Field $field
   * @return \Illuminate\Http\JsonResponse
   */
  public function getField(Document $document, Field $field): JsonResponse
  {
    try {
      $data = $this->formatField(null, $document, $document->fields()->where('field_id', $field->id)->first());

      return response()->json([
        'data' => $data
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error getting the field',
        'error' => $e->getMessage()
      ], 404);
    }
  }

  /**
   * attach a field to document
   *
   * @param \App\Http\Requests\DocumentFieldRequest $request
   * @param \App\Document $document
   * @return \Illuminate\Http\JsonResponse
   */
  public function attachField (DocumentFieldRequest $request, Document $document) : JsonResponse
  {
    try {
      $info = $request->only([
        'value',
        'name',
        'details',
        'position',
        'placeholder',
        'is_required',
        'metadata',
        'is_exportable',
        'exportable_name',
      ]);

      $fieldId = $request->input('field');
      $field = Field::find($fieldId);
      $template = null;

      if ($document->use_template) {
        $template = $document->template;
      }

      $document->fields()->attach($field, $info);

      $updated = $document->fields()->find($request->field);
      $this->orderFields($document, $updated, $request->position);

      $data = $this->formatField($template, $document, $document->fields()->find($fieldId));

      return response()->json([
        'data' => $data
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error saving the field',
        'error' => $e->getMessage()
      ], 400);
    }
  }

  /**
   * attach fields to document
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Document $document
   * @return \Illuminate\Http\JsonResponse
   */
  public function attachFields (Request $request, Document $document) : JsonResponse
  {
    try {
      $fieldIds = explode(',', $request->input('fields'));
      $fields = Field::find($fieldIds);

      $document->fields()->sync($fields);
      $data = $this->formatFields($document->template, $document, $document->fields()->get());

      return response()->json([
        'data' => $data
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error saving the field',
        'error' => $e->getMessage()
      ], 400);
    }
  }

  /**
   * update a field in a document
   *
   * @param \App\Http\Requests\DocumentFieldRequest $request
   * @param \App\Document $document
   * @param \App\Field $field
   * @return \Illuminate\Http\JsonResponse
   */
  public function updateField (Request $request, Document $document, Field $field) : JsonResponse
  {
    try {
      $data = $request->only([
        'name',
        'position',
        'details',
        'placeholder',
        'is_required',
        'metadata',
        'is_exportable',
        'exportable_name',
      ]);

      if ($request->has('type')) {
        $field->update([
          'type' => $request->type,
        ]);
      }

      $document->fields()->updateExistingPivot($field, $data);

      $data = $this->formatField(null, $document, $document->fields()->find($field->id));

      return response()->json([
        'data' => $data
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Error saving the field',
        'error' => $e->getMessage()
      ], 400);
    }
  }

  /**
   * bulk fields updates
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Document $document
   * @return \Illuminate\Http\JsonResponse
   */
  public function updateFields (Request $request, Document $document) : JsonResponse
  {
    try {
      $user = $this->getAuth()->user();
      // duplicate the document (create a submission)
      $submission = $this->duplicateDocument($document, 'Submission of ' . $document->name . ' by ' . $user->name);

      // Clean the current document if it has filled fields
      $this->cleanDocument($document);

      $fields = $request->has('fields') ? $request->fields : [];
      $email = $request->has('email') ? $request->email : null;
      $template = $document->template;
      $hasErrors = false;
      $errors = [];

      // Updating the fields
      foreach ($fields as $info) {
        $id = isset($info['field']) ? $info['field'] : null;
        $value = isset($info['value']) ? $info['value'] : null;
        $field = $document->fields()->find($id);

        if ($field) {
          if ($field->pivot->is_required && empty($value)) {
            $hasErrors = true;
            $errors[] = [
              'field' => $field->id,
              'message' => 'The field ' . $field->name . ' is required'
            ];

            continue;
          }

          if ($field->type == 'signature' && !empty($value)) {
            if (strpos($value, 'public/documents') === false) {
              $name = 'documents/' . $submission->id . '/signatures/' . Str::random(32) . '.png';
              Storage::disk('public')->put($name, file_get_contents($value));
              $value = 'public/' . $name;
            }
          }

          $submission->fields()->updateExistingPivot($field, [
            'value' => $value
          ]);
        }
      }

      if ($hasErrors) {
        // removing the submission document
        $submission->fields()->sync([]);
        $submission->delete();

        return response()->json([
          'errors' => $errors,
          'message' => 'Please fill the required fields',
        ], 400);
      }

      $name = $this->updateDocumentPreview($submission);

      $submission->update([
        'preview' => $name,
        'status' => 'submitted',
      ]);

      if ($email) {
        $this->sendDocument($submission, $email);
      }

      $data = $this->formatFields($template, $document, $document->fields()->get());

      return response()->json([
        'data' => $data
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'There was an error updating the fields',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Deliver a document and generate a submission
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Document $document
   * @return \Illuminate\Http\JsonResponse
   */
  public function deliver (Request $request, Document $document) : JsonResponse
  {
    try {
      $user = $this->getAuth()->user();

      if ($request->has('variables')) {
        foreach ($request->variables as $key => $value) {
          $field = $document->fields()->where('slug', $key)->first();

          if ($field) {
            if ($field->type == 'signature') {
              $name = 'documents/' . $document->id . '/signatures/' . Str::random(32) . '.png';
              Storage::disk('public')->put($name, file_get_contents($value));
              $document->fields()->updateExistingPivot($field, [
                'value' => 'public/' . $name
              ]);
            } else {
              $document->fields()->updateExistingPivot($field, [
                'value' => $value
              ]);
            }
          }
        }
      }

      $document->update([
        'name' => $document->name . ' by ' . $user->name,
        'preview' => $this->updateDocumentPreview($document),
        'status'  => 'submitted',
      ]);

      if ($request->has('receiver_email')) {
        $this->sendDocument($document, $request->receiver_email);
        $document->update([ 'status' => 'submitted' ]);
      }

      return response()->json([
        "status" => "success",
        'message' => 'The submission ' . $document->name . ' was created.',
        'preview_url' => $document->getPreviewURL(),
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'status' => 'error',
        'message' => 'Error updating the Document',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Generate a preview of the Document
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Document $document
   * @return \Illuminate\Http\JsonResponse
   */
  public function preview(Request $request, Document $document) : JsonResponse
  {
    try {
      if ($request->has('variables')) {
        foreach ($request->variables as $key => $value) {
          $field = $document->fields()->where('slug', $key)->first();

          if ($field) {
            if ($field->type == 'signature') {
              $name = 'documents/' . $document->id . '/signatures/' . Str::random(32) . '.png';
              Storage::disk('public')->put($name, file_get_contents($value));
              $document->fields()->updateExistingPivot($field, [
                'value' => 'public/' . $name
              ]);
            } else {
              $document->fields()->updateExistingPivot($field, [
                'value' => $value
              ]);
            }
          }
        }
      }

      // this is the location of the sender
      if ($request->has('sender_location')) {
      }

      $document->update([
        'preview' => $this->updateDocumentPreview($document),
      ]);

      return response()->json([
        "status" => "success",
        'message' => 'The preview of ' . $document->name . ' was generated succesfully.',
        'preview_url' => $document->getPreviewURL(),
      ]);
    } catch (\Exception $e) {
      $this->cleanDocument($document);

      return response()->json([
        'status' => 'error',
        'message' => 'Error updating the Document',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * Detach a field
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Document $document
   * @param int $field
   * @return \Illuminate\Http\JsonResponse
   */
  public function detachField (Request $request, Document $document, int $field) : JsonResponse
  {
    try {
      // won't be detached, will be disabled
      // $document->fields()->detach($field);
      $document->fields()->updateExistingPivot($field, [
        'disabled' => true,
      ]);

      return response()->json([
        'message' => 'The field was disabled successfully.'
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Cannot disable the field',
        'error'   => $e->getMessage()
      ], 400);
    }
  }

  /**
   * Restore a disabled field
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Document $document
   * @param int $field
   * @return \Illuminate\Http\JsonResponse
   */
  public function restoreField (Request $request, Document $document, int $field): JsonResponse
  {
    try {
      $document->fields()->updateExistingPivot($field, [
        'disabled' => false
      ]);

      return response()->json([
        'message' => 'The fields was restored succesfully',
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'Cannot restore the field',
        'error' => $e->getMessage()
      ], 500);
    }
  }

  /**
   * reorder the fields in a template
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Document $document
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function reOrder(Request $request, Document $document): JsonResponse
  {
    try {
      $position = $request->position;
      $fieldId = $request->field;
      $beforeUpdate = $document->fields()->find($fieldId);

      $document->fields()->updateExistingPivot($fieldId, [
        'position' => $position
      ]);

      $updated = $document->fields()->find($fieldId);

      $this->orderFields($document, $updated, $position, $beforeUpdate->position);

      $fields = $document->fields()->wherePivot('disabled', false)->orderBy('document_field.position', 'asc')->get();
      $data = $this->formatFields($document->template, $document, $fields);

      return response()->json($fields);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'There was an error reordering the fields',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Attach Fields, that comes from the PDF, to the Document
   *
   * @param \Illuminate\Http\Request $request
   * @param \App\Document $document
   * @return \Symfony\Component\HttpFoundation\JsonResponse
   */
  public function attachPDFJsonFields(Request $request, Document $document): JsonResponse
  {
    try {
      $fields = $request->get('fields', []);

      // removing current fields
      $currentFields = $document->fields()->get();
      $document->fields()->sync([]);
      foreach ($currentFields as $field) {
        if ($field->documents()->count() == 0 || $field->templates()->count() == 0) {
          $field->delete();
        }
      }

      foreach ($fields as $jField) {
        switch ($jField['type']) {
          case 'number':
            $field = Field::create([
              'name' => $jField['id'],
              'slug' => $jField['id'],
              'type' => 'text_number',
            ]);

            $document->fields()->attach($field, [
              'value' => $jField['value']
            ]);
            break;
          case 'box':
            $field = Field::create([
              'name' => $jField['id'],
              'slug' => $jField['id'],
              'type' => 'radio',
              'metadata' => $jField['metadata']
            ]);

            $document->fields()->attach($field, [
              'value' => $jField['value']
            ]);
            break;
          default:
            $field = Field::create([
              'name' => $jField['id'],
              'slug' => $jField['id'],
              'type' => 'text_field',
            ]);

            $document->fields()->attach($field, [
              'value' => $jField['value']
            ]);
            break;
        }
      }

      $fields = $document->fields()->get();
      return response()->json([
        'message' => 'The fields were added successfully',
        'data' => $this->formatFields($document->template, $document, $fields)
      ]);
    } catch (\Exception $e) {
      return response()->json([
        'message' => 'There was an error creating the fields',
        'error' => $e->getMessage(),
      ], 500);
    }
  }

  /**
   * Duplicate a Document
   *
   * @param \App\Document $document
   * @param string $name
   * @param string $status
   * @return \App\Document
   */
  private function duplicateDocument(Document $document, $name, $status = 'draft'): Document
  {
    $duplicate = $document->replicate();
    $duplicate->original_name = $document->name;
    $duplicate->name = $name;
    $duplicate->preview = null;
    $duplicate->qr_web = null;
    $duplicate->qr_app = null;
    $duplicate->status = $status;
    $duplicate->parent_id = $document->id;
    $duplicate->save();

    foreach ($document->fields as $field) {
      $value = isset($field->pivot->value) ? $field->pivot->value : null;

      // updating ticket value
      if ($field->type == 'ticket_id') {
        $metadata = isset($field->pivot->metadata) ? $field->pivot->metadata : $field->metadata;
        if ($metadata) {
          $metadata = json_decode($metadata);
        }
        $count = Document::whereIn('status', ['submitted', 'typing'])
          ->where('parent_id', $document->id)
          ->where('id', '!=', $duplicate->id)
          ->count();
        $length = strlen(strval($count));
        $value = (isset($metadata->prefix) ? $metadata->prefix . '_' : '') . substr("0000000000", 0 , 10 - $length) . strval($count + 1);
      }

      $duplicate->fields()->attach($field, [
        'value' => $value,
        'name' => isset($field->pivot->name) ? $field->pivot->name : null,
        'details' => isset($field->pivot->details) ? $field->pivot->details : null,
        'position' => isset($field->pivot->position) ? $field->pivot->position : null,
        'metadata' => isset($field->pivot->metadata) ? $field->pivot->metadata : null,
        'disabled' => isset($field->pivot->disabled) ? $field->pivot->disabled : false,
        'placeholder' => isset($field->pivot->placeholder) ? $field->pivot->placeholder : null,
        'is_required' => isset($field->pivot->is_required) ? $field->pivot->is_required : null,
        'is_exportable' => isset($field->pivot->is_exportable) ? $field->pivot->is_exportable : null,
        'exportable_name' => isset($field->pivot->exportable_name) ? $field->pivot->exportable_name : null,
      ]);
    }

    $path = storage_path('app/public/documents/' . $duplicate->id);
    File::makeDirectory($path, 0777, true, true);

    $files = $this->generateQrCodes($duplicate);
    $files["preview"] = $this->updateDocumentPreview($duplicate);
    $duplicate->update($files);

    return $duplicate;
  }

  /**
   * Send the Document
   *
   * @param \App\Document $document
   * @param string $email
   */
  private function sendDocument(Document $document, string $email)
  {
    $user = $this->getAuth()->user();
    $customer = $document->customer;

    $receiver = new Receiver([ 'email' => $email, 'status' => 'sent', 'sent_on' => Carbon::now() ]);

    $receiver->document()->associate($document);
    $receiver->submitter()->associate($user);
    $receiver->save();
    Mail::to($email)->send(new SendDocument($document));

    // sending a copy to the customer, if emails is available
    if (isset($customer->email)) {
      $customerReceiver = new Receiver([ 'email' => $customer->email, 'status' => 'sent', 'sent_on' => Carbon::now() ]);
      $customerReceiver->document()->associate($document);
      $customerReceiver->submitter()->associate($user);
      $customerReceiver->save();
      Mail::to($customerReceiver)->send(new NotifySubmission($document));
    }
  }

  /**
   * Remove info from documents
   *
   * @param \App\Document $document
   * @param boolean $updatePreview
   */
  private function cleanDocument(Document $document, $updatePreview = true)
  {
    foreach ($document->fields as $field) {
      if ($field->type == 'signature') {
        Storage::delete($field->pivot->value);
      }
      $document->fields()->updateExistingPivot($field, [
        'value' => null,
      ]);
    }

    if ($updatePreview) {
      $document->update([
        'preview' => $this->updateDocumentPreview($document)
      ]);
    }
  }

  /**
   * Format the list of fields
   *
   * @param \App\Template $template
   * @param \Illuminate\Database\Eloquent\Collection   fields
   * @return array
   */
  private function formatFields (Template $template = null, Document $document, Collection $fields) : array
  {
    $formatted = [];
    foreach ($fields as $field) {
      $formatted[] = $this->formatField($template, $document, $field);
    }

    return $formatted;
  }

  /**
   * Format the field
   *
   * @param \App\Template $template
   * @param \App\Field $field
   * @return array
   */
  private function formatField (Template $template = null, Document $document, Field $field) : array
  {
    $tField = null;

    if ($template) {
      $tField = $template->fields()->find($field->id);
    } else {
      $tField = $document->fields()->find($field->id);
    }

    if (isset($tField->pivot->metadata)) {
      $metadata = gettype($tField->pivot->metadata) == 'string' ? json_decode($tField->pivot->metadata) : $tField->pivot->metadata;
    } else {
      $metadata = gettype($field->metadata) == 'string' ? json_decode($field->metadata) : $field->metadata;
    }

    $signature = null;
    if ($field->type == 'signature') {
      $signature = !empty($field->pivot->value) ? url(preg_replace('/^public\//i', 'storage/', $field->pivot->value)) : null;
      // if ($path) {
      //   $type = pathinfo($path, PATHINFO_EXTENSION);
      //   $data = file_get_contents($path);
      //   // $signature = 'data:image/' . $type . ';base64,' . base64_encode($data);
      //   $signature = base64_encode($data);
      // }
    }

    $details = isset($tField->pivot->details) ? $tField->pivot->details : $tField->details;
    $placeholder = isset($tField->pivot->placeholder) ? $tField->pivot->placeholder : $tField->placeholder;
    return [
      'id' => $field->id,
      'name' => isset($tField->pivot->name) ? $tField->pivot->name : $tField->name,
      'slug' => $field->slug,
      'type' => $field->type,
      'details' => $details ? $details : '',
      'placeholder' => $placeholder ? $placeholder : '',
      'required' => (isset($tField->pivot->is_required) ? $tField->pivot->is_required : $tField->is_required) ? true : false,
      'metadata' => $metadata,
      'order' => (isset($tField->pivot->position)) ? $tField->pivot->position : $field->id,
      'value' => $field->type == 'signature' ? $signature : (!empty($field->pivot->value) ? $field->pivot->value : ''),
      'disabled' => $field->pivot->disabled ? true : false,
      'is_exportable' => $field->pivot->is_exportable ? true : false,
      'exportable_name' => $field->pivot->exportable_name,
      'signature' => $signature ? $signature : null,
      'created_at' => Carbon::parse($field->pivot->created_at)->format('d/m/Y'),
      'updated_at' => Carbon::parse($field->pivot->updated_at)->format('d/m/Y'),
    ];
  }

  /**
   * Generate the QR Code fields
   *
   * @param \App\Document $document
   * @return array
   */
  private function generateQrCodes(Document $document): array
  {

    $url = config('app.url') . '/#/dashboard/documents/' . $document->id . '/edit';
    $id = Crypt::encrypt($document->id);
    $qrWName = 'public/documents/' . $document->id . '/qrw-' . Str::random(24) . '.png';
    $qrAName = 'public/documents/' . $document->id . '/qra-' . Str::random(24) . '.png';
    $qrWeb = storage_path('app/' . $qrWName);
    $qrApp = storage_path('app/' . $qrAName);

    QrCode::format('png')->size(480)->generate($url, $qrWeb);
    QrCode::format('png')->size(480)->generate($id, $qrApp);

    return [
      'qr_web' => $qrWName,
      'qr_app' => $qrAName,
    ];
  }

  /**
   * Format the field
   *
   * @param \App\Document $document
   * @return string
   */
  private function updateDocumentPreview (Document $document) : string
  {
    $fileToDelete = null;
    if ($document->preview) {
      $fileToDelete = $document->preview;
    }

    $template = $document->template;
    libxml_use_internal_errors(true);
    $pdf = App::make('dompdf.wrapper');
    $name = 'documents/' . $document->id . '/' . Str::random(32) . '.pdf';

    if (!$document->use_template) {
      $pdf->loadView($document->getPdfTemplate(), [
        'content' => (is_null($document->content) || mb_strlen($document->content) == 0)
                    ? null
                    : $this->replaceFields($document->content, $document),
        'customer' => $document->customer,
        'fields' => $document->fields()->wherePivot('disabled', false)->orderBy('document_field.position', 'asc')->get(),
        'title' => $document->original_name ? $document->original_name : $document->name,
      ]);
      Storage::disk('public')->put($name, $pdf->download()->getOriginalContent());

      if ($fileToDelete) {
        Storage::delete($fileToDelete);
      }

      return $name;
    }

    if ($document->use_template) {
      $pdf->loadView($document->getPdfTemplate(), [
        'content' => (is_null($template->content) || mb_strlen($template->content) == 0)
                    ? null
                    : $this->replaceFields($template->content, $document),
        'customer' => $document->customer,
        'fields' => $document->fields,
      ]);
      Storage::disk('public')->put($name, $pdf->download()->getOriginalContent());

      if ($fileToDelete) {
        Storage::delete($fileToDelete);
      }
    }

    return 'public/'. $name;
  }

  /**
   * Replace the fields with the custom values
   *
   * @param string $string
   * @param \App\Document $document
   * @return string
   */
  private function replaceFields (string $string, Document $document) : string
  {
    preg_match("/\[(.*?)\]/", $string, $matches);
    if (isset($matches[0])) {
      $newString = $this->replaceString ($matches[0], $string, $document);
      $string = $this->replaceFields($newString, $document);
    }

    return $string;
  }

  /**
   * Replace specific fields
   *
   * @param string $match
   * @param string $string
   * @param \App\Document $document
   * @return string
   */
  private function replaceString ($match, $string, $document) : string
  {
    $slug = str_replace(array('[',']'),'',$match);
    $field = $document->fields()->where('slug', $slug)->first();

    if ($field) {
      $value = $field->pivot->value;
      switch ($field->type) {
        case 'signature':
          if (!empty($value) && !is_null($value) && strlen($value) > 0) {
            try {
              $path = preg_replace('/^public\//i', '', $value);
              $url = asset('storage/' . $path);
            } catch (\Exception $e) {
              $url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
            }
          } else {
            $url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
          }
          return str_replace($match, '<img src="' . $url . '" width="240">', $string);
        case 'date':
          if (is_numeric($value)) {
            $date = \Carbon\Carbon::createFromTimestamp($value);
          } else {
            $date = \Carbon\Carbon::parse($value);
          }
          return str_replace($match, $date->format('F d, Y'), $string);
        default:
          return str_replace($match, $value, $string);
      }
    }

    return str_replace($match, '{' . $slug . '}', $string);
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

  /**
   * reorder the fields in a document
   *
   * @param \App\Document $document
   * @param \App\Field $updated
   * @param int $position
   * @return void
   */
  private function orderFields($document, $updated, $position, $lastPosition = 0)
  {
    $currentPosition = $document
      ->fields()
      ->where('fields.id', '!=', $updated->id)
      ->wherePivot('position', $position)
      ->first();

    if ($currentPosition) {
      $document->fields()->updateExistingPivot($currentPosition, [
        'position' => $currentPosition->pivot->position + ($lastPosition < $position ? -1 : 1 )
      ]);
    }
    $fields = $document->fields()->orderBy('document_field.position', 'asc')->get();

    foreach ($fields as $index => $field) {
      $newPosition = $index + 1;
      if ($field->id == $updated->id) {
        $newPosition = $position;
      }

      if ($currentPosition) {
        if ($field->id == $currentPosition->id) {
          continue;
        }
      }

      $document->fields()->updateExistingPivot($field, [
        'position' => $newPosition
      ]);
    }
  }

  /**
   * Insert default fields to new documents
   *
   * @param \App\Document $document
   * @return void
   */
  private function insertDefaultFields( Document $document )
  {
    // Ticket ID
    $default = [
      'name'  => 'Ticket ID',
      'details' => '',
      'placeholder' => '',
      'metadata'    => '{"prefix":"WL"}',
      'is_required' => false
    ];
    $ticketID = Field::where('slug', 'ticket_id')->first();

    if (!$ticketID) {
      $ticketID = Field::create(array_merge($default, ['slug'  => 'ticket_id', 'type'  => 'ticket_id']));
    }

    $default['exportable_name'] = 'Ticket';
    $document->fields()->attach($ticketID, $default);
  }
}
