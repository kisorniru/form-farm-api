<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCustomerIdToGroupsTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('groups', function (Blueprint $table) {
      $table->unsignedBigInteger('customer_id')->nullable()->after('description');
      $table->foreign('customer_id')->references('id')->on('customers');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::table('groups', function (Blueprint $table) {
      $table->dropForeign('groups_customer_id_foreign');
      $table->dropColumn('customer_id');
    });
  }
}
