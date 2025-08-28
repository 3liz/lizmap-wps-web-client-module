/**
 * First class used to build form entries
 */
export class BuildHelper {

    /**
     * Creates a first part for entries (label + container).
     * @param {string} id - Entry id.
     * @param {Object} input - Input object.
     * @param {number} occurrence - Current occurrence (minOccurs).
     * @return {BuildHelper} An instance of the entry.
     */
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

    /**
     * Builder for the first part of the entry (label + container).
     *
     * @param {string} id - Formatted entry ID.
     * @param {string} title - Input title.
     * @return {HTMLDivElement[]} - Label and Container.
     */
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

    /**
     * Retrieves the entire input.
     *
     * @return {HTMLElement} The control object that represents the current input.
     */
    getInput() {
        return this.control;
    }

    /**
     * Emits an event to update input value.
     *
     * @param {string} processId - Process ID, the one that will have a value updated.
     * @param {string} inputId - Entry ID.
     * @param {string} inputValue - Value to be updated.
     */
    dispatchInputValueUpdate(processId, inputId, inputValue) {
        document.dispatchEvent(new CustomEvent('WPSInputValueChanged', {
            detail: {
                processId: processId.replaceAll(':','-'),
                inputId: inputId,
                newInputValue: inputValue
            }
        }));
    }

    /**
     * Dispatches a custom event named 'WPSAddError' with error details.
     *
     * @param {string} id - The unique identifier for the error.
     * @param {Object} input - An object containing the error-related properties.
     * @param {string} text - The error message or description.
     */
    addError(id, input, text) {
        document.dispatchEvent(new CustomEvent('WPSAddError', {
            detail: {
                id: id,
                input: input,
                text: text
            }
        }));
    }

    /**
     * Dispatches a custom event named 'WPSRemoveError' with error details.
     *
     * @param {string} id - The unique identifier for the error to be removed.
     */
    removeError(id) {
        document.dispatchEvent(new CustomEvent('WPSRemoveError', {
            detail: {
                id: id
            }
        }));
    }
}
