<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ config('app.name', 'Laravel') }}</title>
  <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,700,800&display=swap" rel="stylesheet">
  <link href="{{ asset('css/print.css') }}" rel="stylesheet">
</head>
<body>
  <div class="container">
    @yield('content')
  </div>
  <script type="application/javascript">window.print()</script>
</body>
</html>
