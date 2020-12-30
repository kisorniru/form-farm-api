<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateReceiversTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('receivers', function (Blueprint $table) {
      $table->bigIncrements('id');
      $table->string('email');
      $table->string('status')->default('pending');
      $table->datetime('sent_on')->nullable();
      $table->unsignedBigInteger('document_id');
      $table->timestamps();

      $table->foreign('document_id')->references('id')->on('documents');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::dropIfExists('receivers');
  }
}
