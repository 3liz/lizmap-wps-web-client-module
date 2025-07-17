// @ts-check
import { test, expect } from '@playwright/test';
import {
    getAuthStorageStatePath,
    checkJson,
    requestGET,
    requestPOSTWithBody,
    requestDELETE
} from "./globals";

const url = "api.php/wps/"

test.describe('Test WPS OGC API', () => {

    test.use({ storageState: getAuthStorageStatePath('admin') });

    test('GET a list of process', async ({ request }) => {
        const response = await requestGET(request, url + "/processes")

        const json = await checkJson(response);

        await expect(json.processes).toBeDefined();
    });

    test('GET a specific process', async ({request }) => {
        const response = await requestGET(request, url + "/processes/model:centroides")

        const json = await checkJson(response);

        await expect(json.id).toEqual("model:centroides");
    });

    test('POST Execute a process', async ({request }) => {
        const response = await requestPOSTWithBody(
            request,
            url +
            "/processes/model:centroides/execution" +
            "?repository=tests"+
            "&project=france_parts",
            JSON.stringify({ "inputs": { "input": "france_parts tuilé en cache", "native:centroids_1:OUTPUT": "job"}})
        )

        const json = await checkJson(response);

        await expect(json["native:centroids_1:OUTPUT"]).toBeDefined();
    });

    test('GET a list of jobs', async ({request }) => {
        const response = await requestGET(request, url + "/jobs")

        const json = await checkJson(response);

        await expect(json.jobs).toBeDefined();
    });

    test('GET a specific job', async ({request }) => {
        const creation = await requestPOSTWithBody(
            request,
            url +
            "/processes/model:centroides/execution" +
            "?repository=tests"+
            "&project=france_parts",
            JSON.stringify({
                "inputs": {
                    "input": "france_parts tuilé en cache",
                    "native:centroids_1:OUTPUT": "pickSpecificJob"
                }
            })
        )
        await checkJson(creation);

        const response = await requestGET(request, url + "/jobs")
        const json = await checkJson(response);

        await expect(json.jobs[0].jobID).toBeDefined();
    });

    test('DELETE a specific job', async ({request }) => {
        const creation = await requestPOSTWithBody(
            request,
            url +
            "/processes/model:centroides/execution" +
            "?repository=tests"+
            "&project=france_parts",
            JSON.stringify({
                "inputs": {
                    "input": "france_parts tuilé en cache",
                    "native:centroids_1:OUTPUT": "jobDelete"
                }
            })
        )
        await checkJson(creation);

        const response = await requestGET(request, url + "/jobs");
        const jobJson = await checkJson(response);

        const jobUUID = jobJson.jobs[0].jobID;

        const deletion = await requestDELETE(request, url + "/jobs/" + jobUUID);
        const deletionJson = await checkJson(deletion);

        await expect(deletionJson.status).toEqual("dismissed");
    });
});
