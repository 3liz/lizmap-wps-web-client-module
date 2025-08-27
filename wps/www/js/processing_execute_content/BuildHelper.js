export class BuildHelper {

    constructor(id, input, occurrence) {
        this.occurrence = occurrence;

        const values = this.firstPartBuilder(
            id.replaceAll(':', '-'),
            input.title
        );

        this.control = values[0];
        this.fieldDiv = values[1];
    }

    // *---------------------------------*
    // | Common first part input builder |
    // *---------------------------------*

    firstPartBuilder(id, title) {
        // Build the control group
        const control = document.createElement("div");
        control.setAttribute('class', 'control-group');
        control.id = 'processing-input-' + id + '-group-' + this.occurrence;

        // Defined the label
        const label = document.createElement("label");
        label.setAttribute('class', 'jforms-label control-label');
        label.setAttribute('for', 'processing-input-' + id);
        label.innerHTML = title;
        label.id = 'processing-input-' + id + '-label-' + this.occurrence;
        control.appendChild(label);

        // Defined the field group
        const fieldDiv = document.createElement("div");
        fieldDiv.setAttribute('class', 'controls');
        control.appendChild(fieldDiv);

        return [control, fieldDiv];
    }

    getInput() {
        return this.control;
    }

    dispatchInputValueUpdate(processId, inputId, inputValue) {
        document.dispatchEvent(new CustomEvent('WPSInputValueChanged', {
            detail: {
                processId: processId.replaceAll(':','-'),
                inputId: inputId,
                newInputValue: inputValue
            }
        }));
    }

    addError(id, input, text) {
        document.dispatchEvent(new CustomEvent('WPSAddError', {
            detail: {
                id: id,
                input: input,
                text: text
            }
        }));
    }

    removeError(id) {
        document.dispatchEvent(new CustomEvent('WPSRemoveError', {
            detail: {
                id: id
            }
        }));
    }
}
