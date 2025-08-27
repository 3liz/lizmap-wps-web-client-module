import { ApiBasics } from "./ApiBasics";
import { Job } from "../ogc_elements/Job"

export class ApiJob {

    static JOBS_URL;

    /**
     *
     * @returns {Promise<object>}
     */
    static async getAllJobs() {
        const resp = await ApiBasics.GETMethod(this.JOBS_URL);
        const json = await resp.json();

        let listJob = {};

        json.jobs.forEach((value) => {
            listJob[value.jobID] = new Job({
                created: value.created,
                started: value.started,
                expire: value.expire,
                finished: value.finished,
                updated: value.updated,
                jobID: value.jobID,
                message: value.message,
                processID: value.processID,
                progress: value.progress,
                status: value.status,
                type: value.type
            });
        });

        return listJob;
    }

    /**
     *
     * @param {string} jobID
     * @returns {Promise<Job>}
     */
    static async getSpecificJob(jobID) {
        const url = this.JOBS_URL + '/' + jobID;

        const resp = await ApiBasics.GETMethod(url);
        const json = await resp.json();

        return new Job({
            created: json.created,
            started: json.started,
            expire: json.expire,
            finished: json.finished,
            updated: json.updated,
            jobID: json.jobID,
            message: json.message,
            processID: json.processID,
            progress: json.progress,
            status: json.status,
            type: json.type
        });
    }

    /**
     *
     * @param {string} jobID
     * @returns {Promise<Response>}
     */
    static getResultOfSpecificJob(jobID) {
        const url = this.JOBS_URL + '/' + jobID + '/results';

        return ApiBasics.GETMethod(url);
    }

    /**
     *
     * @param {string} jobID
     * @returns {Promise<Response>}
     */
    static deleteSpecificJob(jobID) {
        const url = this.JOBS_URL + '/' + jobID;

        return ApiBasics.DELETEMethod(url);
    }

    /**
     *
     * @param {string} url
     */
    static setJobUrl(url) {
        this.JOBS_URL = url;
    }
}
