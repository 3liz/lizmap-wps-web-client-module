export class ApiBasics {

    static async GETMethod(url) {
        const request = await fetch(window.location.origin + url);

       return await this.verifyResponse(request);
    }

    static async POSTMethod(url, dataBody = '') {
        const request = await fetch(
            window.location.origin + url,
            {
                method: "POST",
                body: dataBody
            });

        return await this.verifyResponse(request);
    }

    static async DELETEMethod(url) {
        const request = await fetch(
            window.location.origin + url,
            {
                method: "DELETE"
            });

        return await this.verifyResponse(request);
    }

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
