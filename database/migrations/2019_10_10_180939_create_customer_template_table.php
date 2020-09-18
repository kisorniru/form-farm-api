<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCustomerTemplateTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('customer_template', function (Blueprint $table) {
      $table->bigIncrements('id');
      $table->unsignedBigInteger('customer_id');
      $table->unsignedBigInteger('template_id');
      $table->timestamps();

      $table->foreign('customer_id')->references('id')->on('customers');
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
    Schema::dropIfExists('customer_template');
  }
}
