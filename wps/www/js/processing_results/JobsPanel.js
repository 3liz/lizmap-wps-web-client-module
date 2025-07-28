import {css, html, LitElement} from 'lit';
import {HandleResults} from "./HandleResults";
import {ApiJob} from "../api/ApiJob";
import "./LoadingSpinner";

class JobsPanel extends LitElement {

    static properties = {
        jobArray: {type: Object},
        jobByProcess: {type: Object},
        activeProcesses: {type: Array},
        jobsSelected: {type: Array},
    };

    constructor() {
        super();
        this.jobArray = {};
        this.jobByProcess = {};
        this.jobsSelected = [];
        this.activeProcesses = [];
        this.activeJobByProcesses = {};
        this.results = {};
    }

    processesTemplate(listProcesses) {
        let res = html``;

        for (let process of listProcesses) {
            let jobs = html``;

            if (this.jobByProcess[process].length < 1)
                continue

            for (let jobID of this.jobByProcess[process]) {
                jobs = html`
                    ${jobs}
                    ${this.jobTemplate(jobID)}
                `;
            }

            let titleContent;

            if (this.activeProcesses.includes(process)) {
                titleContent = html`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M201.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8
                         12.5-45.3 0L224 173.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"/>
                    </svg>
                    <p>${process}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M201.4 105.4c12.5-12.5 32.8-12.5 45.3 0l192 192c12.5 12.5 12.5 32.8 0 45.3s-32.8
                         12.5-45.3 0L224 173.3 54.6 342.6c-12.5 12.5-32.8 12.5-45.3 0s-12.5-32.8 0-45.3l192-192z"/>
                    </svg>
                `;
            } else {
                titleContent = html`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8
                        -12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
                    </svg>
                    <p>${process}</p>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M201.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8
                        -12.5-45.3 0L224 338.7 54.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
                    </svg>
                `;
            }

            let nbSelected = this.activeJobByProcesses[process] ? this.activeJobByProcesses[process].length : 0;

            res = html`
                ${res}
                <div id="duo-proc-nbselected-${process}"
                     class="duo-proc-nbselected">
                    <div id="proc-panel-${process}"
                         class="jobs-info-container-process">
                        <div class="jobs-info-container-process-title"
                             @click=${() => this.actionOnProcess(process)}>
                            ${titleContent}
                        </div>
                        <div class="job-element-list">
                            ${jobs}
                        </div>
                    </div>
                    <div id="nbselected-check-${process}"
                         class="nbselected-check">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                            <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                             https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                            <path d="M64 32C28.7 32 0 60.7 0 96L0 416c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7
                             64-64l0-320c0-35.3-28.7-64-64-64L64 32zM308.4 212.7l-80 128c-4.2 6.7-11.4 10.9-19.3
                             11.3s-15.5-3.2-20.2-9.6l-48-64c-8-10.6-5.8-25.6 4.8-33.6s25.6-5.8 33.6 4.8l27 36
                             61.4-98.3c7-11.2 21.8-14.7 33.1-7.6s14.7 21.8 7.6 33.1z" fill="#717171"/>
                        </svg>
                        <h4 id="nbselected-${process}"
                            class="nbselected">
                            ${nbSelected}
                        </h4>
                    </div>
                </div>
            `;
        }

        return res;
    }

    jobTemplate(jobId) {
        const job = this.jobArray[jobId];

        return html`
            <div id="${jobId}"
                 class="job-element"
                 @click=${(e) => this.actionOnJob(e)}>
                <job-loading-spinner state="${job.getStatus()}" progress="${job.getProgress()}"></job-loading-spinner>
                <p>${new Date(job.getTimes()["created"]).toLocaleString()}</p>
            </div>
        `;
    }

