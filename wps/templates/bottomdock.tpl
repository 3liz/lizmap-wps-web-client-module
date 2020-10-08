<div class="menu-content">
    <h3 id="processing-results-title"></h3>
    <div id="processing-results-all">
        <div>
            <ul id="processing-log-list" class="tree"></ul>

        </div>

        <div>

            <div id="processing-results-list" style="display: none;">
            </div>

            <div id="processing-log-failed" style="display:none;">
                <h4 id="processing-log-failed-title" class="title"></h4>
                <p>Contact the administrator with these informations to fix the error.</p>
                <div id="processing-log-failed-info" style="">
                    <div style="">
                        <h4>Informations</h4>
                        <table class="processing-log-failed-info-table table table-condensed table-striped">
                            <tbody>
                                <tr>
                                    <th>Name</th>
                                    <th>Value</th>
                                </tr>
                                <tr>
                                    <td>Algorithm</td>
                                    <td><span id="processing-log-failed-identifier"></span></td>
                                </tr>
                                <tr>
                                    <td>UUID</td>
                                    <td><span id="processing-log-failed-uuid"></span></td>
                                </tr>
                                <tr>
                                    <td>Start</td>
                                    <td><span id="processing-log-failed-creation"></span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div style="">
                        <h4>Inputs</h4>
                        <table class="processing-log-failed-detail-table table table-condensed table-striped">
                            <tbody>
                                <tr>
                                    <th>Name</th>
                                    <th>Value</th>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
                <div>
                    <h4>Messages</h4>
                    <div id="processing-log-failed-messages">
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>
