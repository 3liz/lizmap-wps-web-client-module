/**
 * A FlashMessage class to create and manage temporary notification UI elements.
 */
export class FlashMessage {

    /**
     * Creates an instance of a FlashMessage.
     *
     * @param {string} message - The message text to be displayed.
     * @param {"info" | "success" | "danger"} type - The type of the message.
     * @param {boolean} closable - Determines if the message should be manually closable by the user.
     * @param {number} duration - Duration in milliseconds for how long the message should remain
     * visible before disappearing.
     * @return {FlashMessage} An instance of the FlashMessage.
     */
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

    /**
     * Retrieves the unique identifier for the flash message.
     *
     * @return {string} The unique identifier in the format `flash-message-<uuid>`.
     */
    getId() {
        return `flash-message-${this.uuid}`;
    }

    /**
     * Removes the specified element from the DOM after applying a fade-out animation.
     * The element's opacity is reduced to 0% over a specified duration before it is removed.
     */
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
