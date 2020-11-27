@extends('layouts.pdf')

@push('styles')
  <style>
    @page {
      margin: 136 32px;
    }

    body {
      font-family: Arial, Helvetica, sans-serif;
      font-size: 14px;
      font-weight: 400;
      line-height: 1;
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
      text-align: left;
    }

    .document-title {
      font-size: 24px;
      font-weight: 400;
      text-align: center;
    }

    .calculation-title {
      font-size: 20px;
      font-weight: 400;
      text-align: center;
      margin-bottom: 32px;
    }

    .fields-table {
      width: 90%;
      margin: 0 auto;
    }

    .fields-table td {
      vertical-align: top;
    }
    .fields-table .field-column {
      width: 30%;
    }

    .field .label {
      font-size: 1rem;
      font-weight: 600;
      line-height: 1.5;
      color: #212529;
      white-space: nowrap;
    }
    .field td.info {
      width: 100%;
    }

    .field .info span,
    .field .info pre {
      font-family: Arial, Helvetica, sans-serif !important;
      font-size: 1rem;
      font-weight: 400;
      line-height: 1.5;
      white-space: wrap;
    }

    .field .info.muted,
    .field .info.muted span,
    .field .info.muted p,
    .field .info.muted pre {
      border-bottom: none;
      font-family: Arial, Helvetica, sans-serif !important;
      color: #4e4e4e;
      line-height: 1.5;
    }

    .calculation-table {
      border-collapse: collapse;
      width: 90%;
      margin: 0 auto;
    }

    .calculation-table tbody td.number {
      text-align: right;
    }

    .calculation-table tbody tr td {
      width: 30%;
      border-top: 1px solid #000;
      padding: 12px 0;
      vertical-align: top;
    }
  </style>
@endpush

@php
  $calculations = [];
  $normal = [];

  foreach( $fields as $field ) {
    if ($field->type == 'calculation') {
      $calculations[] = $field;
    } else {
      $normal[] = $field;
    }
  }
@endphp

@section('content')
  @if (isset($customer->header))
    <header class="header-icon">
      <div class="icon">
        <img src="{{ $customer->getHeaderURL() }}" height="96">
      </div>
    </header>
  @endif

  <div>
    <h1 class="document-title">{{ $title }}</h1>

    <table class="fields-table">
      <tbody>
        @php
          $counter = 0;
        @endphp
        @foreach ($normal as $key => $field)
          @php
            if ($counter == 3) {
              $counter = 1;
            } else {
              $counter = $counter + 1;
            }
          @endphp
          @if ($counter == 1)
            <tr>
          @endif

          <td class="field-column">
            <table class="field">
              <tbody>
                <tr>
                  <td vertical-align="top">
                    @if ($field->type != 'info' && $field->type != 'signature')
                      <span class="label">{{ isset($field->pivot->name) ? $field->pivot->name : $field->name }}:</span>
                    @endif
                  </td>
                  @switch($field->type)
                  @case('signature')

                  @break
                    @case('date')
                      @php
                        if (is_numeric($field->pivot->value)) {
                          $date = \Carbon\Carbon::createFromTimestamp($field->pivot->value);
                        } else {
                          $date = \Carbon\Carbon::parse($field->pivot->value);
                        }
                      @endphp
                      <td class="info" vertical-align="top"><span>{{ $date->format('F d, Y') }}</span></td>
                    @break
                    @case('text_area')
                      <td class="info" vertical-align="top"><pre>{!! $field->pivot->value !!}</pre></td>
                    @break
                    @case('info')
                      <td class="info muted" vertical-align="top">{!! isset($field->pivot->details) ? $field->pivot->details : $field->details !!}</td>
                    @break
                    @default
                    <td class="info" vertical-align="top"><span>{!! $field->pivot->value !!}</span></td>
                  @endswitch
                </tr>
              </tbody>
            </table>
          </td>

          @if ($counter == 3)
            </tr>
          @endif
        @endforeach
      </tbody>
    </table>

    @foreach ($calculations as $calculation)
      <table class="calculation-table">
        <thead>
          <tr>
            <th colspan="2">
              <h1 class="calculation-title">{{ isset($calculation->pivot->name) ? $calculation->pivot->name : $calculation->name }}</h1>
            </th>
          </tr>
        </thead>
        <tbody>
          @php
            $data = json_decode($calculation->pivot->value);
          @endphp
          @if (isset($data->items))
            @foreach ($data->items as $item)
              <tr>
                <td class="description">{{ $item->description }}&nbsp;({{ $item->quantity }}&nbsp;x&nbsp;${{ number_format($item->price, 2) }})</td>
                <td class="number">${{ number_format($item->total, 2) }}</td>
              </tr>
            @endforeach

            <tr class="no-border">
              <td></td>
              <td class="number">
                <b>Total:&nbsp;&nbsp;</b><span>${{ isset($data->total) ? number_format($data->total, 2) : "0.00" }}</span>
              </td>
            </tr>
          @endif
        </tbody>
      </table>
    @endforeach
  </div>



  <table class="fields-table">
      <tbody>
        @php
          $counter = 0;
        @endphp
        @foreach ($normal as $key => $field)
          @php
            if ($counter == 3) {
              $counter = 1;
            } else {
              $counter = $counter + 1;
            }
          @endphp
          @if ($counter == 1)
            <tr>
          @endif

          <td class="field-column">
            <table class="field">
              <tbody>
                <tr>
                  
                  @switch($field->type)
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
                        <td class="info" vertical-align="top"><img src="{{ $url }}" alt="{{ $field->name }}" width="240"></td>
                      @endif
                    @break
                    
                    @default

                  @endswitch
                </tr>
              </tbody>
            </table>
          </td>

          @if ($counter == 3)
            </tr>
          @endif
        @endforeach
      </tbody>
    </table>


  <footer class="footer-icon">
    <script type="text/php">
      if (isset($pdf)) {
        $x = 250;
        $y = 750;
        $text = "Page {PAGE_NUM} of {PAGE_COUNT}";
        $font = null;
        $size = 12;
        $color = array(0,0,0);
        $word_space = 0.0;  //  default
        $char_space = 0.0;  //  default
        $angle = 0.0;   //  default
        $pdf->page_text($x, $y, $text, $font, $size, $color, $word_space, $char_space, $angle);
      }
    </script>
    <span id="pageFooter"></span>
    @if (false && isset($customer->footer))
      <div class="icon">
        <img src="{{ $customer->getFooterURL() }}" height="96">
      </div>
    @endif
  </footer>
@endsection

@if (isset($printable))
  @push('scripts')
    <script type="application/javascript">window.print()</script>
  @endpush

  @push('styles')
    <style>
      @media print {
        .header-icon,
        .footer-icon {
          position: unset;
        }

        .header-icon img,
        .footer-icon img {
          margin: 0 auto 0 0;
        }

        .fields-block .field .info {
          -webkit-print-color-adjust: exact;
          min-height: auto;
        }
      }

      #pageFooter:after {
        counter-increment: page;
        content:"Page " counter(page);
        position: fixed;
        left: calc(50% - 50px);
        bottom: 24px;
        white-space: nowrap;
        z-index: 20;
      }
    </style>
  @endpush
@endif