    rightPanelTemplate() {
        if (this.jobsSelected.length < 1) {
            return html`
                <h3 id="jobs-info-right-panel-title"
                    class="right-panel-title">
                    Select a Job on the left side
                </h3>
            `;
        } else {
            let jobsHTML = html``;

            for (let jobID of this.jobsSelected) {
                let resultsHTML = html``;
                const job = this.jobArray[jobID];

                if (this.results[jobID]) {
                    for (let [type, values] of Object.entries(this.results[jobID])) {
                        for (let [title, res] of Object.entries(values)) {
                            resultsHTML = html`
                                ${resultsHTML}
                                <tr>
                                    <td class="${type}">${type}</td>
                                    <td class="${type}">${title}</td>
                                    <td class="${type}">${type === "layer" ? html`<i>${res}</i>` : res}</td>
                                </tr>
                            `;
                        }
                    }
                }

                jobsHTML = html`
                    ${jobsHTML}
                    <div id="jobs-info-holder-${jobID}"
                         class="jobs-info-holder">
                        <h3 id="jobs-info-right-panel-title-${jobID}"
                            class="right-panel-title">
                            Job using ${job.getProcessID()}
                        </h3>
                        <p id="jobs-info-uuid-${jobID}"
                           class="uuid">
                            ${jobID}
                        </p>
                        <p id="jobs-info-message-${jobID}"
                           class="message">
                            ${job.getMessage()}
                        </p>
                        <div id="jobs-info-time-${jobID}"
                             class="time">
                            <div id="jobs-info-time-left-column-${jobID}"
                                 class="jobs-info-time-column">
                                <p>
                                    <strong>Created : </strong>${new Date(job.getTimes()["created"]).toLocaleString()}
                                </p>
                                <p>
                                    <strong>Expire : </strong>${new Date(job.getTimes()["expire"]).toLocaleString()}
                                </p>
                            </div>
                            <div id="jobs-info-time-right-column-${jobID}"
                                 class="jobs-info-time-column">
                                <p>
                                    <strong>Updated : </strong>${new Date(job.getTimes()["updated"]).toLocaleString()}
                                </p>
                                <p>
                                    <strong>Finished : </strong>${new Date(job.getTimes()["finished"]).toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <div class="jobs-info-table-container">
                            <table id="jobs-results-${jobID}"
                                   class="results">
                                <thead>
                                <td><b>Type</b></td>
                                <td><b>Title</b></td>
                                <td><b>Result</b></td>
                                </thead>
                                <tbody>
                                ${resultsHTML}
                                </tbody>
                            </table>
                        </div>
                        <div id="jobs-info-logs-${jobID}"
                             class="logs">
                            <h5 id="jobs-info-logs-title-${jobID}"
                                class="logs-title">
                                Job logs
                            </h5>
                            <div id="jobs-info-logs-container-${jobID}"
                                 class="logs-container">
                                <p id="jobs-info-logs-text-${jobID}"
                                   class="logs-text">
                                    No log for the moment
                                </p>
                            </div>
                        </div>
                    </div>
                `;
            }

            return jobsHTML
        }
    }

    render() {
        return html`
            <div id="jobs-info-left-panel">
                <h3 id="jobs-info-left-panel-title">All jobs by processes</h3>
                <div id="jobs-info-container-all-processes">
                    ${this.processesTemplate(Object.keys(this.jobByProcess))}
                </div>
            </div>
            <div id="jobs-info-right-panel">
                ${this.rightPanelTemplate()}
            </div>
        `;
    }

    updated(changedProps) {
        if (changedProps.has('jobsSelected')) {
            for (let [process, jobs] of Object.entries(this.jobByProcess)) {
                this.activeJobByProcesses[process] = [];
                for (let jobID of jobs) {
                    if (this.jobsSelected.includes(jobID)) {
                        this.activeJobByProcesses[process].push(jobID);
                    }
                }
            }
            this.requestUpdate();
        }
    }

    async updatePanel(jobA, jobBP) {
        this.jobArray = jobA;
        this.jobByProcess = jobBP;
        this.requestUpdate();
    }

    async actionOnProcess(process) {
        const el = this.renderRoot.getElementById("proc-panel-" + process);

        if (el.className.includes("active")) {
            el.classList.remove("active");

            this.activeProcesses = this.removeSpecificStringFromArray(this.activeProcesses, process);
        } else {
            el.classList.add("active");

            // Not ".push(..)" so component detects changes and re-render
            this.activeProcesses = this.activeProcesses.concat(process);
        }
    }

    async actionOnJob(event) {
        const el = event.target.closest(".job-element");

        if (el.className.includes("active")) {
            el.classList.remove("active");
            this.jobsSelected = this.removeSpecificStringFromArray(this.jobsSelected, el.id);
            if (this.jobArray[el.id].getStatus() === "successful")
                HandleResults.removeLayer(el.id);
        } else {
            el.classList.add("active");
            this.jobsSelected = this.jobsSelected.concat(el.id);

            if (this.jobArray[el.id].getStatus() === "successful") {
                await this.showResults(this.jobArray[el.id]);
            } else {
                // Empty the results
                delete this.results[el.id];
            }
        }

        this.requestUpdate();
    }

    async showResults(job) {
        let resultJSON = {};
        try {
            if (job.areResultsUp())
                resultJSON = await ApiJob.getResultOfSpecificJob(job.getJobID());
        } catch (e) {
            document.dispatchEvent(new CustomEvent('WPSAddFlashMessage', {
                detail: {
                    message: e,
                    type: "danger",
                    closable: true,
                    duration: 5000
                }
            }));
            console.error(e);
        }
        this.results[job.getJobID()] = HandleResults.showResults(resultJSON, job.getProcessID());
    }

    removeSpecificStringFromArray(array, string) {
        const indexToRemove = array.indexOf(string);
        const left = array.slice(0, indexToRemove);
        const right = array.slice(indexToRemove + 1);

        return left.concat(right);
    }

