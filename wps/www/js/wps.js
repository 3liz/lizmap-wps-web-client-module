import {ApiProcess} from "./api/ApiProcess";
import {ApiJob} from "./api/ApiJob";
import {ProcessingContent} from "./processing_execute_content/ProcessingContent";
import {Execution} from "./processing_execution/Execution";
import {FlashMessage} from "./other_components/FlashMessage";
import {Errors} from "./processing_execute_content/Errors";
import "./processing_results/JobsPanel";

var Petra = function () {

    let processArray = {};
    let jobArray = {};
    let jobByProcess = {};
    let jobPanel;
    let intervalStatusProcesses;

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
                    <td>${value.minOccurs > 0 ? '&#10003;' : ''}</td>
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

    /**
     *
     * @param {Process} processValue
     */
    function populateExecuteSection(processValue) {
        const container = document.getElementById("processing-input");
        const formList = ProcessingContent.GetProcessingForm(processValue.getInputs())
        let supported = true;

        Errors.resetErrors();

        container.innerHTML += `<h3>Input:</h3>`;
        for (let input of formList) {
            if (input) {
                container.appendChild(input);
            } else {
                document.getElementById("processing-input").innerHTML = '<span class="notsupported">' +
                    "Sorry, the WPS builder does not support the selected process." +
                    "</span>";
                supported = false;
                break;
            }
        }
        if (supported) {
            const execution = new Execution(processValue);

            execution.getBtn().addEventListener("click", () => {
                execution.execute()
                    .then(job => {
                        addFlashMessage(
                            "Process executed ! Find it in results pane.",
                            "success",
                            true,
                            3000
                        );

                        jobArray[job.getJobID()] = job

                        jobByProcess[job.getCleanProcessID()].push(job.getJobID());

                        jobPanel.updatePanel(jobArray, jobByProcess);

                        scheduleUpdateStatusProcesses();
                    })
                    .catch((e) => {
                        addFlashMessage(e, "danger", true, 5000);
                        console.error(e);
                    });
            });
        }
    }

    function initPanes() {
        assignValues();
        const processingProcessesElement = document.querySelector('#processing-processes');

        processingProcessesElement.addEventListener("change", () => {
            cleanHelpExecuteSection();
            if (processingProcessesElement.value !== "") {
                const value = processingProcessesElement.value.replaceAll(':', '-');
                populateExecuteSection(processArray[value]);
                populateHelpSection(processArray[value]);
            }
        });

        ApiProcess.getAllProcesses()
            .then((list) => {
                list.forEach(async (process) => {
                    // Add it to select element
                    let option = document.createElement("option");

                    option.setAttribute("value", process.getId());
                    option.textContent = process.getTitle();

                    processingProcessesElement.appendChild(option);

                    const processID = process.getCleanId();

                    try {
                        // Build processArray
                        processArray[processID] = await ApiProcess.getSpecificProcess(process.getId());
                        jobByProcess[processID] = [];
                    } catch (e) {
                        addFlashMessage(e, "danger", true, 5000);
                        console.error(e);
                    }
                });
                initProcessingResultsPane();
            })
            .catch((e) => {
                addFlashMessage(e, "danger", true, 5000);
                console.error(e);
            });
    }

    function initProcessingResultsPane() {
        jobPanel = document.querySelector("jobs-panel");

        lizMap.events.on({
            'bottomdockopened': function (e) {
                if (e.id === 'processing-results') {
                    if (!intervalStatusProcesses)
                        updateStatusProcesses(-1);
                }
            },
            'bottomdockclosed': function (e) {
                if (e.id === 'processing-results') {
                    window.clearInterval(intervalStatusProcesses);
                    intervalStatusProcesses = null;
                }
            }
        });
    }

    function retrieveStoredJobs() {
        ApiJob.getAllJobs()
            .then((jobs) => {
                for (let [jobID, job] of Object.entries(jobs)) {
                    jobArray[jobID] = job;
                    const processID = job.getCleanProcessID();
                    if (!jobByProcess[processID].includes(job.getJobID()))
                        jobByProcess[processID].push(job.getJobID());
                }
                jobPanel.updatePanel(jobArray, jobByProcess);
            })
            .catch((e) => {
                addFlashMessage(e, "danger", true, 5000);
                console.error(e);
            });
    }

    // *-----------------*
    // | Utils functions |
    // *-----------------*

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

    function cleanHelpExecuteSection() {
        // Help section
        const procTitle = document.getElementById("processing-title");
        const procDesc = document.getElementById("processing-abstract");

        procTitle.innerHTML = "";
        procDesc.innerHTML = "";

        let rows = document.querySelectorAll('#processing-info-inputs tr:not(:first-child)');
        rows.forEach(row => row.remove());
        rows = document.querySelectorAll('#processing-info-outputs tr:not(:first-child)');
        rows.forEach(row => row.remove());

        // Execute section
        const errorSection = document.getElementById("processing-form-errors");
        const inputSection = document.getElementById("processing-input");

        errorSection.innerHTML = '';
        inputSection.innerHTML = '';

        // Clean map features
        lizMap.mainLizmap.digitizing.toolSelected = 'deactivate';
    }

    function scheduleUpdateStatusProcesses() {
        // Use closure to track the number of call
        let count = 5
        window.clearInterval(intervalStatusProcesses)
        intervalStatusProcesses = window.setInterval(function () {
            if (count < 0) {
                window.clearInterval(intervalStatusProcesses);
                if (document.getElementById("bottom-dock").style.display !== "none") {
                    updateStatusProcesses(-1);
                } else {
                    intervalStatusProcesses = null;
                }
            } else {
                updateStatusProcesses(count)
            }
            count -= 1;
        }, 1000);
    }

    function updateStatusProcesses(count) {
        retrieveStoredJobs();
        if (count < 0) {
            window.clearInterval(intervalStatusProcesses);
            intervalStatusProcesses = window.setInterval(function () {
                updateStatusProcesses(1);
            }, 10000);
        }
    }


    // *----------------*
    // | Flash messages |
    // *----------------*

    function addFlashMessage(message, type, closable, duration) {
        const msg = new FlashMessage(message, type, closable, duration);

        if(duration !== undefined){
            setTimeout(function() {
                msg.removeElement();
            }, duration);
        }
    }

    // *---------------*
    // | Start section |
    // *---------------*

    lizMap.events.on({

        'uicreated': function (e) {
            const processingProcessesElement = document.querySelector('#processing-processes');
            const processingResultsElement = document.querySelector('#processing-results');

            if (processingProcessesElement === null || processingResultsElement === null) {
                return;
            }

            initPanes();

            if (processingProcessesElement.length) {
                $('#button-processing span.icon').css('background-image', 'none').html('<i class="icon-cog icon-white" style="margin-left: 4px;"></i>');

                $('#button-processing-results span.icon').css('background-image', 'none').html('<i class="icon-eye-open icon-white" style="margin-left: 4px;"></i>');
            }

            document.addEventListener('WPSInputValueChanged', function (event) {
                const {processId, inputId, newInputValue} = event.detail;

                processArray[processId].setInputValue(inputId, newInputValue);
            });

            document.addEventListener('WPSAddFlashMessage', function (event) {
                const {message, type, closable, duration} = event.detail;

                addFlashMessage(message, type, closable, duration);
            });

            document.addEventListener('WPSAddError', function (event) {
                const {id, input, text} = event.detail;

                Errors.addError(id,input, text);
            });

            document.addEventListener('WPSRemoveError', function (event) {
                const {id} = event.detail;

                Errors.removeError(id);
            });
        }
    });
}();
