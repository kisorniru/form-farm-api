<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
 *--------------------------------------------------------------------------
 * API Routes
 *--------------------------------------------------------------------------
 *
 * Here is where you can register API routes for your application. These
 * routes are loaded by the RouteServiceProvider within a group which
 * is assigned the "api" middleware group. Enjoy building your API!
 *
 */


// API AUTH
Route::group([
  'prefix'  => 'auth',
  'as'      => 'auth.',
], function () {
  Route::post('/login', 'AuthController@login')->name('login');
  // Route::post('/register', 'AuthController@register')->name('register');
  Route::post('/logout', 'AuthController@logout')->name('logout');
  Route::post('/refresh', 'AuthController@refresh')->name('refresh');
  Route::get('/me', 'AuthController@me')->name('me');
  Route::post('/password', 'AuthController@password')->name('password');
});

// API Activity
Route::get('/activity', 'ActivityController@latest')->name('latest.activity');

// API Customers
Route::group([
  'prefix' => 'customers',
  'as' => 'customers.',
], function () {
  Route::get('/', 'CustomerController@index')->name('index');
  Route::get('/{customer}', 'CustomerController@show')->name('show');
  Route::get('/{customer}/subscriptions', 'CustomerController@subscriptions')->name('subscriptions');
  Route::get('/{customer}/intent', 'CustomerController@intent')->name('intent');
  Route::post('/', 'CustomerController@store')->name('store');
  Route::post('/{customer}/payment-method', 'CustomerController@addPaymentMethod')->name('addPaymentMethod');
  Route::post('/{customer}/subscribe', 'CustomerController@addSubscription')->name('addSubscription');
  Route::put('/{customer}', 'CustomerController@update')->name('update');
  Route::delete('/', 'CustomerController@destroyCustomers')->name('multiple.destroy');
  Route::delete('/{customer}', 'CustomerController@destroy')->name('destroy');
  Route::delete('/{customer}/payment-methods', 'CustomerController@deletePaymentMethods')->name('deletePaymentMethods');
  Route::delete('/{customer}/payment-method', 'CustomerController@deletePaymentMethod')->name('deletePaymentMethod');
});

// API Categories
Route::group([
  'prefix' => 'categories',
  'as' => 'categories.'
], function () {
  Route::get('/', 'CategoryController@index')->name('index');
  Route::get('/{category}', 'CategoryController@show')->name('show');
  Route::get('/{category}/fields', 'CategoryController@fields')->name('fields');
  Route::post('/', 'CategoryController@store')->name('store');
  Route::put('/{category}', 'CategoryController@update')->name('update');
  Route::delete('/{category}', 'CategoryController@destroy')->name('destroy');
});

// API Groups
Route::group([
  'prefix' => 'groups',
  'as' => 'groups.',
], function () {
  Route::get('/', 'GroupController@index')->name('index');
  Route::get('/{group}', 'GroupController@show')->name('show');
  Route::get('/{group}/roles', 'Groupcontroller@listRoles')->name('roles');
  Route::post('/', 'GroupController@store')->name('store');
  Route::post('/{group}/roles/{role}', 'GroupController@attachRole')->name('roles.attach');
  Route::put('/{group}', 'GroupController@update')->name('update');
  Route::delete('/{group}', 'GroupController@destroy')->name('destroy');
  Route::delete('/', 'GroupController@destroyGroups')->name('multiple.destroy');
  Route::delete('/{group}/roles/{role}', 'GroupController@detachRole')->name('roles.detach');
});

// API Users
Route::group([
  'prefix' => 'users',
  'as' => 'users.'
], function () {
  Route::get('/', 'UserController@index')->name('index');
  Route::get('/{user}', 'UserController@show')->name('show');
  Route::get('/{user}/roles', 'UserController@listRoles')->name('roles');
  Route::post('/', 'UserController@store')->name('store');
  Route::post('/{user}/toggle', 'UserController@toggleAdmin')->name('toggleAdmin');
  Route::post('/{user}/groups', 'UserController@attachGroups')->name('users.attachGroups');
  Route::post('/{user}/roles/{role}', 'UserController@attachRole')->name('roles.attach');
  Route::put('/{user}', 'UserController@update')->name('update');
  Route::delete('/{user}', 'UserController@destroy')->name('destroy');
  Route::delete('/', 'UserController@destroyUsers')->name('multiple.destroy');
  Route::delete('/{user}/groups', 'UserController@detachGroups')->name('users.detachGroups');
  Route::delete('/{user}/roles/{role}', 'UserController@detachRole')->name('roles.detach');
});

