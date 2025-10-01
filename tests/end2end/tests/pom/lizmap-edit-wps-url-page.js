export class LizmapEditionWPSURLPage {

    /**
     * Constructor for initializing the editing page about the WPS server URL.
     * @param {import('@playwright/test').Page} page - The page object representing the current browser context.
     */
    constructor(page) {
        this.page = page;
        this.inputFieldPyQGIS_WPSServer = page.locator('#jforms_wps_url_server_manage_pygiswps_server_url');
        this.saveButton = page.locator('#jforms_wps_url_server_manage_submit');
    }

    /**
     * Navigates to the URLs page.
     */
    async goto() {
        await this.page.goto('admin.php/wps/wpsadmin/url/edit');
    }

    /**
     * Fills the PyQGIS WPS server URL input field with the provided URL.
     *
     * @param {string} url - The URL to be filled in the PyQGIS WPS server input field.
     */
    async fillPyQGIS_WPS_URL(url) {
        await this.inputFieldPyQGIS_WPSServer.fill(url);
    }

    /**
     * Performs the action of clicking the save button.
     */
    async save() {
        await this.saveButton.click();
    }

    /**
     * Initializes the URLs for the application by setting up a WPS URL and a Map URL.
     *
     * @param {string} wpsURL - The URL for the Web Processing Service (WPS) server.
     */
    async initializeURLS(wpsURL) {
        await this.goto();

        await this.fillPyQGIS_WPS_URL(wpsURL);

        await this.save();
    }
}
