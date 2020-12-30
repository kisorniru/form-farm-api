<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class FieldRequest extends FormRequest
{
  /**
   * Determine if the user is authorized to make this request.
   *
   * @return bool
   */
  public function authorize()
  {
    return true;
  }

  /**
   * Get the validation rules that apply to the request.
   *
   * @return array
   */
  public function rules()
  {
    if ($this->isMethod('post')) {
      $rules = [
        'name' => 'required',
        'slug' => 'required',
        'type' => 'required',
      ];
    } else {
      $rules = [
        'name' => 'required',
        'slug' => 'required',
        'type' => 'required',
      ];
    }
    return $rules;
  }
}
