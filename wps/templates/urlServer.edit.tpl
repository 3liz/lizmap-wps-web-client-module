<h1>{@wps.ui.page.url.server.title@}</h1>
{form $urlForm, 'wps~urlServer:save', array(), 'htmlbootstrap'}
    <div>
        {formcontrols}
            <div class="control-group">
                {ctrl_label}
                <div class="controls">{ctrl_control}</div>
            </div>
        {/formcontrols}
    </div>
    <div class="jforms-submit-buttons form-actions">{formsubmit}
    </div>
{/form}
