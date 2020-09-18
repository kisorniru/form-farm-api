<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDocumentsTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('documents', function (Blueprint $table) {
      $table->bigIncrements('id');
      $table->string('name');
      $table->string('status')->default('draft');
      $table->string('preview')->nullable();
      $table->unsignedBigInteger('user_id');
      $table->unsignedBigInteger('template_id')->nullable();
      $table->timestamps();

      $table->foreign('user_id')->references('id')->on('users');
      $table->foreign('template_id')->references('id')->on('templates');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::dropIfExists('documents');
  }
}
