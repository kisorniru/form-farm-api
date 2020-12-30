<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCustomerColumns extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('customers', function (Blueprint $table) {
      $table->string('stripe_id')->nullable()->index()->after('icon');
      $table->string('card_brand')->nullable()->after('stripe_id');
      $table->string('card_last_four', 4)->nullable()->after('card_brand');
      $table->timestamp('trial_ends_at')->nullable()->after('card_last_four');
      $table->unsignedBigInteger('owner_id')->nullable()->after('trial_ends_at');

      $table->foreign('owner_id')->references('id')->on('users');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::table('customers', function (Blueprint $table) {
      $table->dropForeign('customers_owner_id_foreign');
      $table->dropColumn([
        'stripe_id',
        'card_brand',
        'card_last_four',
        'trial_ends_at',
        'owner_id',
      ]);
    });
  }
}
