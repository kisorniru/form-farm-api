<?php
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
 *--------------------------------------------------------------------------
 * Web Routes
 *--------------------------------------------------------------------------
 *
 * Here is where you can register web routes for your application. These
 * routes are loaded by the RouteServiceProvider within a group which
 * contains the "web" middleware group. Now create something great!
 *
 */


Route::get('/', 'HomeController@index')->name('index');

Auth::routes(['verify' => true]);

// Templates Routes

Route::group([
  'prefix' => 'templates',
  'as' => 'templates.'
], function () {
  Route::get('/print', 'TemplateController@print')->name('print');
  Route::get('/csv', 'TemplateController@csv')->name('csv');
  Route::get('/json', 'TemplateController@json')->name('json');
  Route::get('/xml', 'TemplateController@xml')->name('xml');
  Route::get('/{template}/qr-code', 'TemplateController@qrCode')->name('qrcode');
});

// Documents Routes
Route::group([
  'prefix' => 'documents',
  'as' => 'documents.'
], function () {
  Route::get('/print', 'DocumentController@printMany')->name('multiple.print');
  Route::get('/{document}/download', 'DocumentController@download')->name('download');
  Route::get('/{document}/print', 'DocumentController@print')->name('print');
  Route::get('/csv', 'DocumentController@csvMany')->name('multiple.csv');
  Route::get('/{document}/csv', 'DocumentController@csv')->name('csv');
  Route::get('/json', 'DocumentController@jsonMany')->name('multiple.json');
  Route::get('/{document}/json/', 'DocumentController@json')->name('json');
  Route::get('/xml', 'DocumentController@xmlMany')->name('multiple.xml');
  Route::get('/{document}/xml', 'DocumentController@xml')->name('xml');
  Route::get('/{document}/qr-code', 'DocumentController@qrCode')->name('qrcode');
});

Route::group([
  'prefix'  => 'customers',
  'as'      => 'customers.'
], function () {
  Route::get('/{customer}/documents', 'CustomerController@documents')->name('export.documents');
});
