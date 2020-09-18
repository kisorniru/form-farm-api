<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFieldTemplateTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('field_template', function (Blueprint $table) {
      $table->bigIncrements('id');
      $table->unsignedBigInteger('field_id');
      $table->unsignedBigInteger('template_id');
      $table->string('name')->nullable();
      $table->text('details')->nullable();
      $table->text('placeholder')->nullable();
      $table->text('metadata')->nullable();
      $table->timestamps();

      $table->foreign('field_id')->references('id')->on('fields');
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
    Schema::dropIfExists('field_template');
  }
}
