@extends('layouts.pdf')

@section('content')
  <h1 style="text-align: center;">{{ $template->name }}</h1>

  <br>

  <img src="{{ $template->getQRweb() }}" alt="{{ $template->name }} Qr Code">
@endsection
