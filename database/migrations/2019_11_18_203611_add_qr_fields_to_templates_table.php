<?php

use Illuminate\Support\Facades\Schema;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddQrFieldsToTemplatesTable extends Migration
{
  /**
   * Run the migrations.
   *
   * @return void
   */
  public function up()
  {
    Schema::table('templates', function (Blueprint $table) {
      $table->text('qr_web')->nullable()->after('message');
      $table->text('qr_app')->nullable()->after('qr_web');
    });
  }

  /**
   * Reverse the migrations.
   *
   * @return void
   */
  public function down()
  {
    Schema::table('templates', function (Blueprint $table) {
      $table->dropColumn([
        'qr_web',
        'qr_app'
      ]);
    });
  }
}
