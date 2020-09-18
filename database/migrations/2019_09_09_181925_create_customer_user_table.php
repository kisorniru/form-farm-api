<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCustomerUserTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('customer_user', function (Blueprint $table) {
      $table->bigIncrements('id');
      $table->unsignedBigInteger('customer_id');
      $table->unsignedBigInteger('user_id');
      $table->timestamps();

      $table->foreign('customer_id')->references('id')->on('customers');
      $table->foreign('user_id')->references('id')->on('users');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::dropIfExists('customer_user');
  }
}
