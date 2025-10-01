import {ComplexBuildHelper} from "./ComplexBuildHelper";

/**
 * Class representing the `boundingBoxData` entry type.
 *
 * @extends {ComplexBuildHelper}
 */
export class BoundingboxData extends ComplexBuildHelper {

    /**
     * Creates an input using `ComplexBuildHelper`.
     * @param {string} id - Entry id.
     * @param {Object} input - Input object.
     * @param {number} occurrence - Current occurrence (minOccurs).
     * @return {BoundingboxData} An instance of the entry.
     */
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

    /**
     * Verify values written in the input.
     *
     * @param {HTMLInputElement} field - Current input field.
     * @param {string} id - Entry id.
     * @param {Object} input - Input object.
     */
    checkValues(field, id, input) {
        // Parse field value: number,number,number,number EPSG:integer
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
