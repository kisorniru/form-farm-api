<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPdfIdFieldToDocumentsTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('documents', function (Blueprint $table) {
      $table->string('pdf_id')->after('type')->default('documents.pdf.table_columns');
      $table->string('original_name')->after('name')->nullable();
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::table('documents', function (Blueprint $table) {
      $table->dropColumn(['pdf_id', 'original_name']);
    });
  }
}
