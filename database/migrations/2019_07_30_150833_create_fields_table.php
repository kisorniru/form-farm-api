<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFieldsTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('fields', function (Blueprint $table) {
      $table->bigIncrements('id');
      $table->string('name');
      $table->string('slug');
      $table->string('type');
      $table->text('details')->nullable();
      $table->text('placeholder')->nullable();
      $table->text('metadata')->nullable();
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
    Schema::dropIfExists('fields');
  }
}
