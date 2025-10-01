import {ApiBasics} from "./ApiBasics";
import {Process} from "../ogc_elements/Process"
import {Job} from "../ogc_elements/Job";

/**
 * Provides static methods for interacting with process-related
 * functionalities.
 */
export class ApiProcess {

    /**
     * Value representing the URL used to retrieve process-related information.
     *
     * @type string
     */
    static PROCESSES_URL;

    /**
     * Retrieves a list of all processes.
     *
     * @return {Promise<Process[]>} A promise that resolves to an array of `Process` objects.
     * @throws {Error} Throws an error if the API request or data processing fails.
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
     * Retrieves a specific process by its ID.
     *
     * @param {string} processID - The unique identifier of the process to retrieve.
     * @return {Promise<Process>} Returns a Promise that resolves to an instance of the Process object containing the process details.
     * @throws {Error} Will throw an error if the process retrieval fails.
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
     * Executes a process based on the provided process ID and request body, returning a Job instance.
     *
     * @param {string} processID - The unique identifier of the process to be executed.
     * @param {string} body - The request payload containing specific execution parameters.
     * @return {Promise<Job>} A Promise that resolves to a Job instance representing the executed process.
     * @throws {Error} Will throw an error if the execution fails.
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
     * Sets the URL for processes.
     *
     * @param {string} url - The URL to set for the processes.
     * @return {void}
     */
    static setProccesesUrl(url) {
        this.PROCESSES_URL = url;
    }
}
