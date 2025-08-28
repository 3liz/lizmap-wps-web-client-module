import {ApiBasics} from "./ApiBasics";
import {Job} from "../ogc_elements/Job"

/**
 * A class that provides methods to interact with job-related APIs.
 */
export class ApiJob {

    /**
     * Value representing the URL used to retrieve job-related information.
     *
     * @type {string}
     */
    static JOBS_URL;

    /**
     * Retrieves all jobs using an API call and returns a collection of job objects.
     *
     * @return {Promise<{ [JobID: string]: Job }>} A promise that resolves to an object containing job details,
     * where each key corresponds to a jobID and the value is an instance of the Job class.
     * @throws {Error} Will throw an error if the API call fails.
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
     * Retrieves a specific job by its ID.
     *
     * @param {string} jobID The unique identifier of the job to fetch.
     * @return {Promise<Job>} A promise that resolves to a Job instance containing job details.
     * @throws {Error} Will throw an error if the operation fails.
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
     * Fetches the result of a specific job with the given job ID.
     *
     * @param {string} jobID - The unique identifier of the job whose result is to be retrieved.
     * @return {Promise<{ [Output: string]: Object }>} The result of the specific job retrieved from the server.
     * @throws {Error} Throws an error if the operation fails.
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
     * Deletes a specific job given its job ID.
     *
     * @param {string} jobID - The unique identifier of the job to be deleted.
     * @return {Promise<Object>} A promise resolving to the response from the API after the job deletion.
     * @throws {Error} Throws an error if the operation fails.
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
     * Sets the job URL to the specified value.
     *
     * @param {string} url - The URL to be set as the job URL.
     */
    static setJobUrl(url) {
        this.JOBS_URL = url;
    }
}
