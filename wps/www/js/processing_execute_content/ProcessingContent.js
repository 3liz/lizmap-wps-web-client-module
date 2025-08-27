import { LiteralData } from "./LiteralData";
import { BoundingboxData } from "./BoundingboxData";
import { ComplexData } from "./ComplexData";

export class ProcessingContent {

    /**
     *
     * @param {object} inputJSON
     * @returns {HTMLElement[]}
     * @constructor
     */
    static GetProcessingForm(inputJSON) {
        let listInput = [];

        for (const [key, value] of Object.entries(inputJSON)) {
            let minOccurs = value.minOccurs;

            do {
                let HTMLElement = null;
                switch (value.typeHint) {
                    case "literalData":
                        HTMLElement = new LiteralData(key, value, minOccurs);
                        HTMLElement = HTMLElement.getInput();
                        break;
                    case "boundingboxData":
                        HTMLElement = new BoundingboxData(key, value, minOccurs);
                        HTMLElement = HTMLElement.getInput();
                        break;
                    case "complexData":
                        HTMLElement = new ComplexData(key, value, minOccurs);
                        HTMLElement = HTMLElement.getInput();
                        break;
                    default:
                        console.error("TypeHint " + value.typeHint + " not supported.");
                }
                if (HTMLElement && value.minOccurs > 0) {
                    const label = HTMLElement.querySelector("label");
                    label.classList.add('jforms-required');
                    const span = document.createElement('span');
                    span.classList.add('jforms-required-star');
                    span.appendChild(document.createTextNode("* "));
                    label.appendChild(span);
                }
                listInput.push(HTMLElement);
                minOccurs -= 1;
            } while (minOccurs >= 1);
        }

        return listInput;
    }
}
