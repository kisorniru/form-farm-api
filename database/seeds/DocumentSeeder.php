<?php

use App\Customer;
use App\Document;
use App\Field;
use App\Template;
use Faker\Factory;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use SimpleSoftwareIO\QrCode\Facades\QrCode;

class DocumentSeeder extends Seeder
{
  /**
   * Run the database seeds.
   *
   * @return void
   */
  public function run()
  {
    libxml_use_internal_errors(true);

    factory(Document::class)
      ->times(10)
      ->make()
      ->each(function ($document) {
        $faker = Factory::create();
        $template = Template::inRandomOrder()->first();
        $customer = Customer::inRandomOrder()->first();
        $fields = [];

        if ($document->use_template) {
          $document->template()->associate($template);
          $fields = $template->fields;
        } else {
          $fields = Field::where('type', '!=', 'signature')->take(rand(3, 10))->get();
        }

        $document->customer()->associate($customer);
        $document->save();

        foreach ($fields as $field) {
          $value = '';

          switch ($field->type) {
            case 'text_field':
            case 'text_password':
            // case 'signature':
            case 'location':
              $value = $faker->name();
              break;
            case 'text_number':
              $value = $faker->randomDigit;
              break;
            case 'text_email':
              $value = $faker->safeEmail;
              break;
            case 'text_tel':
              $value = $faker->tollFreePhoneNumber;
              break;
            case 'text_area':
            case 'info':
              $value = $faker->realText();
              break;
            case 'date':
              $value = $faker->dateTimeBetween('-2 years', 'now')->format('m/d/Y');
              break;
            default:
              $value = $faker->words(rand(1, 5), true);
              break;
          }

          $document->fields()->attach($field, [
            'value' => $value
          ]);
        }

        $path = storage_path('app/public/documents/' . $document->id);
        File::makeDirectory($path, 0777, true, true);
        $fileName = 'documents/' . $document->id . '/' . Str::random(32) . '.pdf';
        $document->preview = 'public/' . $fileName;
        if ($document->use_template) {
          Storage::disk('public')->copy(preg_replace('/^public\//i', '', $template->pdf_path), $fileName);
        } else {
          $pdf = App::make('dompdf.wrapper');
          $pdf->loadView('documents.skeleton', [ 'content' => $template->content, 'customer' => $document->customer, 'fields' => $document->fields ]);
          Storage::disk('public')->put($fileName, $pdf->download()->getOriginalContent());
        }

        $url = config('app.url') . '/#/dashboard/documents/' . $document->id . '/edit';
        $id = Crypt::encrypt($document->id);
        $qrWName = 'public/documents/' . $document->id . '/qrw-' . Str::random(24) . '.png';
        $qrAName = 'public/documents/' . $document->id . '/qra-' . Str::random(24) . '.png';
        $qrWeb = storage_path('app/' . $qrWName);
        $qrApp = storage_path('app/' . $qrAName);

        QrCode::format('png')->size(480)->generate($url, $qrWeb);
        QrCode::format('png')->size(480)->generate($id, $qrApp);

        $template->qr_web = $qrWName;
        $template->qr_app = $qrAName;

        $document->save();
      });
  }
}
