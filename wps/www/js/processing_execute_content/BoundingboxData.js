import {ComplexBuildHelper} from "./ComplexBuildHelper";

export class BoundingboxData extends ComplexBuildHelper {

    constructor(id, input, occurrence) {
        super(id, input, occurrence);

        this.fieldDiv.firstChild.addEventListener("blur", (e) => {
            this.checkValues(this.fieldDiv.firstChild, id, input);
        });

        this.fieldDiv.placeholder = "left,bottom,right,top (EPSG:4326)";

        const br = document.createElement('br');

        this.fieldDiv.insertBefore(br, this.fieldDiv.nextSibling);
        this.fieldDiv.insertBefore(this.selectorCRS, br.nextSibling);
        this.fieldDiv.insertBefore(this.btn, this.selectorCRS.nextSibling);

    }

    // Parse field value: number,number,number,number EPSG:integer
    checkValues(field, id, input) {
        let reg = /(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *, *(-?\d+\.?\d*) *\((EPSG:\d+)\)/gi;
        let matches = reg.exec(field.value);

        if (matches === undefined || matches?.length !== 6) {
            this.addError(field.id, input, "value isn't correct.")
            this.dispatchInputValueUpdate(input.processId, id, '');
            return;
        } else {
            this.removeError(field.id);
        }

        // get projection value to upper case
        let proj = matches[5].toUpperCase();
        // Build bounds
        let b = [matches[1], matches[2], matches[3], matches[4]]
        if (proj === 'EPSG:4326') {
            b = [matches[2], matches[1], matches[4], matches[3]]
        }

        b = {
            left: b[0],
            bottom: b[1],
            right: b[2],
            top: b[3]
        }

        this.dispatchInputValueUpdate(
            input.processId,
            id,
            {
                boundingBoxData: {
                    projection: proj,
                    bounds: b
                }
            });
    }
}
