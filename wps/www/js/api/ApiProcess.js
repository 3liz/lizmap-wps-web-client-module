import { ApiBasics } from "./ApiBasics";
import { Process } from "../ogc_elements/Process"

export class ApiProcess {

    static PROCESSES_URL;

    /**
     *
     * @returns {Promise<Process[]>}
     */
    static async getAllProcesses() {
        const resp = await ApiBasics.GETMethod(this.PROCESSES_URL);
        const json = await resp.json();

        let listProc = [];

        json.processes.forEach((value) => {
            listProc.push(new Process(value.description, value.id, value.inputs, value.outputs, value.title));
        });

        return listProc;
    }

    /**
     *
     * @param {string} processID
     * @returns {Promise<Process>}
     */
    static async getSpecificProcess(processID) {
        const url = this.PROCESSES_URL +
            '/' +
            processID +
            "?repository=" +
            lizUrls.params.repository +
            "&project=" +
            lizUrls.params.project;

        const resp = await ApiBasics.GETMethod(url);
        const json = await resp.json();

        return new Process(json.description, json.id, json.inputs, json.outputs, json.title);
    }

    /**
     *
     * @param {string} processID
     * @param {string} body
     * @returns {Promise<Response>}
     */
    static async executeProcess(processID, body) {
        const url = this.PROCESSES_URL +
            '/' +
            processID +
            "/execution?repository=" +
            lizUrls.params.repository +
            "&project=" +
            lizUrls.params.project;

        return await ApiBasics.POSTMethod(url, body);
    }

    /**
     *
     * @param {string} url
     */
    static setProccesesUrl(url) {
        this.PROCESSES_URL = url;
    }
}
