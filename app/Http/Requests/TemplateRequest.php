<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class TemplateRequest extends FormRequest
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
        'description' => 'required',
      ];
    } else {
      $rules = [
        'name' => 'required',
      ];
    }

    return $rules;
  }
}
