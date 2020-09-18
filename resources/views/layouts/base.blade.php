<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ config('app.name', 'Laravel') }}</title>
  <link rel="dns-prefetch" href="//fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,700,800&display=swap" rel="stylesheet">
  <link href="{{ asset('css/plugins.css') }}" rel="stylesheet">

  <link rel="shortcut icon" href="{{ asset('images/favicon.png') }}">

  @stack('styles')
</head>
<body>

  @yield('content')

  <script src="{{ asset('js/plugins.js') }}" defer></script>
  @stack('scripts')
</body>
</html>
