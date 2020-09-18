<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDocumentFieldTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('document_field', function (Blueprint $table) {
      $table->bigIncrements('id');
      $table->unsignedBigInteger('field_id');
      $table->unsignedBigInteger('document_id');
      $table->text('value')->nullable();
      $table->timestamps();

      $table->foreign('field_id')->references('id')->on('fields');
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
    Schema::dropIfExists('document_field');
  }
}
