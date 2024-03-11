<h1>{@wps.ui.page.list.title@}</h1>
{if count($models) > 0}
    <table class="table table-striped table-bordered">
    <tbody>
{foreach $models as $file}
    <tr>
    <td>{$file->fileName()}</td>
    <td><a href="{jurl 'admin:showUpload', array('fileId' =>$file->uniqueID()) }" class="btn">{@jelix~crud.link.edit.record@}</a></td>
    <td><a href="{jurl 'admin:confirmDelete', array('fileId' =>$file->uniqueID()) }" class="btn">{@jelix~ui.buttons.delete@}</a></td>
    </tr>
{/foreach}
    </tbody>
    </table>
{else }
    <p>
    {@wps.ui.page.list.empty_dir@}
    </p>
{/if}
<a href="{jurl 'admin:showUpload'}" class="btn">{@wps.ui.button.file.add@}</a>
