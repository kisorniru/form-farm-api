<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddExportationFieldsToDocumentFieldTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('document_field', function (Blueprint $table) {
      $table->string('is_exportable')->default(true)->after('disabled');
      $table->string('exportable_name')->nullable()->after('name');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::table('document_field', function (Blueprint $table) {
      $table->dropColumn([ 'is_exportable', 'exportable_name' ]);
    });
  }
}
