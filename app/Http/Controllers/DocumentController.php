<?php

namespace App\Http\Controllers;

use App\Document;
use App\Exports\DocumentsExport;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Spatie\ArrayToXml\ArrayToXml;
use Symfony\Component\HttpFoundation\Response;
use Barryvdh\DomPDF\Facade as PDF;
use Maatwebsite\Excel\Excel;

class DocumentController extends Controller
{
  public function __construct ()
  {
  }

  /**
   * Print a document (PDF Document)
   *
   * @param \App\Document $document
   * @param \Http\Http\Request $request
   * @return \Illuminate\View\View
   */
  public function print (Document $document, Request $request): View
  {
    return view($document->getPdfTemplate(), [
      'title' => $document->original_name ? $document->original_name : $document->name,
      'content' => $this->updateDocumentPreview($document),
      'customer' => $document->customer,
      'fields' => $document->fields()->wherePivot('disabled', false)->orderBy('document_field.position', 'asc')->get(),
      'printable' => true,
    ]);
  }

  /**
   * Print a document (PDF Document)
   *
   * @param \App\Document $document
   * @param \Http\Http\Request $request
   * @return \Symfony\Component\HttpFoundation\Response
   */
  public function download (Document $document, Request $request): Response
  {
    if (empty($document->preview)) {
      return response()->view('errors.404');
    }

    return redirect($document->getPreviewURL());
  }

  /**
   * Print a list of documents
   *
   * @param \Http\Http\Request $request
   * @return \Illuminate\View\View
   */
  public function printMany (Request $request) : View
  {
    $ids = $request->input('documents');
    if ($ids != 'all' && !empty($ids)) {
      $ids = explode(',', $ids);
      $documents = Document::whereIn('id', $ids)->get();
    } else {
      $documents = Document::all();
    }

    $data = [
      'documents' => $documents
    ];

    return view('documents.print', $data);
  }

  /**
   * Export a json file with the document info
   *
   * @param \App\Document $document
   * @param \Http\Http\Request $request
   * @return \Symfony\Component\HttpFoundation\Response
   */
  public function json(Document $document, Request $request): Response
  {
    $data = $this->parseDocument($document);
    return response()->json($data)
      ->header('Content-Type', 'text/json')
      ->header('Content-Disposition', "attachment; filename=" . $document->name . ".json");
  }

  /**
   * Return a json file
   *
   * @param \Http\Http\Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function jsonMany (Request $request) : JsonResponse
  {
    $ids = $request->input('documents');

    if ($ids != 'all' && !empty($ids)) {
      $ids = explode(',', $ids);
      $documents = $this->parseDocuments(Document::whereIn('id', $ids)->get());
    } else {
      $documents = $this->parseDocuments(Document::all());
    }

    return response()->json($documents);
  }

  /**
   * Return an XML file
   *
   * @param \App\Document $document
   * @param \Http\Http\Request $request
   * @return \Symfony\Component\HttpFoundation\Response
   */
  public function xml(Document $document, Request $request): Response
  {
    $xmlArray = [];
    $xmlArray['document_' . ($document->id)] = [
      '_attributes' => [
        'id' => $document->id,
      ],
      'name' => $document->name,
      'fields' => [],
    ];

    foreach ($document->fields as $fkey => $field) {
      $xmlArray['document_' . ($document->id)]['fields']['field_'.($fkey + 1)] = [
        '_attributes' => [
          'id' => $field->id,
          'position' => $field->position,
          'type' => $field->type,
        ],
        'name' => $field->name,
        'slug' => $field->slug,
        'details' => $field->details,
        'placeholder' => $field->placeholder,
        'value' => $field->pivot->value,
      ];

      if (!empty($field['metadata'])) {
        if (isset($field['metadata']->options)) {
          foreach ($field['metadata']->options as $optKey => $option) {
            $xmlArray['document_'.($document->id + 1)]['fields']['field_'.($fkey + 1)]['metatada']['options']['option_' . ($optKey + 1)] = [
              '_attributes' => ['id' => $option->id],
              '_value' => $option->label,
            ];
          }
        }
      }
    }

    $result = ArrayToXml::convert($xmlArray, 'document');
    return response($result, 200)
    ->header('Content-Type', 'application/xml')
    ->header('Content-Disposition', "attachment; filename=" . $document->name . ".xml");
  }

  /**
   * Return an XML file
   *
   * @param \Illuminate\Http\Request $request
   * @return \Symfony\Component\HttpFoundation\Response
   */
  public function xmlMany (Request $request) : Response
  {
    $ids = $request->input('documents');

    if ($ids != 'all' && !empty($ids)) {
      $ids = explode(',', $ids);
      $documents = $this->parseDocuments(Document::whereIn('id', $ids)->get());
    } else {
      $documents = $this->parseDocuments(Document::all());
    }

    $xmlArray = [];
    foreach ($documents as $key => $document) {
      $xmlArray['document_' . ($key + 1)] = [
        '_attributes' => [
          'id' => $document['id'],
          // 'group' => $document['group'],
        ],
        'name' => $document['name'],
        'fields' => [],
      ];

      foreach ($document['fields'] as $fkey => $field) {
        $xmlArray['document_' . ($key + 1)]['fields']['field_'.($fkey + 1)] = [
          '_attributes' => [
            'id' => $field['id'],
            'position' => $field['position'],
            'type' => $field['type'],
          ],
          'name' => $field['name'],
          'slug' => $field['slug'],
          'details' => $field['details'],
          'placeholder' => $field['placeholder'],
          'value' => $field['value'],
        ];

        if (!empty($field['metadata'])) {
          if (isset($field['metadata']->options)) {
            foreach ($field['metadata']->options as $optKey => $option) {
              $xmlArray['document_'.($key + 1)]['fields']['field_'.($fkey + 1)]['metatada']['options']['option_' . ($optKey + 1)] = [
                '_attributes' => ['id' => $option->id],
                '_value' => $option->label,
              ];
            }
          }
        }
      }
    }

    $result = ArrayToXml::convert($xmlArray, 'documents');
    return response($result, 200)->header('Content-Type', 'application/xml');
  }

