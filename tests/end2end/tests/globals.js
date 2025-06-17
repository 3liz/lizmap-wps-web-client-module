// @ts-check
import { expect } from '@playwright/test';
import path from 'path';
import { LizmapConnectionPage } from './pom/lizmap-connection-page';

/**
 * Playwright APIResponse
 * @typedef {import('@playwright/test').APIResponse} APIResponse
 */

/**
 * Playwright APIRequestContext
 * @typedef {import('@playwright/test').APIRequestContext} APIRequestContext
 */


/**
 * Performs the authentication steps
 * @param {Page} page The page object
 * @param {string} login The login
 * @param {string} password The password
 * @param {string} user_file The path to the file where the cookies will be stored
 */
export async function authUsingLogin(page, login, password, user_file) {
    const lizmapConnectionPage = new LizmapConnectionPage(page)

    await lizmapConnectionPage.goto();

    await lizmapConnectionPage.connect(login, password);

    await page.waitForURL('index.php');

    // End of authentication steps.
    await page.context().storageState({ path: user_file });
}

/**
 * Get the current file path according the list of given arguments.
 * @returns {string} The final file path
 */
export function playwrightTestFile()   {
    let finalPath = path.join(__dirname);   // eslint-disable-line no-undef
    for (let i = 0; i < arguments.length; i++) {
        finalPath = path.join(finalPath, arguments[i]);
    }
    return finalPath;
}

/**
 * Get the auth storage state path
 * @param {string} name The file name without extension
 * @returns {string} The path to auth storage state path
 */
export function getAuthStorageStatePath(name) {
    return playwrightTestFile('.auth', name + '.json');
}

/**
 * Check for a JSON response
 * @param {APIResponse} response The response object
 * @param {int} status The expected HTTP status code
 * @returns {Promise<any>} The JSON response
 */
export async function checkJson(response, status = 200) {
    if (status < 400){
        expect(response.ok()).toBeTruthy();
    }
    expect(response.status()).toBe(status);
    expect(response.headers()['content-type']).toBe('application/json');
    return await response.json();
}

/**
 * Create a GET request on a given URL
 * @param {APIRequestContext} request Request to use
 * @param {string} url URL to do a GET request on
 * @returns {Promise<APIResponse>} Response
 */
export async function requestGET(request, url) {
    return await request.get(url);
}

/**
 * Create a POST request on a given URL with Body
 * @param {APIRequestContext} request Request to use
 * @param {string} url URL to do a POST request on
 * @param {object} data parameters for the request
 * @returns {Promise<APIResponse>} Response
 */
export async function requestPOSTWithBody(request, url, data) {
    return await request.post(url,
        {
            data: data
        });
}

/**
 * Create a DELETE request on a given URL
 * @param {APIRequestContext} request Request to use
 * @param {string} url URL to do a DELETE request on
 * @returns {Promise<APIResponse>} Response
 */
export async function requestDELETE(request, url) {
    return await request.delete(url);
}
