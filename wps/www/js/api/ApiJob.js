import {ApiBasics} from "./ApiBasics";
import {Job} from "../ogc_elements/Job"

export class ApiJob {

    static JOBS_URL;

    /**
     *
     * @returns {Promise<object>}
     */
    static async getAllJobs() {
        try {
            const json = await ApiBasics.GETMethod(this.JOBS_URL);

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
        } catch (e) {
            throw e;
        }

    }

    /**
     *
     * @param {string} jobID
     * @returns {Promise<Job>}
     */
    static async getSpecificJob(jobID) {
        try {
            const url = this.JOBS_URL + '/' + jobID;

            const json = await ApiBasics.GETMethod(url);

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
        } catch (e) {
            throw e;
        }

    }

    /**
     *
     * @param {string} jobID
     * @returns {Promise<Response>}
     */
    static getResultOfSpecificJob(jobID) {
        try {
            const url = this.JOBS_URL + '/' + jobID + '/results';

            return ApiBasics.GETMethod(url);
        } catch (e) {
            throw e;
        }
    }

    /**
     *
     * @param {string} jobID
     * @returns {Promise<Response>}
     */
    static async deleteSpecificJob(jobID) {
        try {
            const url = this.JOBS_URL + '/' + jobID;

            return ApiBasics.DELETEMethod(url);
        } catch (e) {
            throw e;
        }
    }

    /**
     *
     * @param {string} url
     */
    static setJobUrl(url) {
        this.JOBS_URL = url;
    }
}
