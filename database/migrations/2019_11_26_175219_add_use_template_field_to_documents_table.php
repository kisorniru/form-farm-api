<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddUseTemplateFieldToDocumentsTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('documents', function (Blueprint $table) {
      $table->boolean('use_template')->default(true)->after('customer_id');
      $table->text('content')->nullable()->after('status');

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
      $table->dropColumn(['use_template', 'content']);
    });
  }
}
