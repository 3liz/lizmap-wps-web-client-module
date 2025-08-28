/**
 * The HandleResults class provides methods to handle and display WPS results on the map.
 */
export class HandleResults {
    /**
     * Represents the state of the WPS external group mapping.
     */
    static extGroupMapState;

    /**
     * Processes the provided JSON object to differentiate between "text" and "layer" types
     * and handles layers based on their properties. Returns a structured result.
     *
     * @param {Object} json - The input JSON object containing data to be processed.
     * @param {string} processID - The identifier for the processing operation.
     * @return {{text: {[key: string]: string}, layer: {[key: string]: "On the map"}}} - Results object.
     */
    static showResults(json, processID) {
        let res = {
            "text": {},
            "layer": {}
        };

        for (let [key, value] of Object.entries(json)) {
            if (value.href) {
                this.handleLayerType(key , value.href, value.type, processID);
                const layerName = this.getQueryParam(value.href, "layers");
                res["layer"][layerName] = "On the map";
            } else {
                res["text"][key] = value;
            }
        }

        return res;
    }

    /**
     * Handles the creation and addition of a new WMS layer to the map based on the provided layer type and other parameters.
     *
     * @param {string} key - The key identifying the specific layer.
     * @param {string} link - The URL link containing layer information including WMS parameters.
     * @param {string} type - The type of layer.
     * @param {string} processID - The process identifier.
     */
    static handleLayerType(key, link, type, processID) {
        if (type !== "application/x-ogc-wms") {
            console.error(type + " not supported.");
            return;
        }

        let formatedLink = window.location.origin + "/index.php/wps/ows?MAP=" + this.getQueryParam(link, "MAP");

        const map = lizMap.map;
        const wmsTitle = processID.split(':').reverse()[0];
        const layerParam = this.getQueryParam(link, "layers");
        const layerName = this.getUuidFromLink(link) + '-' + key.replaceAll(':', '_').replaceAll(' ', '_');

        const layerWmsParams = {
            version: '1.3.0'
            , layers: layerParam
            , styles: ''
            , crs: (map.getProjection() !== 'EPSG:900913') ? map.getProjection() : 'EPSG:3857'
            , format: 'image/png'
            , transparent: 'true'
            , exceptions: 'application/vnd.ogc.se_inimage'
            , dpi: 96
        };

        const wmsLayer = new lizMap.ol.layer.Image({
            source: new lizMap.ol.source.ImageWMS({
                url: formatedLink,
                params: layerWmsParams,
                ratio: 1,
                serverType: 'qgis',
            }),
            properties: {
                wpsLayerName: layerName,
                wmsTitle: wmsTitle + ' ' + layerParam,
            }
        });

        if (!this.extGroupMapState) {
            this.extGroupMapState = lizMap.mainLizmap.state.rootMapGroup.createExternalGroup('WPS Results');
        }
        const extLayer = this.extGroupMapState.addOlLayer(layerName, wmsLayer);
        extLayer.icon = 'data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE2IiB2aWV3Qm94PSIwIDAgMjQgMjQiIHdpZHRoPSIxNiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJtMTEuMTU4IDEuNS0uODAzIDIuMjM0LjAxMi4xMy4zOSAxLjk0LTIuMjYuOTM0LTEuMDk1LTEuNjQ2LS4wODQtLjA5OC0yLjE0OC0xLjAxNC0xLjE5IDEuMTkgMS4wMTQgMi4xNDguMDk4LjA4NCAxLjY0NiAxLjA5Ni0uOTM1IDIuMjU4LTEuOTQtLjM5LS4xMy0uMDEtMi4yMzMuODAydjEuNjg0bDIuMjM0LjgwMy4xMy0uMDEyIDEuOTQtLjM5LjkzNCAyLjI2LTEuNjQ2IDEuMDk1LS4wOTguMDg0LTEuMDE0IDIuMTQ4IDEuMTkgMS4xOSAyLjE0OC0xLjAxNC4wODQtLjA5OCAxLjA5Ni0xLjY0NiAyLjI1OC45MzUtLjM5IDEuOTQtLjAxLjEzLjgwMiAyLjIzM2gxLjY4NGwuODAzLTIuMjM0LS4wMTItLjEzLS4zOS0xLjk0IDIuMjYtLjkzNCAxLjA5NSAxLjY0Ni4wODQuMDk4IDIuMTQ4IDEuMDE0IDEuMTktMS4xOS0xLjAxNC0yLjE0OC0uMDk4LS4wODQtMS42NDYtMS4wOTYuOTM1LTIuMjU4IDEuOTQuMzkuMTMuMDEgMi4yMzMtLjgwMnYtMS42ODRsLTIuMjM0LS44MDMtLjEzLjAxMi0xLjk0LjM5LS45MzQtMi4yNiAxLjY0Ni0xLjA5NS4wOTgtLjA4NCAxLjAxNC0yLjE0OC0xLjE5LTEuMTktMi4xNDggMS4wMTQtLjA4NC4wOTgtMS4wOTYgMS42NDYtMi4yNTgtLjkzNS4zOS0xLjk0LjAxLS4xMy0uODAyLTIuMjMzem0uODQyIDhhMi41IDIuNSAwIDAgMSAyLjUgMi41IDIuNSAyLjUgMCAwIDEgLTIuNSAyLjUgMi41IDIuNSAwIDAgMSAtMi41LTIuNSAyLjUgMi41IDAgMCAxIDIuNS0yLjV6IiBmaWxsPSIjOThiNWQ4IiBzdHJva2U9IiM0NTdhYmUiLz48L3N2Zz4K';

        let urlParsed = link.split("/");
        let serviceUrl = "";
        for (let i = 3; i < urlParsed.length; i++) {
            serviceUrl += '/' + urlParsed[i];
        }
    }

    /**
     * Removes the layer(s) from the map state that match the given UUID.
     *
     * @param {string} uuid - The unique identifier to match layers for removal.
     */
    static removeLayer(uuid) {
        const layersToRemove = [];

        if (this.extGroupMapState) {
            for (const extLayer of this.extGroupMapState.getChildren()) {
                const wpsLayerName = extLayer.olLayer.get('wpsLayerName');
                if (wpsLayerName.startsWith(uuid)) {
                    layersToRemove.push(extLayer.name);
                }
            }
        }

        for (const layerName of layersToRemove) {
            this.extGroupMapState.removeOlLayer(layerName);
        }
    }

    /**
     * Extracts the value of a specific query parameter from the provided URL.
     *
     * @param {string} url - The URL containing the query parameters.
     * @param {string} key - The name of the query parameter to retrieve the value for.
     * @return {string|undefined} The value of the specified query parameter if it exists,
     * or undefined if the parameter is not found.
     */
    static getQueryParam(url, key) {
        const queryStartPos = url.indexOf('?');
        if (queryStartPos === -1) {
            return;
        }
        const params = url.substring(queryStartPos + 1).split('&');
        for (let i = 0; i < params.length; i++) {
            const pairs = params[i].split('=');
            if (decodeURIComponent(pairs.shift()).toLowerCase() === key.toLowerCase()) {
                return decodeURIComponent(pairs.join('='));
            }
        }
    }

    /**
     * Extracts the UUID from a given link string containing the "wps-results:" prefix.
     *
     * @param {string} link - The link string from which the UUID is to be extracted.
     * @return {string} The extracted UUID from the provided link.
     */
    static getUuidFromLink(link) {
        let uuid = link.split("wps-results:")[1];
        return uuid.split('/')[0];
    }
}
