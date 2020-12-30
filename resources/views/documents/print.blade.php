@extends('layouts.print')

@section('content')
  <h1>Documents</h1>
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
      @foreach ($documents as $document)
        <tr>
          <td>{{ $document->name }}</td>
          <td>{{ $document->fields()->count() }}</td>
          <td>{{ $document->created_at->format('m/d/Y') }}</td>
          <td>{{ $document->updated_at->format('m/d/Y') }}</td>
        </tr>
      @endforeach
    </tbody>
  </table>
@endsection
