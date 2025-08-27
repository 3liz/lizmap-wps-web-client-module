import {ComplexBuildHelper} from "./ComplexBuildHelper";

export class ComplexData extends ComplexBuildHelper {

    constructor(id, input, occurrence) {
        super(id, input, occurrence);

        this.fieldDiv.firstChild.addEventListener("blur", (e) => {
            this.checkValues(this.fieldDiv.firstChild, id, input);
        });

        const br = document.createElement('br');

        this.fieldDiv.insertBefore(br, this.fieldDiv.nextSibling);
        this.fieldDiv.insertBefore(this.selectorCRS, br.nextSibling);
        this.fieldDiv.insertBefore(this.btn, this.selectorCRS.nextSibling);
    }

    checkValues(field, id, input) {
        if (field.value === '') {
            this.addError(field.id, input, "value is empty.")
        } else {
            this.removeError(field.id);
        }
        const val = field.value ? {
            complexData: {
                //mimeType: 'application/wkt',
                mimeType: 'application/vnd.geo+json',
                encoding: 'utf8',
                schema: '',
                value: field.value
            }
        } : '';
        this.dispatchInputValueUpdate(input.processId, id, val);
    }
}
