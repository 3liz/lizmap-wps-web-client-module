<div style="color:white;padding:5px;">
    {@ wps~wps.run.tab.dropdown @}
    <br/>
    <select id="processing-processes"><option value="">---</option></select>
</div>
<div class="menu-content">
    <ul class="nav nav-tabs" style="">
        <li class="active"><a data-toggle="tab" href="#processing-form-container">{@ wps~wps.run.tab.execute.button @}</a></li>
        <li><a data-toggle="tab" href="#processing-info">{@ wps~wps.run.tab.help.button @}</a></li>
    </ul>

    <div class="tab-content">

        <div id="processing-form-container" class="tab-pane active">
            <div id="processing-form-errors"></div>
            <b>{@ wps~wps.run.tab.processing.help @}</b>
            <div id="processing-input" class="form-horizontal"></div>
        </div>

        <div id="processing-info" class="tab-pane">
            <b>{@ wps~wps.run.tab.processing.title @}</b>
            <p id="processing-title"></p>

            <b>{@ wps~wps.run.tab.processing.description @}</b>
            <p id="processing-abstract"></p>

            <b>{@ wps~wps.run.tab.processing.inputs @}</b>
            <table id="processing-info-inputs" class="table table-condensed table-striped">
                <tbody>
                    <tr>
                        <th>{@ wps~wps.run.tab.processing.input.name @}</th>
                        <th>{@ wps~wps.run.tab.processing.input.type @}</th>
                        <th>{@ wps~wps.run.tab.processing.input.required @}</th>
                    </tr>
                </tbody>
            </table>
            <b>{@ wps~wps.run.tab.processing.outputs @}</b>
            <table id="processing-info-outputs" class="table table-condensed table-striped">
                <tbody>
                    <tr>
                        <th>{@ wps~wps.run.tab.processing.output.name @}</th>
                        <th>{@ wps~wps.run.tab.processing.output.type @}</th>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
