/**
 * A utility class providing methods for making HTTP requests and verifying their responses.
 */
export class ApiBasics {

    /**
     * Makes an HTTP GET request to the provided URL and verifies the response.
     *
     * @param {string} url - The endpoint URL to make the GET request to.
     * @return {Promise<Object>} - A promise that resolves with the processed and verified response.
     */
    static async GETMethod(url) {
        const request = await fetch(window.location.origin + url);

       return await this.verifyResponse(request);
    }

    /**
     * Makes an HTTP POST request to the specified URL with the provided data body.
     *
     * @param {string} url The endpoint URL to send the POST request to.
     * @param {string} [dataBody=''] The body of the request to be sent, defaults to an empty string.
     * @return {Promise<Object>} A Promise that resolves with the response after being verified.
     */
    static async POSTMethod(url, dataBody = '') {
        const request = await fetch(
            window.location.origin + url,
            {
                method: "POST",
                body: dataBody
            });

        return await this.verifyResponse(request);
    }

    /**
     * Sends an HTTP DELETE request to the specified URL and verifies the response.
     *
     * @param {string} url - The relative URL to which the DELETE request is sent.
     * @return {Promise<Object>} A promise resolving to the verified response.
     */
    static async DELETEMethod(url) {
        const request = await fetch(
            window.location.origin + url,
            {
                method: "DELETE"
            });

        return await this.verifyResponse(request);
    }

    /**
     * Verifies the response object from a given request.
     *
     * @param {Response} request - The request object containing the response data.
     * @return {Promise<Object>} - Returns the parsed response object if valid.
     * @throws {Error} - Throws an error if the response is invalid or the request status indicates a failure.
     */
    static async verifyResponse(request) {
        let response = await request.json();

        if (!response) {
            throw new Error("Wrong WPS Server URL.",);
        } else if (request.status >= 400) {
            throw new Error(response.status + ", " + response.message)
        }

        return response
    }
}
