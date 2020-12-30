<?php

use App\Field;
use App\Template;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class TemplateSeeder extends Seeder
{
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {
    libxml_use_internal_errors(true);

    factory(Template::class)
      ->times(5)
      ->make()
      ->each(function ($template) {
        $fields = Field::take(rand(3, 10))->get();
        $template->save();

        $template->customers()->attach(1);
        $template->groups()->attach(1);

        foreach ($fields as $key => $field) {
          $template->fields()->attach($field, [
            'name' => $field->name,
            'details' => $field->details,
            'placeholder' => $field->placeholder,
            'metadata' => $field->metadata,
            'is_required' => $field->is_required,
            'position' => $key + 1,
          ]);
        }

        $pdf = App::make('dompdf.wrapper');
        $pdf->loadView('templates.skeleton', [ 'template' => $template ]);
        Storage::disk('public')->put('templates/' . $template->id . '/default.pdf', $pdf->download()->getOriginalContent());

        $url = config('app.url') . '/#/dashboard/templates/' . $template->id . '/edit';
        $id = $template->id;
        $qrWName = 'public/templates/' . $template->id . '/qrw-' . Str::random(24) . '.png';
        $qrAName = 'public/templates/' . $template->id . '/qra-' . Str::random(24) . '.png';
        $qrWeb = storage_path('app/' . $qrWName);
        $qrApp = storage_path('app/' . $qrAName);

        QrCode::format('png')->size(480)->generate($url, $qrWeb);
        QrCode::format('png')->size(480)->generate($id, $qrApp);

        $template->qr_web = $qrWName;
        $template->qr_app = $qrAName;
        $template->pdf_path = 'public/templates/' . $template->id . '/default.pdf';
        $template->preview_updated_at = Carbon::now();
        $template->save();
      });
  }
}
