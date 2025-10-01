import {BuildHelper} from "./BuildHelper";

/**
 * Class representing the `literalData` entry type.
 *
 * @extends {BuildHelper}
 */
export class LiteralData extends BuildHelper {

    /**
     * Creates an input using `BuildHelper`.
     * @param {string} id - Entry id.
     * @param {Object} input - Input object.
     * @param {number} occurrence - Current occurrence (minOccurs).
     * @return {LiteralData} An instance of the entry.
     */
    constructor(id, input, occurrence) {
        super(id, input, occurrence);

        const selectType = [
            "vector",
            "source",
            "raster",
            "boolean",
            "enum"
        ];

        const cleanId = id.replaceAll(':', '-');

        const type = input.metadata.find(item => item.title === "processing:type")?.href;

        if (type === 'boolean')
            input.schema.enum = ['False', 'True'];

        const enumVal = input.schema.enum;

        const field = document.createElement(selectType.includes(type) || enumVal ? "select" : "input");
        field.id = 'processing-input-' + cleanId + '-' + this.occurrence;
        field.name = cleanId;
        field.title = input.title;
        this.fieldDiv.appendChild(field);

        field.setAttribute('class', 'qgisType-' + type);

        if (selectType.includes(type) || enumVal) {
            field.addEventListener("change", (e) => {
                this.dispatchInputValueUpdate(input.processId, id, field.value);
            });

            const restrictedLayers = this.getRestrictedLayers(cleanId, input);

            const vecAndRast = this.getLayersList(type, restrictedLayers);
            let vectors = vecAndRast[0];
            let rasters = vecAndRast[1];

            if (["vector", "source"].includes(type)) {
                this.fillSelectField(field, vectors);

                if (type === "source") {
                    this.handleSourceType(field, cleanId, input);
                }

            } else if (type === "raster") {
                this.fillSelectField(field, rasters);

            } else { //type === "boolean" || enumVal
                let option = document.createElement("option");
                option.innerHTML = '';
                field.appendChild(option);

                for (let v in input.schema.enum) {
                    option = document.createElement("option");
                    option.value = enumVal[v];
                    option.innerHTML = enumVal[v];
                    field.appendChild(option);
                }
            }
        } else {
            if (type === "number") {
                field.placeholder = input.schema.default;
                field.value = input.schema.default ? input.schema.default : '';
            } else {
                field.placeholder = cleanId;
            }
            field.addEventListener("blur", (e) => {
                this.checkValues(field, id, input, type);
            });
        }

        this.dispatchInputValueUpdate(input.processId, id, field.value);
    }

    /**
     * Verify values written in the input.
     *
     * @param {HTMLInputElement} field - Current input field.
     * @param {string} inputId - Input ID.
     * @param {Object} input - Input object.
     * @param {string} type - Input type.
     */
    checkValues(field, inputId,  input, type) {
        if (field.value === '') {
            this.addError(field.id, input, "value is empty.");
            this.dispatchInputValueUpdate(input.processId, inputId, '');
            return;
        } else {
            this.removeError(field.id);
        }

        if (type === "number") {
            const preciseType = input.schema.type === "integer" ? "integer" : "float";

            let reg;
            if (preciseType === "integer") {
                reg = /^-?[0-9]*$/gm;
            } else {
                reg = /^-?[0-9]+(.[0-9]+)?$/gm;
            }

            if (!reg.exec(field.value)) {
                this.addError(field.id, input, "value should be " + preciseType + ".");
            } else {
                this.removeError(field.id);

                const min = input.schema.minimum;
                const max = input.schema.maximum;

                if (parseFloat(field.value) >= min && parseFloat(field.value) <= max) {
                    this.removeError(field.id);
                } else {
                    this.addError(
                        field.id,
                        input,
                        "value should be between " + min + " and " + max + "."
                    );
                }
            }
        }

        this.dispatchInputValueUpdate(input.processId, inputId, field.value);
    }

    /**
     * Handle if the QGIS type is `source`.
     * @param {HTMLInputElement} field - Current input field.
     * @param {string} id - Input ID.
     * @param {Object} input - Input object.
     */
    handleSourceType(field, id, input) {
        const br = document.createElement('br');

        const label = document.createElement("label");
        label.setAttribute("class", "checkbox inline disabled");

        const checkBox = document.createElement("input");
        checkBox.setAttribute("id", 'processing-input-' + id + '-selection-' + this.occurrence);
        checkBox.setAttribute("type", "checkbox");
        checkBox.setAttribute("class", 'selection');
        checkBox.disabled = true;

        field.addEventListener("change", (e) => {
            const docCheckBox = document.getElementById('processing-input-' + id + '-selection-' + this.occurrence);
            if (field.value === "") {
                docCheckBox.disabled = true
                label.classList.add("disabled");
            } else {
                docCheckBox.disabled = false
                label.classList.remove("disabled");
                this.selectionCheckBoxEvent(id, input, field);
            }
        });

        label.addEventListener("click", (e) => {
            this.selectionCheckBoxEvent(id, input, field);
        });

        label.appendChild(checkBox);
        label.innerHTML += "Selection"

        field.parentNode.insertBefore(label, field.nextSibling);
        field.parentNode.insertBefore(br, field.nextSibling);
    }

