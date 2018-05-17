<ExceptionReport version="1.0.0" xmlns="http://www.opengis.net/ows/1.1" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.opengis.net/ogc http://schemas.opengis.net/ows/1.1.0/owsExceptionReport.xsd">
{foreach $messages as $type_msg => $all_msg}
  <Exception{if $type_msg != 'default'} exceptionCode="{$type_msg}"{/if}>
    {foreach $all_msg as $msg}
    <ExceptionText>{$msg}</ExceptionText>
    {/foreach}
  </Exception>
{/foreach}
</ExceptionReport>
