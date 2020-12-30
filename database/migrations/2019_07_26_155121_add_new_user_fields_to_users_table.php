<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddNewUserFieldsToUsersTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('users', function (Blueprint $table) {
      $table->string('first_name')->nullable();
      $table->string('last_name')->nullable();
      $table->boolean('is_admin')->default(false);
      $table->string('company')->nullable();
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::table('users', function (Blueprint $table) {
      $table->dropColumn([
        'first_name',
        'last_name',
        'is_admin',
        'company'
      ]);
    });
  }
}
