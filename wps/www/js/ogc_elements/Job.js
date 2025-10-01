/**
 * Represents a Job object with various properties and methods to access its details.
 */
export class Job {

    /**
     * Creates a Job object with the provided options.
     *
     * @param {Object} options - The options for initializing the Job.
     * @param {string} options.created - The creation timestamp of the Job.
     * @param {string} [options.started] - The start timestamp of the process.
     * Defaults to an empty string if not provided.
     * @param {string} [options.expire] - The expiration timestamp of the Job.
     * Defaults to an empty string if not provided.
     * @param {string} [options.finished] - The finished timestamp of the process.
     * Defaults to an empty string if not provided.
     * @param {string} options.updated - The last updated timestamp of the Job.
     * @param {string} options.jobID - The unique identifier for the job.
     * @param {string} options.message - The message providing additional details.
     * @param {string} options.processID - The process ID associated with the job.
     * @param {number} options.progress - The progress percentage of the job.
     * @param {string} options.status - The current status of the Job.
     * @param {string} options.type - The type of the Job.
     * @return {Job} An instance of the Job.
     */
    constructor(options) {
        this._created = options.created;
        this._started = options.started ? options.started : '';
        this._expire = options.expire ? options.expire : '';
        this._finished = options.finished ? options.finished : '';
        this._updated = options.updated;

        this._jobID = options.jobID;

        this._message = options.message;

        this._processID = options.processID;
        this._cleanProcessID = options.processID.replaceAll(':', '-');

        this._progress = options.progress;

        this._status = options.status;

        this._type = options.type;
    }

    /**
     * Retrieves an object containing various timestamps related to the current Job.
     *
     * @return {{created: string, started: string, expire: string, finished: string, updated: string}}
     * An object with the following properties:
     * - created: The timestamp when the Job was created.
     * - started: The timestamp when the Job was started.
     * - expire: The timestamp indicating when the Job will expire.
     * - finished: The timestamp when the Job was finished.
     * - updated: The timestamp when the Job was last updated.
     */
    getTimes() {
        return {
            "created" : this._created,
            "started" : this._started,
            "expire" : this._expire,
            "finished" : this._finished,
            "updated" : this._updated
        }
    }

    /**
     * Determines if the results are available.
     *
     * @return {string} The URL of the result link.
     */
    areResultsUp() {
        return this._message === "Task finished";
    }

    /**
     * Retrieves the job ID associated with this Job.
     *
     * @return {string} The job ID.
     */
    getJobID() {
        return this._jobID;
    }

    /**
     * Retrieves the message stored in the Job.
     *
     * @return {string} The message associated with the Job.
     */
    getMessage() {
        return this._message;
    }

    /**
     * Retrieves the process ID associated with the current Job.
     *
     * @return {string} The ID of the process.
     */
    getProcessID() {
        return this._processID;
    }

    /**
     * Retrieves the clean process ID, without `:`.
     *
     * @return {string} The clean process ID associated with the Job.
     */
    getCleanProcessID() {
        return this._cleanProcessID;
    }

    /**
     * Retrieves the current progress value.
     *
     * @return {number} The current progress, represented as a numeric value.
     */
    getProgress() {
        return this._progress;
    }

    /**
     * Retrieves the current status.
     *
     * @return {string} The current status value.
     */
    getStatus() {
        return this._status;
    }

    /**
     * Retrieves the type of the Job.
     *
     * @return {string} The type associated with the Job.
     */
    getType() {
        return this._type;
    }
}
