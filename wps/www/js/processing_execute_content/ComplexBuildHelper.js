import {BuildHelper} from "./BuildHelper";

/**
 * First class used to build `boundingBoxData` and `complexData` form entries
 *
 * @extends {BuildHelper}
 */
export class ComplexBuildHelper extends BuildHelper {

    /**
     * Creates a second part for entries (CRS selector + drawing button).
     * @param {string} id - Entry id.
     * @param {Object} input - Input object.
     * @param {number} occurrence - Current occurrence (minOccurs).
     * @return {ComplexBuildHelper} An instance of the entry.
     */
    constructor(id, input, occurrence) {
        super(id, input, occurrence);

        const values = this.partialPartBuilder(
            id.replaceAll(':', '-'),
            input
        );

        this.selectorCRS = values[0];
        this.btn = values[1];
    }

    // *----------------------------------------*
    // | Complex & Extent partial input builder |
    // *----------------------------------------*

    /**
     * Builder for the second part of some entries (CRS selector + drawing button).
     *
     * @param {string} id - Formatted entry ID.
     * @param {Object} input - Input object.
     * @return {HTMLDivElement[]} - CRS selector and drawing button.
     */
    partialPartBuilder(id, input) {

        // Defined the field
        const field = document.createElement("input");
        field.title = input.title;
        field.id = 'processing-input-' + id + '-' + this.occurrence;
        field.name = id;
        this.fieldDiv.appendChild(field);

        const qgisType = input.metadata.find(item => item.title === "processing:type")?.href;

        // Add a simple class
        field.setAttribute('class', 'qgisType-' + qgisType);

        // Add select for CRS project and map
        const selectorCRS = document.createElement("select");
        selectorCRS.id = 'processing-input-' + id + '-select-' + this.occurrence;
        selectorCRS.setAttribute('class', 'span1 wps-digitizing extent');

        const optionProject = document.createElement("option");
        optionProject.value = lizMap.config.options.qgisProjectProjection.ref;
        optionProject.label = lizMap.config.options.qgisProjectProjection.ref.split(':')[1];
        selectorCRS.appendChild(optionProject);

        const optionMap = document.createElement("option");
        optionMap.value = lizMap.config.options.projection.ref;
        optionMap.label = lizMap.config.options.projection.ref.split(':')[1];
        selectorCRS.appendChild(optionMap);

        // Add a button to draw the extent
        const btn = document.createElement("button");
        btn.id = 'processing-input-' + id + '-btn-' + this.occurrence;
        btn.setAttribute('class', 'btn btn-mini wps-digitizing wkt ' + qgisType);
        btn.innerHTML = 'Drawing ' + qgisType;

        btn.addEventListener("click", (e) => {
            this.addEventOnButton(btn);
        });

        lizMap.mainEventDispatcher.addListener(
            () => this.updateDigitizing(),
            ['digitizing.featureDrawn']
        );

        return [selectorCRS, btn];
    }

    // *---------------------------------*
    // | Utils functions to help builder |
    // *---------------------------------*

    /**
     * Adds an event handler to the provided button based on its class name.
     *
     * @param {HTMLButtonElement} btn - The button element to which the event handler will be added.
     *                             The class name of the button determines the type of handler added.
     */
    addEventOnButton(btn) {
        if (btn.className.includes('extent')) {
            this.addDigitizingExtentHandler(btn);
        } else if (btn.className.includes('point')) {
            this.addDigitizingPointHandler(btn);
        }
    }

    /**
     * Toggles the digitizing extent handler by activating or deactivating it based on the button's state.
     *
     * @param {HTMLButtonElement} btn - The button element used to toggle the digitizing extent handler.
     */
    addDigitizingExtentHandler(btn) {
        if (btn.className.includes('active')) {
            lizMap.mainLizmap.digitizing.toolSelected = 'deactivate';
            btn.classList.remove('active');
        } else {
            btn.classList.remove('active');
            lizMap.mainLizmap.digitizing.toolSelected = 'box';
            btn.classList.add('active');
        }
    }

    /**
     * Toggles the digitizing tool to handle point selection. Activates or deactivates the tool based on the current
     * state of the button.
     *
     * @param {HTMLButtonElement} btn - The button element that triggers the digitizing point handler.
     */
    addDigitizingPointHandler(btn) {
        if (btn.className.includes('active')) {
            lizMap.mainLizmap.digitizing.toolSelected = 'deactivate';
            btn.classList.remove('active');
        } else {
            btn.classList.remove('active');
            lizMap.mainLizmap.digitizing.toolSelected = 'point';
            btn.classList.add('active');
        }
    }

    /**
     * Updates the digitizing process based on the currently active button and its class.
     */
    updateDigitizing() {
        const btn = document.querySelector('#processing-input button.wps-digitizing.active');
        if (btn.className.includes('extent')) {
            this.updateDigitizingExtent(btn);
        } else if (btn.className.includes('point')) {
            this.updateDigitizingPoint(btn);
        }
    }

    /**
     * Updates the digitizing extent based on user interaction with the active button
     * and synchronizes the geometry bounds with the appropriate projection.
     *
     * @param {HTMLButtonElement} activeBtn The button element that triggered the update.
     */
    updateDigitizingExtent(activeBtn) {
        const select = activeBtn.previousSibling;
        const feat = lizMap.mainLizmap.digitizing.featureDrawn.at(-1);
        feat.set('text', select.title);
        const bounds = lizMap.ol.extent.applyTransform(
            feat.getGeometry().getExtent(),
            lizMap.ol.proj.getTransform(
                lizMap.ol.proj.get(lizMap.mainLizmap.projection),
                lizMap.ol.proj.get(select.value)
            )
        );
        activeBtn.parentElement.firstChild.value = bounds.join(',') + ' (' + select.value + ')';
        activeBtn.parentElement.firstChild.dispatchEvent(new Event('blur'));
        if (lizMap.mainLizmap.digitizing.featureDrawn.length > 1) {
            lizMap.mainLizmap.digitizing._eraseFeature(lizMap.mainLizmap.digitizing.featureDrawn.at(0));
        }
    }

    /**
     * Updates the digitizing point based on the provided active button.
     *
     * @param {HTMLButtonElement} activeBtn The active button element triggering the update.
     */
    updateDigitizingPoint(activeBtn) {
        const select = activeBtn.previousSibling;
        const feat = lizMap.mainLizmap.digitizing.featureDrawn.at(-1);
        feat.set('text', select.title);
        activeBtn.parentElement.firstChild.value = '{ "geometry": ' +
            (new lizMap.ol.format.GeoJSON()).writeGeometry(
                feat.getGeometry(),
                {featureProjection: lizMap.mainLizmap.projection, dataProjection: select.value}
            ) + ',  "crs": { "type": "name", "properties": { "name": "' + select.value + '" } } }';
        activeBtn.parentElement.firstChild.dispatchEvent(new Event('blur'));
        if (lizMap.mainLizmap.digitizing.featureDrawn.length > 1) {
            lizMap.mainLizmap.digitizing._eraseFeature(lizMap.mainLizmap.digitizing.featureDrawn.at(0));
        }
    }
}
