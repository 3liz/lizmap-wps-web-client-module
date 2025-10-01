/**
 * The Errors class provides a static interface for managing error messages in the WPS form.
 * It includes methods for adding, removing, and resetting errors, as well as updating the
 * displayed list of errors on the page.
 */
export class Errors {

    /**
     * Configuration object is used to store and manage error-related keys
     * and their corresponding messages for the WPS form.
     *
     * This object is initially empty and can be populated with error messages as needed.
     *
     * @type {{[id: string]: {title: string, text:string}}}
     */
    static ERRORS_ARRAY = {};

    /**
     * Adds an error to the error tracking array and updates the corresponding UI element styles to indicate the error.
     *
     * @param {string} id - The identifier of the element where the error is to be displayed.
     * @param {Object} input - An object containing the error-related properties, including the title.
     * @param {string} text - The text of the error message to be displayed.
     */
    static addError(id, input, text) {
        this.ERRORS_ARRAY[id] = {
            title: input.title,
            text: text
        }
        document.getElementById(id).style.border = "#ff5f5f solid 2px";
        document.getElementById(id).style.backgroundColor = "#fff3f3";

        this.updateError();
    };

    /**
     * Removes an error entry by its identifier and updates the UI to reset styles.
     *
     * @param {string} id The identifier of the error entry to be removed.
     */
    static removeError(id) {
        delete this.ERRORS_ARRAY[id];
        document.getElementById(id).style.border = '';
        document.getElementById(id).style.backgroundColor = '';

        this.updateError();
    };

    /**
     * Resets the errors by clearing the existing error entries and performs an update operation.
     */
    static resetErrors() {
        this.ERRORS_ARRAY = {};

        this.updateError();
    }

    /**
     * Updates the HTML content of an error element with the errors from ERRORS_ARRAY.
     */
    static updateError() {
        const errorHTMLElement = document.getElementById("processing-form-errors");
        errorHTMLElement.innerHTML = '';

        if (Object.keys(this.ERRORS_ARRAY).length < 1) {
            return;
        }

        let div = '<div class="alert alert-error">';
        div += '<ul>';

        Object.values(this.ERRORS_ARRAY).values().forEach((val) => {
            div += `<li>${val.title} input : ${val.text}</li>`;
        });

        div += '</ul>';
        div += '</div>';

        errorHTMLElement.innerHTML = div;
    }
}
