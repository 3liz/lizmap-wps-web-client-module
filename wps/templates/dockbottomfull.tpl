<div class="menu-content">
    <h3 id="processing-results-title"></h3>

    <div id="processing-log-tab" class="tab-pane">
        <div>
            <ul id="processing-log-list"></ul>
        </div>
        <div id="processing-log">
            <table id="processing-log-table" class="table table-condensed table-striped tree">
                <tbody>
                    <tr>
                        <th>Actions</th>
                        <th>Start</th>
                        <th>End</th>
                        <th>Status</th>
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
    <div id="processing-results-all">
        <div id="processing-results-literal" style="display:none;">
            <h4>Literals output</h4>
            <table id="processing-results-literal-table" class="table table-condensed table-striped">
                <tbody>
                    <tr>
                        <th>Name</th>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="processing-results-layer" style="display:none;">
            <h4>Layers output</h4>
            <table id="processing-results-layer-table" class="table table-condensed table-striped">
                <tbody>
                    <tr>
                        <th>Name</th>
                    </tr>
                </tbody>
            </table>
        </div>
        <div id="processing-results-plot">
        </div>
    </div>
</div>