// API Templates
Route::group([
  'prefix' => 'templates',
  'as' => 'templates.'
], function () {
  Route::get('/', 'TemplateController@index')->name('index');
  Route::get('/{template}', 'TemplateController@show')->name('show');
  Route::get('/{template}/customers', 'TemplateController@customers')->name('customers');
  Route::get('/{template}/fields', 'TemplateController@fields')->name('fields');
  Route::get('/{template}/groups', 'TemplateController@groups')->name('groups');
  Route::get('/{template}/qrcode', 'TemplateController@qrCode')->name('qrcode');
  Route::get('/{template}/fields/{field}', 'TemplateController@field')->name('field');
  Route::post('/', 'TemplateController@store')->name('store');
  Route::post('/{template}/customers/{customer}', 'TemplateController@attachCustomer')->name('attach.customer');
  Route::post('/{template}/fields', 'TemplateController@attach')->name('attach');
  Route::post('/{template}/groups/{group}', 'TemplateController@attachGroup')->name('attach.group');
  Route::post('/{template}/duplicate', 'TemplateController@duplicate')->name('duplicate');
  Route::post('/{template}/attach-pdf-json-fields', 'TemplateController@attachPDFJsonFields')->name('attachPDFJsonFields');
  Route::post('/{template}/reorder_fields', 'TemplateController@reOrder')->name('reOrder');
  Route::put('/{template}', 'TemplateController@update')->name('update');
  Route::put('/{template}/fields/{field}', 'TemplateController@updateField')->name('updatefield');
  Route::delete('/', 'TemplateController@destroyTemplates')->name('multiple.destroy');
  Route::delete('/{template}', 'TemplateController@destroy')->name('destroy');
  Route::delete('/{template}/customers/{customer}', 'TemplateController@detachCustomer')->name('detach.customer');
  Route::delete('/{template}/fields', 'TemplateController@detach')->name('detach');
  Route::delete('/{template}/groups/{group}', 'TemplateController@detachGroup')->name('detach.group');
});

// API Fields
Route::group([
  'prefix' => 'fields',
  'as' => 'fields.',
], function () {
  Route::get('/', 'FieldController@index')->name('index');
  Route::get('/{field}', 'FieldController@show')->name('show');
  Route::post('/', 'FieldController@store')->name('store');
  Route::put('/{field}', 'FieldController@update')->name('update');
  Route::delete('/{field}', 'FieldController@destroy')->name('destroy');
});

// API documents
Route::group([
  'prefix'  => 'documents',
  'as'      => 'documents.',
], function () {
  Route::get('/', 'DocumentController@index')->name('index');
  Route::get('/{document}', 'DocumentController@show')->name('show');
  Route::get('/{document}/fields', 'DocumentController@fields')->name('fields');
  Route::get('/{document}/fields/{field}', 'DocumentController@getField')->name('field.show');
  Route::post('/', 'DocumentController@store')->name('store');
  Route::post('/{document}/send', 'DocumentController@send')->name('send');
  Route::post('/{document}/fields', 'DocumentController@attachField')->name('fields.attach');
  Route::post('/{document}/fields/sync', 'DocumentController@attachFields')->name('fields.multiple.attach');
  Route::post('/{document}/fields/updates', 'DocumentController@updateFields')->name('fields.multiple.update');
  Route::post('/{document}/attach-pdf-json-fields', 'DocumentController@attachPDFJsonFields')->name('attachPDFJsonFields');
  Route::post('/{document}/duplicate', 'DocumentController@duplicate')->name('duplicate');
  Route::post('/{document}/deliver', 'DocumentController@deliver')->name('deliver');
  Route::post('/{document}/preview', 'DocumentController@preview')->name('preview');
  Route::post('/{document}/fields/{field}/restore', 'DocumentController@restoreField')->name('fields.restore');
  Route::post('/{document}/reorder_fields', 'DocumentController@reOrder')->name('reOrder');
  Route::put('/{document}', 'DocumentController@update')->name('update');
  Route::put('/{document}/fields/{field}', 'DocumentController@updateField')->name('fields.update');
  Route::delete('/', 'DocumentController@destroyDocuments')->name('multiple.destroy');
  Route::delete('/{document}', 'DocumentController@destroy')->name('destroy');
  Route::delete('/{document}/fields/{field}', 'DocumentController@detachField')->name('fields.detach');
});

Route::get('/submissions', 'DocumentController@submissions')->name('submissions');

// API Plans
Route::group([
  'prefix'  => 'plans',
  'as'      => 'plans.',
], function() {
  Route::get('/', 'PlanController@index')->name('index');
  Route::get('/{plan}', 'PlanController@show')->name('show');
  Route::post('/', 'PlanController@store')->name('store');
  Route::put('/{plan}', 'PlanController@update')->name('update');
  Route::delete('/{plan}', 'PlanController@destroy')->name('destroy');
});

// API Roles
Route::group([
  'prefix' => 'roles',
  'as' => 'roles.'
], function() {
  Route::get('/', 'RoleController@index')->name('index');
  Route::get('/{role}', 'RoleController@show')->name('show');
  Route::post('/', 'RoleController@store')->name('store');
  Route::put('/{role}', 'RoleController@update')->name('update');
  Route::delete('/{role}', 'RoleController@destroy')->name('destroy');
  Route::delete('/', 'RoleController@destroyMany')->name('destroyMany');
});


Route::group([
  'prefix'  => 'services',
  'as'      => 'services.',
], function() {
  Route::post('/decoded_qrcodes', 'ServicesController@decoded_qrcodes')->name('decoded_qrcodes');
});
