import {BodyCreator} from "./BodyCreator";
import {ApiProcess} from "../api/ApiProcess";

/**
 * Class representing an Execution process to handle user interactions and execute a defined process.
 */
export class Execution {

    /**
     * Constructor for initializing the process and creating an "Execute" button.
     *
     * @param {Process} process - The process to be initialized and used by the constructor.
     * @return {Execution} - Execution instance.
     */
    constructor(process) {
        this.process = process;

        const executeDiv = document.createElement("div");
        executeDiv.setAttribute('class', 'form-actions');

        const executeButton = document.createElement("button");
        executeButton.innerHTML = "Execute";
        executeButton.setAttribute('id', 'processing-execute-button');
        executeButton.setAttribute('class', 'btn');
        executeDiv.appendChild(executeButton);
        document.getElementById("processing-input").appendChild(executeDiv);

        this.btn = executeButton;
    }

    /**
     * Executes the processing operation.
     *
     * @return {Promise<Job>} A promise that resolves with the result of the process execution, or rejects with an error if the execution fails.
     * @throws {Error} Will throw an error if the operation fails.
     */
    async execute() {
        try {
            if (this.process.getAllInputsValuesWithMinOccursGreaterThan0().includes("") || document.getElementById("processing-form-errors").children.length > 0)
                throw new Error("Not executed. Missing or incorrect values...")

            const inputs = this.process.getInputs();

            for (let [inputId, val] of Object.entries(inputs)) {
                const qgisType = val.metadata.find(item => item.title === "processing:type")?.href;

                if (qgisType === 'source') {
                    this.handleSourceType(inputId, val)
                }
            }

            const body = new BodyCreator(inputs).getBody();

            return await ApiProcess.executeProcess(
                this.process.getId(),
                body
            )
        } catch (e) {
            throw e;
        }
    }

    /**
     * Processes and handles the source type for a given input.
     *
     * @param {string} inputId - The identifier for the input element.
     * @param {Object} input - The input object containing data and other properties.
     */
    handleSourceType(inputId, input) {
        let theValue = input.data;
        let layerName = theValue;

        if (layerName.startsWith('layer:')) {
            layerName = layerName.split('?')[0].slice(6);
        }

        let layerConfig = lizMap.config.layers[layerName];
        if (('filteredFeatures' in layerConfig) && layerConfig.filteredFeatures.length > 0) {
            theValue = 'layer:' + layerName + '?select=' + encodeURIComponent('$id IN ( ' + layerConfig.filteredFeatures.join() + ' )')
        } else if (('request_params' in layerConfig) &&
            ('exp_filter' in layerConfig['request_params']) &&
            layerConfig['request_params']['exp_filter']) {
            theValue = 'layer:' + layerName + '?select=' + encodeURIComponent(layerConfig['request_params']['exp_filter'])
        }

        let cbx = $('#processing-input-' + inputId.replaceAll(':', '_').replaceAll(' ', '_') + '-selection');
        if (cbx.is(':checked')) {
            if (('selectedFeatures' in layerConfig) && layerConfig.selectedFeatures.length > 0) {
                theValue = 'layer:' + layerName + '?select=' + encodeURIComponent('$id IN ( ' + layerConfig.selectedFeatures.join() + ' )')
            }
        }
        input.data = theValue;
    }

    /**
     * Retrieves the button element associated with this instance.
     *
     * @return {HTMLButtonElement} The button element.
     */
    getBtn() {
        return this.btn;
    }
}
