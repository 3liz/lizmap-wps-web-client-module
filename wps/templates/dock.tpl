<div style="color:white;padding:5px;">
    Choose a process to run
    </br><select id="processing-processes"><option value="">---</option></select>
</div>
<div class="menu-content">
    <ul class="nav nav-tabs" style="">
        <li class="active"><a data-toggle="tab" href="#processing-form-container">Run</a></li>
        <li><a data-toggle="tab" href="#processing-info">Help</a></li>
    </ul>

    <div class="tab-content">

        <div id="processing-form-container" class="tab-pane active">
            <div id="processing-form-errors"></div>
            <b>Please fill in the form and click the Execute button</b>
            <div id="processing-input" class="form-horizontal"></div>
        </div>

        <div id="processing-info" class="tab-pane">
            <b>Title</b>
            <p id="processing-title"></p>

            <b>Description</b>
            <p id="processing-abstract"></p>

            <b>Inputs</b>
            <table id="processing-info-inputs" class="table table-condensed table-striped">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Mandatory</th>
                    </tr>
                </tbody>
            </table>
            <b>Outputs</b>
            <table id="processing-info-outputs" class="table table-condensed table-striped">
                <tbody>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</div>
