export class Process {

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

    setInputValue(inputId, inputValue) {
        this._listInputs[inputId].data = inputValue;
    }

    getAllInputsValues() {
        let res = [];

        for (let value of Object.values(this.getInputs())){
            res.push(value.data);
        }

        return res;
    }

    getAllInputsValuesWithMinOccursGreaterThan0() {
        let res = [];

        for (let [key, value] of Object.entries(this.getInputs())){
            if (value.minOccurs > 0) {
                res.push(value.data);
            }
        }

        return res;
    }

    getDescription() {
        return this._description;
    }

    getId() {
        return this._id;
    }

    getCleanId() {
        return this._cleanID;
    }

    getInputs() {
        return this._listInputs;
    }

    getOutputs() {
        return this._listOutputs;
    }

    getTitle() {
        return this._title;
    }
}
