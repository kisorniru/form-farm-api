@extends('layouts.print')

@section('content')
  <h1>Templates</h1>
  <table class="table">
    <thead>
      <tr>
        <th>Name</th>
        <th>Fields</th>
        <th>Created</th>
        <th>Updated</th>
      </tr>
    </thead>
    <tbody>
      @foreach ($templates as $template)
        <tr>
          <td>{{ $template->name }}</td>
          <td>{{ $template->fields()->count() }}</td>
          <td>{{ $template->created_at->format('m/d/Y') }}</td>
          <td>{{ $template->updated_at->format('m/d/Y') }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>
@endsection
