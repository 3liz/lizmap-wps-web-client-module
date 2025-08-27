export class ApiBasics {

    static async GETMethod(url) {
        return fetch(window.location.origin + url);
    }

    static async POSTMethod(url, dataBody = '') {
        return await fetch(
            window.location.origin + url,
            {
                method: "POST",
                body: dataBody
            });
    }

    static async DELETEMethod(url) {
        return fetch(
            window.location.origin + url,
            {
                method: "DELETE"
            });
    }
}
