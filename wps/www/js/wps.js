import {ApiProcess} from "./api/ApiProcess";
import {ApiJob} from "./api/ApiJob";

var Petra = function() {

    let processArray = {};

    const processingSvgIcon = 'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtMTEuMTU4IDEuNS0uODAzIDIuMjM0LjAxMi4xMy4zOSAxLjk0LTIuMjYuOTM0LTEuMDk1LTEuNjQ2LS4wODQtLjA5OC0yLjE0OC0xLjAxNC0xLjE5IDEuMTkgMS4wMTQgMi4xNDguMDk4LjA4NCAxLjY0NiAxLjA5Ni0uOTM1IDIuMjU4LTEuOTQtLjM5LS4xMy0uMDEtMi4yMzMuODAydjEuNjg0bDIuMjM0LjgwMy4xMy0uMDEyIDEuOTQtLjM5LjkzNCAyLjI2LTEuNjQ2IDEuMDk1LS4wOTguMDg0LTEuMDE0IDIuMTQ4IDEuMTkgMS4xOSAyLjE0OC0xLjAxNC4wODQtLjA5OCAxLjA5Ni0xLjY0NiAyLjI1OC45MzUtLjM5IDEuOTQtLjAxLjEzLjgwMiAyLjIzM2gxLjY4NGwuODAzLTIuMjM0LS4wMTItLjEzLS4zOS0xLjk0IDIuMjYtLjkzNCAxLjA5NSAxLjY0Ni4wODQuMDk4IDIuMTQ4IDEuMDE0IDEuMTktMS4xOS0xLjAxNC0yLjE0OC0uMDk4LS4wODQtMS42NDYtMS4wOTYuOTM1LTIuMjU4IDEuOTQuMzkuMTMuMDEgMi4yMzMtLjgwMnYtMS42ODRsLTIuMjM0LS44MDMtLjEzLjAxMi0xLjk0LjM5LS45MzQtMi4yNiAxLjY0Ni0xLjA5NS4wOTgtLjA4NCAxLjAxNC0yLjE0OC0xLjE5LTEuMTktMi4xNDggMS4wMTQtLjA4NC4wOTgtMS4wOTYgMS42NDYtMi4yNTgtLjkzNS4zOS0xLjk0LjAxLS4xMy0uODAyLTIuMjMzem0uODQyIDhhMi41IDIuNSAwIDAgMSAyLjUgMi41IDIuNSAyLjUgMCAwIDEgLTIuNSAyLjUgMi41IDIuNSAwIDAgMSAtMi41LTIuNSAyLjUgMi41IDAgMCAxIDIuNS0yLjV6IiBmaWxsPSIjOThiNWQ4IiBzdHJva2U9IiM0NTdhYmUiLz48L3N2Zz4K'

    function assignValues() {
        ApiProcess.setProccesesUrl(lizWpsUrls['wps_ogc_processes']);
        ApiJob.setJobUrl(lizWpsUrls['wps_ogc_jobs']);
    }

    /**
     *
     * @param {Process} processValue
     */
    function populateHelpSection(processValue) {
        const procTitle = document.getElementById("processing-title");
        const procDesc = document.getElementById("processing-abstract");
        const procInputs = document.querySelector("#processing-info-inputs > tbody");
        const procOutputs = document.querySelector("#processing-info-outputs > tbody");

        const inputs = processValue.getInputs();
        const outputs = processValue.getOutputs();

        procTitle.textContent = processValue.getTitle();
        procDesc.textContent = processValue.getDescription();

        let rows = document.querySelectorAll('#processing-info-inputs tr:not(:first-child)');
        rows.forEach(row => row.remove());
        rows = document.querySelectorAll('#processing-info-outputs tr:not(:first-child)');
        rows.forEach(row => row.remove());

        for (const value of Object.values(inputs)) {
            let type;
            for (let i = 0; i < value.metadata.length; i++) {
                if (value.metadata[i].title === "processing:type") {
                    type = value.metadata[i].href;

                    const schemaType = retreiveSchemaType(value.schema);

                    if (type !== schemaType) {
                        type += ' (' + schemaType + ')';
                    }
                    break
                }
            }
            procInputs.innerHTML += `
                <tr>
                    <td>${value.title}</td>
                    <td>${type}</td>
                    <td>${value.minOccurs > 0  ? '&#10003;' : ''}</td>
                </tr>`
        }

        for (const value of Object.values(outputs)) {
            procOutputs.innerHTML += `
                <tr>
                    <td>${value.title}</td>
                    <td>${retreiveSchemaType(value.schema)}</td>
                </tr>`
        }
    }

    function retreiveSchemaType(schemaObject) {
        if (schemaObject.type) {
            // literalData
            return schemaObject.type;
        } else if (schemaObject.oneOf) {
            // oneOf
            let type = schemaObject.oneOf[0].type;
            for (let i = 1; i < schemaObject.oneOf.length; i++) {
                if (schemaObject.oneOf[i].type !== type)
                    return "mixed";
            }
            return type;
        } else {
            return '';
        }
    }

    /**
     *
     * @param {Process} processValue
     */
    function populateExecuteSection(processValue) {

    }

    function initProcessingPane() {
        assignValues();
        const processingProcessesElement = document.querySelector('#processing-processes');

        processingProcessesElement.addEventListener("change", () => {
            populateExecuteSection(processArray[processingProcessesElement.value]);
            populateHelpSection(processArray[processingProcessesElement.value]);
        });

        ApiProcess.getAllProcesses()
            .then((list) => {
               list.forEach((process) => {
                   // Add it to select element
                   let option = document.createElement("option");

                   option.setAttribute("value", process.getId());
                   option.textContent = process.getTitle();

                   processingProcessesElement.appendChild(option);

                   // Build processArray
                   ApiProcess.getSpecificProcess(process.getId())
                       .then((processElement) => {
                           processArray[process.getId()] = processElement;
                       });
               });
               console.log("PROCESS ARRAY", processArray);
            });
    }

    lizMap.events.on({

        'uicreated': function(e) {
            const processingProcessesElement = document.querySelector('#processing-processes');
            const processingResultsElement = document.querySelector('#processing-results');

            if (processingProcessesElement === null || processingResultsElement === null) {
                return;
            }

            initProcessingPane();

            if (processingProcessesElement.length) {
                $('#button-processing span.icon').css('background-image', 'none').html('<i class="icon-cog icon-white" style="margin-left: 4px;"></i>');

                $('#button-processing-results span.icon').css('background-image', 'none').html('<i class="icon-eye-open icon-white" style="margin-left: 4px;"></i>');
            }

            console.log(lizWpsUrls);
        }

    });
}();
