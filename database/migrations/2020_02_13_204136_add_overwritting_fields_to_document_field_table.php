<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddOverwrittingFieldsToDocumentFieldTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('document_field', function (Blueprint $table) {
      $table->string('name')->nullable()->after('value');
      $table->integer('position')->nullable()->after('name');
      $table->text('details')->nullable()->after('position');
      $table->text('placeholder')->nullable()->after('details');
      $table->text('metadata')->nullable()->after('placeholder');
      $table->text('is_required')->nullable()->after('metadata');
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
      $table->dropColumn([
        'name',
        'position',
        'details',
        'placeholder',
        'metadata',
        'is_required',
      ]);
    });
  }
}
