<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTemplatesTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('templates', function (Blueprint $table) {
      $table->bigIncrements('id');
      $table->string('name');
      $table->text('description')->nullable();
      $table->string('status')->default('draft');
      $table->string('type')->default('content');
      $table->text('content')->nullable();
      $table->text('message')->nullable();
      $table->string('pdf_path')->nullable();
      $table->dateTime('preview_updated_at')->nullable();
      $table->timestamps();
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::dropIfExists('templates');
  }
}
