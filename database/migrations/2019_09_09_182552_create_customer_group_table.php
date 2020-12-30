<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCustomerGroupTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('customer_group', function (Blueprint $table) {
      $table->bigIncrements('id');
      $table->unsignedBigInteger('customer_id');
      $table->unsignedBigInteger('group_id');
      $table->timestamps();

      $table->foreign('customer_id')->references('id')->on('customers');
      $table->foreign('group_id')->references('id')->on('groups');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::dropIfExists('customer_group');
  }
}
