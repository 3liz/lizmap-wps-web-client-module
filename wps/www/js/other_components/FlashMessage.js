export class FlashMessage {

    constructor(message, type, closable, duration) {

        this.uuid = window.crypto.randomUUID();

        this.close = closable ? "closable" : "";

        this.html = `
        <div id="flash-message-${this.uuid}" class="flash-message ${this.close}">
            <p class="flash-message-text type-${type}">
                ${message}
            </p>
            <div class="timer-bar-holder type-${type}">
                <div class="timer-bar-scroller type-${type}"></div>
            </div>
        </div>
    `

        document.getElementById("message").insertAdjacentHTML("beforeend", this.html);

        this.element = document.getElementById(`flash-message-${this.uuid}`);

        if (closable) {
            this.element.addEventListener("click", () => {
                this.removeElement();
            });
        }

        const timeBar = this.element.querySelector(".timer-bar-scroller");

        timeBar.style.transition = "linear";
        timeBar.style.transitionDuration = `${duration}ms`;

        // setTimeout so the time bar is not initialized at 0%
        setTimeout(() => {
            timeBar.style.width = `0%`;
        }, 50)
    }

    getId() {
        return `flash-message-${this.uuid}`;
    }

    removeElement() {
        const closeAnimationDuration = 500;

        this.element.style.transition = "ease";
        this.element.style.transitionDuration = `${closeAnimationDuration}ms`;
        this.element.style.opacity = `0%`;

        setTimeout(() => {
            this.element.remove();
        }, closeAnimationDuration)
    }
}
