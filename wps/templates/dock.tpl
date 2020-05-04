<div style="color:white;padding:5px;">
    Choose a process to run
    </br><select id="processing-processes"><option value="">---</option></select>
</div>
<div class="menu-content">
    <ul class="nav nav-tabs" style="">
        <li class="active"><a data-toggle="tab" href="#processing-form-container">Run</a></li>
        <li><a data-toggle="tab" href="#processing-log-tab">History</a></li>
        <li><a data-toggle="tab" href="#processing-info">Help</a></li>
    </ul>

    <div class="tab-content">

        <div id="processing-form-container" class="tab-pane active">
            <b>Please fill in the form and click the RUN button</b>
            <div id="processing-input" class="form-horizontal"></div>
            <div id="processing-output"></div>
        </div>

        <div id="processing-log-tab" class="tab-pane">
            <div id="processing-log">
                <table id="processing-log-table" class="table table-condensed table-striped tree">
                    <tbody>
                        <tr>
                            <th>Start</th>
                            <th>End</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div id="processing-log-details" style="display:none;">
                <span id="processing-log-details-uuid" style="display:none;"></span>
                <span id="processing-log-details-creation"></span>
                <table id="processing-log-details-table" class="table table-condensed table-striped">
                    <tbody>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Value</th>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div id="processing-log-failed" style="display:none;">
                <span id="processing-log-failed-uuid" style="display:none;"></span>
                <span id="processing-log-failed-creation"></span>
                <div id="processing-log-failed-messages">
                </div>
            </div>
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
