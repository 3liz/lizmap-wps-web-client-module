import {BuildHelper} from "./BuildHelper";

export class ComplexBuildHelper extends BuildHelper {

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
     *
     * @param {HTMLButtonElement} btn
     */
    addEventOnButton(btn) {
        if (btn.className.includes('extent')) {
            this.addDigitizingExtentHandler(btn);
        } else if (btn.className.includes('point')) {
            this.addDigitizingPointHandler(btn);
        }
    }

    /**
     *
     * @param {HTMLButtonElement} btn
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
     *
     * @param {HTMLButtonElement} btn
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

    updateDigitizing() {
        const btn = document.querySelector('#processing-input button.wps-digitizing.active');
        if (btn.className.includes('extent')) {
            this.updateDigitizingExtent(btn);
        } else if (btn.className.includes('point')) {
            this.updateDigitizingPoint(btn);
        }
    }

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
