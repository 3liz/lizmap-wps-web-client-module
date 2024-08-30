<h1>{@wps.ui.page.confirmdelete.title@}</h1>
<p>
{jlocale 'wps~wps.ui.page.confirmdelete.msg.html', array($file->fileName())}

<br>
<a href="{jurl 'wps~admin:deleteStyle', array('fileId' => $file->uniqueid())}" class="btn">{@jelix~ui.buttons.yes@}</a>

<a href="{jurl 'wps~admin:list'}" class="btn">{@jelix~ui.buttons.no@}</a>
</p>
