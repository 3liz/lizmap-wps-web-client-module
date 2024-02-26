<h1>{@wps.ui.page.conf.title@}</h1>
{form $form , 'wps~restrictionsAdmin:save' , array(),'htmlbootstrap'}
<table class="table">
<tbody>
    {formcontrols}
    <tr>
      <th class="span6">{ctrl_label}</th>
      <td class="span6">{ctrl_value}</td>
    </tr>
    {/formcontrols}
</tbody>
</table>

{/form}

<a href='{jurl 'wps~restrictionsAdmin:edit'}' class="btn">{@jelix~ui.buttons.update@}</a>