import {ApiBasics} from "./ApiBasics";
import {Process} from "../ogc_elements/Process"
import {Job} from "../ogc_elements/Job";

export class ApiProcess {

    static PROCESSES_URL;

    /**
     *
     * @returns {Promise<Process[]>}
     */
    static async getAllProcesses() {
        try {
            const json = await ApiBasics.GETMethod(this.PROCESSES_URL);

            let listProc = [];

        json.processes.forEach((value) => {
            listProc.push(new Process(value.description, value.id, value.inputs, value.outputs, value.title));
        });

            return listProc;
        } catch (e) {
            throw e;
        }
    }

    /**
     *
     * @param {string} processID
     * @returns {Promise<Process>}
     */
    static async getSpecificProcess(processID) {
        try {
            const url = this.PROCESSES_URL +
                '/' +
                processID +
                "?repository=" +
                lizUrls.params.repository +
                "&project=" +
                lizUrls.params.project;

            const json = await ApiBasics.GETMethod(url);

            return new Process(json.description, json.id, json.inputs, json.outputs, json.title);
        } catch (e) {
            throw e;
        }
    }

    /**
     *
     * @param {string} processID
     * @param {string} body
     * @returns {Promise<Response>}
     */
    static async executeProcess(processID, body) {
        try {
            const url = this.PROCESSES_URL +
                '/' +
                processID +
                "/execution?repository=" +
                lizUrls.params.repository +
                "&project=" +
                lizUrls.params.project;

            let jobJSON = await ApiBasics.POSTMethod(url, body);

            return new Job(
                {
                    created: jobJSON.created,
                    updated: jobJSON.updated,
                    jobID: jobJSON.jobID,
                    links: jobJSON.links,
                    message: jobJSON.message,
                    processID: jobJSON.processID,
                    progress: jobJSON.progress,
                    status: jobJSON.status,
                    type: jobJSON.type,
                }
            );
        } catch (e) {
            throw e;
        }
    }

    /**
     *
     * @param {string} url
     */
    static setProccesesUrl(url) {
        this.PROCESSES_URL = url;
    }
}