    static styles = css`
        :host {
            width: 100%;
            font-family: "Trebuchet MS", sans-serif;
            position: relative;
            z-index: 0;

            display: flex;
        }

        #jobs-info-left-panel-title, .right-panel-title {
            margin: 5px auto;
            text-align: center;
        }

        /*
         * Left side
         */

        #jobs-info-left-panel {
            flex: 1;
            height: 100%;
            flex-direction: column;
            user-select: none;
            max-width: 50%;

            display: flex;
            overflow: auto;
        }

        #jobs-info-container-all-processes {
            margin: 10px auto;
            flex-direction: column;
            flex-grow: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            width: 90%;
            max-width: 95%;
        }

        .duo-proc-nbselected {
            width: 100%;
            display: flex;
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
        }

        .nbselected-check {
            display: flex;
            width: 50px;
            max-width: 100px;
            justify-content: space-between;
        }

        .nbselected-check svg {
            min-width: 20px;
            max-width: 20px;
            width: 20px;
        }

        .nbselected {
            min-width: 35px;
            text-align: center;
            margin-left: 5px;
            color: #00000091;
        }

        .jobs-info-container-process {
            height: fit-content;
            margin: 5px 15px;
            font-size: 14px;
            border-radius: 10px;
            background: white;
            max-width: 100%;
            width: 78%;
        }

        .jobs-info-container-process-title {
            cursor: pointer;
            display: flex;
            justify-content: space-between;
            padding: 0 10px;
            border: #606060 solid 2px;
            border-radius: 10px;
            background: #ffffff;
            z-index: 1;
            position: relative;
        }

        .jobs-info-container-process-title:hover {
            transition: 0.15s linear;
            background: #dcdcdc;
        }

        .jobs-info-container-process-title:active {
            background: #c8c8c8;
        }

        .jobs-info-container-process-title > svg {
            margin: auto 10px;
            height: fit-content;
            width: 16px;
        }

        .job-element-list {
            max-height: 150px;
            overflow: auto;
            background: white;
            border-radius: 10px;
            display: none;
        }

        .jobs-info-container-process.active {
            box-shadow: 0 0 5px 0.5px rgb(67 113 140 / 70%);

            .jobs-info-container-process-title {
                border: #43718c solid 2px;
            }

            .job-element-list {
                display: block;
            }
        }

        .job-element {
            font-size: 14px;
            font-weight: bolder;
            cursor: pointer;
            display: flex;
            justify-content: center;
            margin: 15px 25px;
            border-radius: 12px;
            background: #ffffff;
        }

        .job-element:hover {
            background: #dadada;
        }

        .job-element:active {
            background: #d3d3d3;
        }

        .job-element.active {
            background: #d3d3d3;
        }

        .job-element > job-loading-spinner {
            padding: 0 5px;
            margin: auto 10px;
            height: fit-content;
        }


        /*
         * Right side
         */

        #jobs-info-right-panel {
            flex: 1;
            height: 100%;
            max-width: 50%;
            display: flex;
            flex-direction: column;
            overflow: auto;

            border-left: solid black 2px;
        }

        .jobs-info-holder {
            overflow: auto;
            padding-bottom: 15px;
        }

        #jobs-info-right-panel .jobs-info-holder:not(:first-child) {
            padding-top: 15px;
            border-top: solid black 2px;
        }

        .uuid {
            font-size: 14px;
            text-align: center;
            margin: 5px auto;
        }

        .message {
            font-size: 14px;
            text-align: center;
            margin: 5px auto;
        }

        .time {
            width: 90%;
            height: 100px;
            margin: 10px auto;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .jobs-info-time-column {
            flex: 1;
            font-size: 14px;
        }

        .jobs-info-table-container {
            overflow-x: auto;
            width: 90%;
            max-width: 90%;
            margin: auto;
        }

        table {
            font-size: 15px;
            width: 100%;
        }

        thead td {
            background: #dcdcdc;
        }

        td {
            padding: 8px;
        }

        .layer {
            background: #bdd9ff;
        }

        .text {
            background: #c5eccf;
        }

        .logs {
            width: 90%;
            max-width: 90%;
            margin: 10px auto;
            border: black solid 1px;

            display: flex;
            flex-direction: column;
        }

        .logs-title {
            text-align: center;
            border-bottom: black solid 1px;
            padding: 5px 0;
            margin: 0;
        }

        .logs-container {
            overflow: auto;
            flex-grow: 1;
        }

        .logs-text {
            font-size: 13px;
            line-height: 17px;
            font-family: Monaco, Menlo, Consolas, "Courier New", monospace;
            margin: 0;
            padding: 10px;
            text-wrap: nowrap;
        }
    `;
}

customElements.define('jobs-panel', JobsPanel);