    /**
     * Handles the event triggered by selecting or deselecting a checkbox for processing input selections.
     *
     * @param {string} id - Input ID.
     * @param {Object} input - Input object.
     * @param {HTMLInputElement} field - Current input field.
     */
    selectionCheckBoxEvent(id, input, field) {
        const docCheckBox = document.getElementById('processing-input-' + id + '-selection-' + this.occurrence);
        if (docCheckBox.checked && !docCheckBox.disabled) {
            let theValue = input.data;
            let layerName = theValue;
            if (layerName?.startsWith('layer:')) {
                layerName = layerName.split('?')[0].slice(6);
            }

            let layerConfig = lizMap.config.layers[layerName];
            if (('selectedFeatures' in layerConfig) && layerConfig.selectedFeatures.length > 0) {
                theValue = 'layer:' + layerName + '?select=' + encodeURIComponent('$id IN ( ' + layerConfig.selectedFeatures.join() + ' )')
            } else if (('filteredFeatures' in layerConfig) && layerConfig.filteredFeatures.length > 0) {
                theValue = 'layer:' + layerName + '?select=' + encodeURIComponent('$id IN ( ' + layerConfig.filteredFeatures.join() + ' )')
            } else if (('request_params' in layerConfig) &&
                ('exp_filter' in layerConfig['request_params']) &&
                layerConfig['request_params']['exp_filter']) {
                theValue = 'layer:' + layerName + '?select=' + encodeURIComponent(layerConfig['request_params']['exp_filter'])
            }
            input.data = theValue;
        } else {
            input.data = field.value;
        }
    }

    /**
     * Populates a select field with options derived from a list of layers.
     *
     * @param {HTMLInputElement} field - Current input field selector.
     * @param {string[]} layersList An array of layer names to generate options for the select field.
     */
    fillSelectField(field, layersList) {
        const baseOption = document.createElement("option");
        baseOption.innerHTML = '';
        field.appendChild(baseOption);

        for (var i = 0, len = layersList.length; i < len; i++) {
            const layer = layersList[i];
            var lConfig = lizMap.config.layers[layer];
            const option = document.createElement("option");
            option.value = layer;
            option.innerHTML = lConfig.title;
            field.appendChild(option);
        }

        if (field.children.length === 2) {
            field.removeChild(baseOption);
        }
    }

    /**
     * Verify the entry type and retrieves a list of layers categorized into vectors and rasters.
     *
     * @param {string} type - QGIS Entry type.
     * @param {Array<string>} restrictedLayers - Array of restricted layers.
     * @return {Array<Array<string>>} A two-dimensional array where the first element contains vector layers
     * and the second element contains raster layers.
     */
    getLayersList(type, restrictedLayers) {
        let vectorsAndRasters = [[], []];
        if (["vector", "source", "raster"].includes(type)) {
            for (let layer in lizMap.config.layers) {
                var lConfig = lizMap.config.layers[layer];
                if (lConfig.type !== 'layer')
                    continue;
                if (restrictedLayers.length !== 0 && restrictedLayers.indexOf(layer) === -1)
                    continue;
                if ('geometryType' in lConfig) {
                    vectorsAndRasters[0].push(layer);
                } else {
                    vectorsAndRasters[1].push(layer);
                }
            }
        }
        return vectorsAndRasters;
    }

    /**
     * Retrieves a list of restricted layers based on the specified inputId and input object.
     *
     * @param {string} inputId - Input ID..
     * @param {Object} input - Input object.
     * @return {Array} An array of restricted layers.
     * Returns an empty array if no restricted layers are found or if the configuration is invalid.
     */
    getRestrictedLayers(inputId, input) {
        let restrictedLayers = [];
        if (
            typeof wps_wps_project_config !== 'undefined'
            && (input.processId in wps_wps_project_config)
            && (inputId in wps_wps_project_config[input.processId])
        ) {
            restrictedLayers = wps_wps_project_config[input.processId][inputId];
            if (!Array.isArray(restrictedLayers))
                restrictedLayers = [];
        }
        return restrictedLayers;
    }
}
