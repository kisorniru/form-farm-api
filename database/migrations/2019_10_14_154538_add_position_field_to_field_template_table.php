<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddPositionFieldToFieldTemplateTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('field_template', function (Blueprint $table) {
      $table->integer('position')->nullable()->after('name');
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
      $table->dropColumn('position');
    });
  }
}
