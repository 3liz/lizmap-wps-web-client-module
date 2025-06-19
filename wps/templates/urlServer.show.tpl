<h1>{@wps.ui.page.url.server.title@}</h1>

{form $urlForm, 'wps~urlServer:save', array(), 'htmlbootstrap'}
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

<a href='{jurl 'wps~urlServer:edit'}' class="btn">{@jelix~ui.buttons.update@}</a>
