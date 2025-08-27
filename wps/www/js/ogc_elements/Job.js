export class Job {

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

    getTimes() {
        return {
            "created" : this._created,
            "started" : this._started,
            "expire" : this._expire,
            "finished" : this._finished,
            "updated" : this._updated
        }
    }

    areResultsUp() {
        return this._message === "Task finished";
    }

    getJobID() {
        return this._jobID;
    }

    getMessage() {
        return this._message;
    }

    getProcessID() {
        return this._processID;
    }

    getCleanProcessID() {
        return this._cleanProcessID;
    }

    getProgress() {
        return this._progress;
    }

    getStatus() {
        return this._status;
    }

    getType() {
        return this._type;
    }
}
