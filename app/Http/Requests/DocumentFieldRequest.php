<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class DocumentFieldRequest extends FormRequest
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
      return [
        'field' => 'required|exists:fields,id',
        // 'value' => 'required'
      ];
    }

    if ($this->isMethod('put')) {
      return [
        // 'value' => 'required'
      ];
    }
  }

  public function messages ()
  {
    return [
      'field.required' => 'This field is required',
      'field.exists' => 'This field is is not valid',
      'value.required'  => 'The field value is required',
  ];
  }
}
