<h1>{@wps.ui.page.model3.list.title@}</h1>
{if count($models) > 0}
    <table class="table table-striped table-bordered">
    <tbody>
{foreach $models as $file}
    <tr>
    <td>{$file->fileName()}</td>
    <td><a href="{jurl 'admin:showUploadModel', array('fileId' =>$file->uniqueID()) }" class="btn">{@jelix~crud.link.edit.record@}</a></td>
    <td><a href="{jurl 'admin:confirmDeleteModel', array('fileId' =>$file->uniqueID()) }" class="btn">{@jelix~ui.buttons.delete@}</a></td>
    </tr>
{/foreach}
    </tbody>
    </table>
{else }
    <p>
    {@wps.ui.page.model3.list.empty_dir@}
    </p>
{/if}
<a href="{jurl 'admin:showUploadModel'}" class="btn">{@wps.ui.button.model3.file.add@}</a>

<h1>{@wps.ui.page.qml.list.title@}</h1>
{if count($styles) > 0}
    <table class="table table-striped table-bordered">
    <tbody>
{foreach $styles as $file}
    <tr>
    <td>{$file->fileName()}</td>
    <td><a href="{jurl 'admin:showUploadStyle', array('fileId' =>$file->uniqueID()) }" class="btn">{@jelix~crud.link.edit.record@}</a></td>
    <td><a href="{jurl 'admin:confirmDeleteStyle', array('fileId' =>$file->uniqueID()) }" class="btn">{@jelix~ui.buttons.delete@}</a></td>
    </tr>
{/foreach}
    </tbody>
    </table>
{else }
    <p>
    {@wps.ui.page.qml.list.empty_dir@}
    </p>
{/if}
<a href="{jurl 'admin:showUploadStyle'}" class="btn">{@wps.ui.button.qml.file.add@}</a>
