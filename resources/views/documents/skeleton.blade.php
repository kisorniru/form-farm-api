@extends('layouts.pdf')

@push('styles')
  <style>
    @page {
      margin: 136 32px;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 16px;
      font-weight: 400;
      line-height: 1.5;
    }

    .header-icon {
      position: fixed;
      top: -136px;
      left: 0px;
      right: 0px;
    }

    .footer-icon {
      position: fixed;
      bottom: -136px;
      left: 0px;
      right: 0px;
    }

    .header-icon,
    .footer-icon {
      display: block;
      height: 96px;
    }

    .header-icon .icon,
    .footer-icon .icon {
      width: auto;
      text-align: center;
    }

    .content {
      display: block;
      padding-left: 2rem;
      padding-right: 2rem;
      padding-bottom: 2rem;
    }

    .fields-block {
      padding: 1.5rem 2rem;
    }

    .field {
      width: 100%;
    }

    .field .label {
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.6;
      color: #212529;
      white-space: nowrap;
    }
    .field td.info {
      border-bottom: 1px solid #000;
      width: 100%;
    }

    .field .info span,
    .field .info pre {
      font-family: Arial, Helvetica, sans-serif !important;
    }

    .field .info.muted,
    .field .info.muted span,
    .field .info.muted p,
    .field .info.muted pre {
      border-bottom: none;
      font-family: Arial, Helvetica, sans-serif !important;
      color: #4e4e4e;
    }
  </style>
@endpush

@section('content')
  @if (isset($customer->header))
    <header class="header-icon">
      <div class="icon">
        <img src="{{ $customer->getHeaderURL() }}" height="96">
      </div>
    </header>
  @endif

  <div>
    @if (!empty($content))
    <div class="content">
      {!! $content !!}
    </div>
    @endif

    <div class="fields-block">
          @foreach ($fields as $index => $field)
                <table class="field">
                  <tr>
                    <td>
                      @if ($field->type != 'info')
                        <span class="label">{{ $field->name }}:</span>
                      @endif
                    </td>
                    @switch($field->type)
                      @case('calculation')
                        <td style="width: 100%">
                          @include('documents.calculation-table', [
                            'data' => json_decode($field->pivot->value)
                          ])
                        </td>
                        @break
                      @case('signature')
                        @if (!empty($field->pivot->value))
                          @php
                            try {
                              $path = preg_replace('/^public\//i', '', $field->pivot->value);
                              $url = asset('storage/' . $path);
                            } catch (\Exception $e) {
                              $url = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";
                            }
                          @endphp
                          <td class="info"><img src="{{ $url }}" alt="{{ $field->name }}" width="240"></td>
                        @endif
                        @break
                      @case('date')
                        @php
                          if (is_numeric($field->pivot->value)) {
                            $date = \Carbon\Carbon::createFromTimestamp($field->pivot->value);
                          } else {
                            $date = \Carbon\Carbon::parse($field->pivot->value);
                          }
                        @endphp
                        <td class="info"><span>{{ $date->format('F d, Y') }}</span></td>
                        @break
                      @case('text_area')
                        <td class="info"><pre>{!! $field->pivot->value !!}</pre></td>
                        @break
                      @case('info')
                        <td class="info muted">{!! isset($field->pivot->details) ? $field->pivot->details : $field->details !!}</td>
                        @break
                      @default
                      <td class="info"><span>{!! $field->pivot->value !!}</span></td>
                    @endswitch
                  </tr>
                </table>
          @endforeach
    </div>
  </div>

    @if (isset($customer->footer))
      <footer class="footer-icon">
        <div class="icon">
          <img src="{{ $customer->getFooterURL() }}" height="96">
        </div>
      </footer>
    @endif
@endsection

@if (isset($printable))
  @push('scripts')
    <script type="application/javascript">window.print()</script>
  @endpush
  @push('styles')
    <style>
      @media print {
        .header-icon img,
        .footer-icon img {
          margin: 0 auto;
        }

        .fields-block .field .info {
          -webkit-print-color-adjust: exact;
          min-height: auto;
        }
      }
    </style>
  @endpush
@endif
