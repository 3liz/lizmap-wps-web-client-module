import {css, html, LitElement} from 'lit';

class LoadingSpinner extends LitElement {
    static properties = {
        state: {type: String},
        progress: {type: String},
    };

    constructor() {
        super();
    }

    fillSvg() {
        switch (this.state) {
            case "accepted":
            case "running":
                return html`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M208 48a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm0 416a48 48 0 1 1 96 0 48 48 0 1
                        1 -96 0zM48 208a48 48 0 1 1 0 96 48 48 0 1 1 0-96zm368 48a48 48 0 1 1 96 0 48 48 0 1
                        1 -96 0zM75 369.1A48 48 0 1 1 142.9 437 48 48 0 1 1 75 369.1zM75 75A48 48 0 1 1 142.9
                        142.9 48 48 0 1 1 75 75zM437 369.1A48 48 0 1 1 369.1 437 48 48 0 1 1 437 369.1z
                        M369.1 75A48 48 0 1 1 437 142.9 48 48 0 1 1 369.1 75z" fill="#ec9a00"/>
                    </svg>
                `;
            case "successful":
                return html`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M434.8 70.1c14.3 10.4 17.5 30.4 7.1 44.7l-256 352c-5.5 7.6-14 12.3-23.4
                        13.1s-18.5-2.7-25.1-9.3l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0l101.5
                        101.5 234-321.7c10.4-14.3 30.4-17.5 44.7-7.1z" fill="#067506"/>
                    </svg>
                `;
            case "failed":
                return html`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9
                        393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5
                        12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8
                        0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z" fill="#d00"/>
                    </svg>
                `;
            case "dismissed":
                return html`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M55.1 73.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L147.2 256 9.9
                        393.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192.5 301.3 329.9 438.6c12.5
                        12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.8 256 375.1 118.6c12.5-12.5 12.5-32.8
                        0-45.3s-32.8-12.5-45.3 0L192.5 210.7 55.1 73.4z" fill="#454545"/>
                    </svg>
                `;
            default:
                return html`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512">
                        <!--!Font Awesome Free v7.0.0 by @fontawesome - https://fontawesome.com License -
                         https://fontawesome.com/license/free Copyright 2025 Fonticons, Inc.-->
                        <path d="M64 160c0-53 43-96 96-96s96 43 96 96c0 42.7-27.9 78.9-66.5 91.4-28.4
                        9.2-61.5 35.3-61.5 76.6l0 24c0 17.7 14.3 32 32 32s32-14.3 32-32l0-24c0-1.7 .6-4.1
                        3.5-7.3 3-3.3 7.9-6.5 13.7-8.4 64.3-20.7 110.8-81 110.8-152.3 0-88.4-71.6-160-160-160S0
                        71.6 0 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm96 352c22.1 0 40-17.9
                        40-40s-17.9-40-40-40-40 17.9-40 40 17.9 40 40 40z" fill="#454545"/>
                    </svg>
                `;
        }
    }

    render() {
        const state = this.getState();
        let style = '';

        if (state === "running") {
            const progress = this.calculateProgress();
            style = `background: repeating-conic-gradient(#ffa700 0deg ${progress}deg, white ${progress}deg 360deg);`;
        }

        return html`
            <div class="circle ${state}" style="${style}">
                <div class="circle-cache ${state}-cache">
                    ${this.fillSvg()}
                </div>
            </div>
        `;
    }

    getState() {
        if (["accepted", "running", "successful", "failed", "dismissed"].includes(this.state))
            return this.state;
        return "undefined";
    }

    calculateProgress() {
        const progressInt = parseInt(this.progress);
        return (progressInt * 360) / 100;
    }

    static styles = css`
        .circle {
            width: 28px;
            height: 28px;
            border-radius: 250px;
            box-shadow: 0 0 5px 0.5px rgb(0 0 0 / 35%);

            display: flex;
            justify-content: center;
            align-items: center;
        }

        .circle-cache {
            width: 18px;
            height: 18px;
            border-radius: 25px;
            background-color: white;

            display: flex;
            justify-content: center;
            align-items: center;
        }

        svg {
            width: 14px;
            height: 14px;
        }

        .running {
            background: white;
        }

        .successful {
            background: #25c125;
        }

        .failed {
            background: red;
        }

        .dismissed {
            background: grey;
        }

        .undefined {
            background: grey;
        }
    `;
}

customElements.define('job-loading-spinner', LoadingSpinner);
