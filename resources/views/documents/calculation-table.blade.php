<div class="calculation-field">
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Quantity</th>
        <th>Unit Price</th>
        <th>Price</th>
      </tr>
    </thead>
    <tbody>
      @if (isset($data->items))
      @foreach ($data->items as $item)
        <tr>
          <td class="description">{{ $item->description }}</td>
          <td class="number">{{ $item->quantity }}</td>
          <td class="number">{{ $item->price }}</td>
          <td class="number">{{ $item->total }}</td>
        </tr>
      @endforeach
        <tr class="no-border">
          <td></td>
          <td></td>
          <td></td>
          <td class="number border">
            <span>Subtotal:</span><span>{{ isset($data->subtotal) ? $data->subtotal : "0.00" }}</span>
            <br>
            <b>Amount due:</b><span>{{ isset($data->total) ? $data->total : "0.00" }}</span>
          </td>
        </tr>
      @endif
    </tbody>
  </table>
</div>

@push('styles')
  <style>
    .calculation-field {
      padding-top: 24px;
      width: 100%;
    }

    .calculation-field table {
      border-collapse: collapse;
      width: 100%;
    }

    .calculation-field table th,
    .calculation-field table td {
      border: 1px solid black;
    }


    .calculation-field table thead {
      border-top: 1px solid #000000;
      border-bottom: 1px solid #000000;
      background: #eaebec;
    }


    .calculation-field table tbody td {
      padding: 4px 16px;
    }

    .calculation-field table tbody td.description {
      text-align: left;
    }

    .calculation-field table tbody td.number {
      text-align: right;
    }

    .calculation-field table tbody td.number span {
      margin-left: 24px;
    }

    .calculation-field table tr.no-border td {
      border: none;
    }

    .calculation-field table tr.no-border td.border {
      border: 1px solid black;
    }

  </style>
@endpush
