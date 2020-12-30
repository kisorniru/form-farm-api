<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddRequiredFieldToFieldTemplateTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('field_template', function (Blueprint $table) {
      $table->boolean('is_required')->default(false)->after('metadata');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::table('field_template', function (Blueprint $table) {
      $table->dropColumn('is_required');
    });
  }
}
