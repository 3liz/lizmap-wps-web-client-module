export class Errors {

    static ERRORS_ARRAY = {};

    static addError(id, input, text) {
        this.ERRORS_ARRAY[id] = {
            title: input.title,
            text: text
        }
        document.getElementById(id).style.border = "#ff5f5f solid 2px";
        document.getElementById(id).style.backgroundColor = "#fff3f3";

        this.updateError();
    };

    static removeError(id) {
        delete this.ERRORS_ARRAY[id];
        document.getElementById(id).style.border = '';
        document.getElementById(id).style.backgroundColor = '';

        this.updateError();
    };

    static resetErrors() {
        this.ERRORS_ARRAY = {};

        this.updateError();
    }

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

    static hasError() {
        return Object.keys(this.ERRORS_ARRAY).length > 0;
    }
}
