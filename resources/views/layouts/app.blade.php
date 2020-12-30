<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{{ config('app.name', 'Laravel') }}</title>
  <link rel="dns-prefetch" href="//fonts.gstatic.com">
  <link href="https://fonts.googleapis.com/css?family=Nunito+Sans:400,700,800&display=swap" rel="stylesheet">
  <link href="{{ asset('css/plugins.css') }}" rel="stylesheet">
  <link href="{{ asset('css/app.css') }}" rel="stylesheet">

  <link rel="shortcut icon" href="{{ asset('images/favicon.png') }}">

  <script type="text/javascript" src="https://www.bugherd.com/sidebarv2.js?apikey=5q6o6obenwiriayihlgpbw" async="true"></script>
</head>
<body>

  <div id="app"></div>

  <script src="https://js.stripe.com/v3/"></script>
  <script src="{{ asset('js/plugins.js') }}" defer></script>
  <script src="{{ asset('js/app.js') }}" defer></script>
</body>
</html>
