@extends('layouts.mail')

@section('content')
<!-- content -->
<table border="0" width="100%" align="center" cellpadding="0" cellspacing="0" style="width:100%;max-width:100%;">
    <tr>
        <td align="center" valign="top">
            <!-- content-bg -->
            <table border="0" width="100%" align="center" cellpadding="0" cellspacing="0" class="row" style="width:100%;max-width:100%;">
                <tr>
                    <td align="center" valign="top" style="background-color:#ffffff;">
                        @include('mail.common.gap', ['height' => 40])

                        <!-- content-content -->
                        <table border="0" width="600" cellpadding="0" cellspacing="0" align="left" class="row" style="width:600px;max-width:600px;">
                            <tr>
                                <td valign="middle" align="left" style="font-size:18px;color:#2b2f3a;line-height:1.25;font-family:sans-serif;">
                                  <span>The Document "{{ $document->name }}" has been submitted.</span>
                                </td>
                            </tr>
                        </table>
                        <!-- content-content -->

                        @include('mail.common.gap', ['height' => 40])

                        <!-- content-button -->
                          <table border="0" width="600" cellpadding="0" cellspacing="0" align="left" class="row" style="width:600px;max-width:600px;">
                            <tr>
                                <td valign="middle" align="left" style="font-size:18px;color:#2b2f3a;line-height:1.25;font-family:sans-serif;">
                                  <a href="{{ $document->getPreviewURL() }}" dowload
                                    style="display:block;color: #fff;background-color: #0066f2;border-color: #0066f2;text-align:center;padding: 0.375rem 0.75rem;font-size: 1rem;line-height: 1.6;">
                                    Download Document
                                  </a>
                                </td>
                            </tr>
                        </table>
                        <!-- content-button -->

                        @include('mail.common.gap', ['height' => 40])
                    </td>
                </tr>
            </table>
            <!-- content-bg -->
        </td>
    </tr>
</table>
<!-- content -->
@endsection
