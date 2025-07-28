export class BodyCreator {
    body;

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

    getBody() {
        return this.body;
    }

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
