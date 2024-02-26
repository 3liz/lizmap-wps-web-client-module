<h1>{@wps.ui.page.upload.title@}</h1>
{form $form ,'wps~admin:saveUpload' , array(), 'htmlbootstrap'}
<div>
    {formcontrols}
    <div class="control-group">
        {ctrl_label}
        <div class="controls">{ctrl_control}</div>
    </div>
    {/formcontrols}
</div>
<div class="jforms-submit-buttons form-actions">{formsubmit}
<a href='{jurl 'admin:list'}' class='btn'>{@jelix~ui.buttons.back@}</a>
</div>
{/form}