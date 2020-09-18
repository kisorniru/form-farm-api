<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSubmitterIdToReceiversTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('receivers', function (Blueprint $table) {
      $table->unsignedBigInteger('submitter_id')->nullable()->after('document_id');
      $table->foreign('submitter_id')->references('id')->on('users');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::table('receivers', function (Blueprint $table) {
      $table->dropForeign('receivers_submitter_id_foreign');
    });
  }
}
