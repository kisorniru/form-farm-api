<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    @include('mail.common.head')
    <body>
        <!-- Full Width Container -->
        <table id="body-bg-color" border="0" width="100%" cellpadding="0" cellspacing="0">
            <tr>
                <td align="center" valign="top" bgcolor="#ffffff">
                    <!-- Main Container -->
                    <table border="0" width="600" cellpadding="0" cellspacing="0" class="row">
                        <tr>
                            <td id="container-bg-color" align="center" valign="top" bgcolor="#ffffff">
                                @yield('content')
                            </td>
                        </tr>
                    </table>
                    <!-- Main Container -->
                </td>
            </tr>
        </table>
        <!-- Full Width Container -->
        <div class="gmailfix" style="white-space:nowrap;font:15px courier;line-height:0;">
        </div>
    </body>
</html>
