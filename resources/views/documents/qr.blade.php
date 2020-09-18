@extends('layouts.pdf')

@section('content')
  <h1 style="text-align: center;">{{ $document->name }}</h1>

  <br>

  <img src="{{ $document->getQRweb() }}" alt="{{ $document->name }} Qr Code">
@endsection
