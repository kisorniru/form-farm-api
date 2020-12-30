<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePlansTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::create('plans', function (Blueprint $table) {
      $table->bigIncrements('id');
      $table->string('name');
      $table->decimal('amount', 19, 2)->default(0);
      $table->string('interval')->nullable();
      $table->text('description')->nullable();
      $table->string('stripe_id')->nullable();
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
    Schema::dropIfExists('plans');
  }
}
