<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCategoryFieldTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('category_field', function (Blueprint $table) {
      $table->bigIncrements('id');
      $table->unsignedBigInteger('category_id');
      $table->unsignedBigInteger('field_id');
      $table->timestamps();

      $table->foreign('category_id')->references('id')->on('categories');
      $table->foreign('field_id')->references('id')->on('fields');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::dropIfExists('category_field');
  }
}