  /**
   * Return an CSV file
   *
   * @param \App\Document $document
   * @param \Http\Http\Request $request
   */
  public function csv(Document $document, Request $request)
  {
    $data = [];
    $data[] = $this->buildDocumentCSVHeader($document);
    $data[] = $this->buildDocumentCSVBody($document);

    return (new DocumentsExport($data))->download($document->name . '.csv', Excel::CSV, [
      'Content-Type' => 'text/csv',
    ]);
  }

  /**
   * Return a CSV File
   *
   * @param \Illuminate\Http\Request $request
   */
  public function csvMany (Request $request)
  {
    $data = [];
    $ids = $request->input('documents');

    if ($ids != 'all' && !empty($ids)) {
      $ids = explode(',', $ids);
      $documents = Document::whereIn('id', $ids)->get();
    } else {
      $documents = Document::all();
    }

    $data[] = ['id', 'name', /* 'group', */ 'fields', 'created', 'updated' ];
    foreach ($documents as $document) {
      $data[] = [
        'id' => $document->id,
        'name' => $document->name,
        // 'group' => $document->group->name,
        'fields' => $document->fields()->count(),
        'created' => Carbon::parse($document->created_at)->format('m/d/Y'),
        'updated' => Carbon::parse($document->updated_at)->format('m/d/Y')
      ];
    }

    return (new DocumentsExport($data))->download('documents.csv', Excel::CSV, [
      'Content-Type' => 'text/csv',
    ]);
  }

  /**
   * Return a PDF with the QR Code
   *
   * @param \App\Document $document
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\Response
   */
  public function qrCode(Document $document, Request $request)
  {
    libxml_use_internal_errors(true);
    $pdf = PDF::loadView('documents.qr', ['document' => $document]);
    return $pdf->download('qr_code.pdf');
  }

  /**
   * Prepare the Documents in an Array
   *
   * @param array $documents
   * @return array
   */
  private function parseDocuments ($documents) : array
  {
    $data = [];

    foreach ($documents as $document) {
      $data[] = $this->parseDocument($document);
    }

    return $data;
  }

  /**
   * Prepare a document
   *
   * @param \App\Document $document
   * @return array
   */
  private function parseDocument($document): array
  {
    $fields = [];

    foreach ($document->fields as $field) {
      $fields[$field->name] = $field->pivot->value;
      // $fields[] = [
      //   'id' => $field->id,
      //   'position' => $field->position,
      //   'name' => $field->name,
      //   'slug' => $field->slug,
      //   'type' => $field->type,
      //   'details' => $field->details,
      //   'placeholder' => $field->placeholder,
      //   'value' => $field->pivot->value,
      //   'metadata' => json_decode($field->metadata),
      // ];
    }

    return [
      'id' => $document->id,
      'name' => $document->name,
      'preview_url' => ($document->preview) ? url($document->getPreviewURL()) : '',
      'created' => Carbon::parse($document->created_at)->format('c'),
      'updated' => Carbon::parse($document->updated_at)->format('c'),
      'fields' => $fields,
    ];
  }

  /**
   * Build CSV Header for Single Document
   *
   * @param \App\Document $document
   * @return array
   */
  private function buildDocumentCSVHeader($document): array
  {
    $headers = [
      'Document Name',
      'status',
      'Preview URL',
    ];

    foreach ($document->fields as $field) {
      $headers[] = $field->name;
    }

    return $headers;
  }

  /**
   * Build CSV Body for Single Document
   *
   * @param \App\Document $document
   * @return array
   */
  private function buildDocumentCSVBody($document): array
  {
    $body = [
      $document->name,
      $document->status,
      $document->getPreviewURL(),
    ];

    foreach ($document->fields as $field) {
      $body[] = $field->pivot->value;
    }

    return $body;
  }

  /**
   * Prepare the document to be printed
   *
   * @param \App\Document $document
   * @return string
   */
  private function updateDocumentPreview (Document $document) : string
  {
    if (!$document->use_template && $document->type == 'content') {
      return $this->replaceFields(is_null($document->content) ? '' : $document->content, $document);
    }

    $template = $document->template;
    if ($document->use_template && $template->type == 'content') {
      return $this->replaceFields(is_null($template->content) ? '' : $template->content, $document);
    }

    return '';
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
            $path = preg_replace('/^public\//i', '', $value);
            $url = asset('storage/' . $path);
          } else {
            $url = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=';
          }
          return str_replace($match, '<img src="' . $url . '" width="240">', $string);
        case 'date':
          $date = \Carbon\Carbon::createFromTimestamp($value);
          return str_replace($match, $date->format('F d, Y'), $string);
        default:
          return str_replace($match, $value, $string);
      }
    }

    return str_replace($match, '{' . $slug . '}', $string);
  }
}
