<?php

namespace App\Http\Controllers;

use App\Exports\TemplatesExport;
use App\Template;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\View\View;
use Spatie\ArrayToXml\ArrayToXml;
use Symfony\Component\HttpFoundation\Response;
use Barryvdh\DomPDF\Facade as PDF;
use Maatwebsite\Excel\Excel;

class TemplateController extends Controller
{
  public function __construct ()
  {
  }

  /**
   * Print a list of templates
   *
   * @param \Http\Http\Request $request
   * @return \Illuminate\View\View
   */
  public function print (Request $request) : View
  {
    $ids = $request->input('templates');
    if ($ids != 'all' && !empty($ids)) {
      $ids = explode(',', $ids);
      $templates = Template::whereIn('id', $ids)->get();
    } else {
      $templates = Template::all();
    }

    $data = [
      'templates' => $templates
    ];

    return view('templates.print', $data);
  }

  /**
   * Return a json file
   *
   * @param \Http\Http\Request $request
   * @return \Illuminate\Http\JsonResponse
   */
  public function json (Request $request) : JsonResponse
  {
    $ids = $request->input('templates');

    if ($ids != 'all' && !empty($ids)) {
      $ids = explode(',', $ids);
      $templates = $this->parseTemplates(Template::whereIn('id', $ids)->get());
    } else {
      $templates = $this->parseTemplates(Template::all());
    }

    return response()->json($templates);
  }

  /**
   * Return an XML file
   *
   * @param \Illuminate\Http\Request $request
   * @return \Symfony\Component\HttpFoundation\Response
   */
  public function xml (Request $request) : Response
  {
    $ids = $request->input('templates');

    if ($ids != 'all' && !empty($ids)) {
      $ids = explode(',', $ids);
      $templates = $this->parseTemplates(Template::whereIn('id', $ids)->get());
    } else {
      $templates = $this->parseTemplates(Template::all());
    }

    $xmlArray = [];
    foreach ($templates as $key => $template) {
      $xmlArray['template_' . ($key + 1)] = [
        '_attributes' => [
          'id' => $template['id'],
          // 'group' => $template['group'],
        ],
        'name' => $template['name'],
        'content' => [
          '_cdata' => $template['content'],
        ],
        'fields' => [],
      ];

      foreach ($template['fields'] as $fkey => $field) {
        $xmlArray['template_' . ($key + 1)]['fields']['field_'.($fkey + 1)] = [
          '_attributes' => [
            'id' => $field['id'],
            'position' => $field['position'],
            'type' => $field['type'],
          ],
          'name' => $field['name'],
          'slug' => $field['slug'],
          'details' => $field['details'],
          'placeholder' => $field['placeholder'],
        ];

        if (!empty($field['metadata'])) {
          foreach ($field['metadata']->options as $optKey => $option) {
            $xmlArray['template_'.($key + 1)]['fields']['field_'.($fkey + 1)]['metatada']['options']['option_' . ($optKey + 1)] = [
              '_attributes' => ['id' => $option->id],
              '_value' => $option->label,
            ];
          }
        }
      }
    }

    $result = ArrayToXml::convert($xmlArray, 'templates');
    return response($result, 200)->header('Content-Type', 'application/xml');
  }

  /**
   * Return a CSV File
   *
   * @param \Illuminate\Http\Request $request
   */
  public function csv (Request $request)
  {
    $ids = $request->input('templates');
    $data = [];

    if ($ids != 'all' && !empty($ids)) {
      $ids = explode(',', $ids);
      $templates = Template::whereIn('id', $ids)->get();
    } else {
      $templates = Template::all();
    }

    $data[] = ['id', 'name', /* 'groups', */ 'fields', 'created', 'updated'];
    foreach ($templates as $template) {
      $data[] = [
        'id' => $template->id,
        'name' => $template->name,
        // 'group' => $template->group->name,
        'fields' => $template->fields()->count(),
        'created' => Carbon::parse($template->created_at)->format('m/d/Y'),
        'updated' => Carbon::parse($template->updated_at)->format('m/d/Y')
      ];
    }

    return (new TemplatesExport($data))->download('templates.csv', Excel::CSV, [
      'Content-Type' => 'text/csv'
    ]);
  }

  /**
   * Return a PDF with the QR Code
   *
   * @param \App\Template $template
   * @param \Illuminate\Http\Request $request
   * @return \Illuminate\Http\Response
   */
  public function qrCode(Template $template, Request $request)
  {
    libxml_use_internal_errors(true);
    $pdf = PDF::loadView('templates.qr', ['template' => $template]);
    return $pdf->download('qr_code.pdf');
  }

  /**
   * Prepare the Templates in an Array
   *
   * @param array $templates
   * @return array
   */
  private function parseTemplates ($templates) : array
  {
    $data = [];

    foreach ($templates as $template) {
      $fields = [];

      foreach ($template->fields as $field) {
        $fields[] = [
          'id' => $field->id,
          'position' => $field->position,
          'name' => $field->name,
          'slug' => $field->slug,
          'type' => $field->type,
          'details' => $field->details,
          'placeholder' => $field->placeholder,
          'metadata' => json_decode($field->metadata),
        ];
      }

      $data[] = [
        'id' => $template->id,
        'name' => $template->name,
        'content' => $template->content,
        // 'group' => $template->group->name,
        'fields' => $fields,
        'created' => Carbon::parse($template->created_at)->format('m/d/Y'),
        'updated' => Carbon::parse($template->updated_at)->format('m/d/Y'),
      ];
    }

    return $data;
  }
}
