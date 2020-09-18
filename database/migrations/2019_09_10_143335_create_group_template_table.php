<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateGroupTemplateTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('group_template', function (Blueprint $table) {
      $table->bigIncrements('id');
      $table->unsignedBigInteger('group_id');
      $table->unsignedBigInteger('template_id');
      $table->timestamps();

      $table->foreign('group_id')->references('id')->on('groups');
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
    Schema::dropIfExists('group_template');
  }
}
