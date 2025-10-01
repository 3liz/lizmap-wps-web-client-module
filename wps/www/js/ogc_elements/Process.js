/**
 * The Process class represents a generic WPS process.
 */
export class Process {

    /**
     * Creates a Process object with the specified parameters.
     *
     * @param {string} description - The description of the Process.
     * @param {string} id - The unique identifier for the Process.
     * @param {{[key: string]: Object}} listInputs - The input elements of the Process.
     * Each input will have its processId set and data initialized.
     * @param {{[key: string]: Object}} listOutputs - The output elements of the Process.
     * @param {string} title - The title of the Process.
     * @return {Process} An instance of the Process.
     */
    constructor(description, id, listInputs, listOutputs, title) {

        this._description = description;
        this._id = id;
        this._cleanID = id.replaceAll(':', '-');

        if (listInputs !== undefined) {
            for (const value of Object.values(listInputs)) {
                value.processId = this.getId();
                value.data = '';
            }
        }

        this._listInputs = listInputs;
        this._listOutputs = listOutputs;
        this._title = title;
    }

    /**
     * Sets the value of an input field identified by the specified inputId.
     *
     * @param {string} inputId - The unique identifier of the input field to be updated.
     * @param {string} inputValue - The value to set for the specified input field.
     */
    setInputValue(inputId, inputValue) {
        this._listInputs[inputId].data = inputValue;
    }

    /**
     * Retrieves the values of all input fields managed by the system.
     * Iterates over the inputs, extracting their data and aggregating them into a single array.
     *
     * @return {string[]} An array containing the data values of all inputs.
     */
    getAllInputsValues() {
        let res = [];

        for (let value of Object.values(this.getInputs())){
            res.push(value.data);
        }

        return res;
    }

    /**
     * Retrieves all input values where the `minOccurs` property is greater than 0.
     *
     * Iterates over the inputs and collects the data of those inputs
     * whose `minOccurs` property is greater than 0.
     *
     * @return {string[]} An array containing the data of inputs with `minOccurs` greater than 0.
     */
    getAllInputsValuesWithMinOccursGreaterThan0() {
        let res = [];

        for (let [key, value] of Object.entries(this.getInputs())){
            if (value.minOccurs > 0) {
                res.push(value.data);
            }
        }

        return res;
    }

    /**
     * Retrieves the description associated with this process.
     *
     * @return {string} The description value.
     */
    getDescription() {
        return this._description;
    }

    /**
     * Retrieves the unique identifier associated with the current process.
     *
     * @return {string} The unique identifier of the process.
     */
    getId() {
        return this._id;
    }

    /**
     * Retrieves the clean ID of the object, without `:`.
     *
     * @return {string} The clean ID associated with the Process.
     */
    getCleanId() {
        return this._cleanID;
    }

    /**
     * Retrieves the list of input elements stored in the internal property.
     *
     * @return {{[key: string]: Object}} An array containing the input elements.
     */
    getInputs() {
        return this._listInputs;
    }

    /**
     * Retrieves the list of outputs.
     *
     * @return {{[key: string]: Object}} An array containing the outputs.
     */
    getOutputs() {
        return this._listOutputs;
    }

    /**
     * Retrieves the title of the current instance.
     *
     * @return {string} The title associated with this instance.
     */
    getTitle() {
        return this._title;
    }
}
