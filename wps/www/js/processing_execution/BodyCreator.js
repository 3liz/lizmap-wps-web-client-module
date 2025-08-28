/**
 * The `BodyCreator` class is responsible for creating a structured body object in JSON format based on a given input.
 * Will go in POST request toward WPS Server.
 */
export class BodyCreator {
    /**
     * The `body` variable represents values for each process entry.
     *
     * @type string
     */
    body;

    /**
     * Creates a stringified JSON that contains information for WPS server to execute a job.
     *
     * @param {Object} inputs - Object containing values.
     */
    constructor(inputs) {
        let data = '{ "inputs": { ';

        Object.keys(inputs).forEach(key => {
            const element = this.getValueFromInput(inputs[key]);

            if (element === null) {
                data += "ERROR,";
            } else {
                if (element[0] !== "{") {
                    data += `"` + key + `": "` + element + `",`;
                } else {
                    data += `"` + key + `": ` + element + `,`;
                }

            }
        });
        data += '}}';

        data = data.replace(/,}/g, '}');

        this.body = data;
    }

    /**
     * Retrieves the body property of the current instance.
     *
     * @return {string} The value of the body property.
     */
    getBody() {
        return this.body;
    }

    /**
     * Extracts and returns the value from the provided input based on its typeHint.
     *
     * @param {Object} input - The input object containing a typeHint and associated data.
     * @return {string|null} Returns the processed value based on the input's typeHint.
     * Returns null if the typeHint does not match any known types.
     */
    getValueFromInput(input) {
        if (input.typeHint === "literalData") {
            return input.data;
        } else if (input.typeHint === "boundingboxData") {
            return `{ "bbox" : [` +
                input.data.boundingBoxData.bounds.left + `, ` +
                input.data.boundingBoxData.bounds.bottom + `, ` +
                input.data.boundingBoxData.bounds.right + `, ` +
                input.data.boundingBoxData.bounds.top +
                `], "projection": "` +
                input.data.boundingBoxData.projection + `" }`;
        } else if (input.typeHint === "complexData") {
            let cp = input.data.complexData;
            const truncValue = '{' + '"type": "Feature", ' + cp.value.slice(1);

            return JSON.stringify({
                format: {
                    mediaType: cp.mimeType
                },
                value: truncValue
            });
        }

        console.error("No value type found.")
        return null;
    }
}
