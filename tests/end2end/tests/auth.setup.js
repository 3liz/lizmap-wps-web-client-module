import { test as setup } from '@playwright/test';
import { authUsingLogin, getAuthStorageStatePath } from './globals';
import {LizmapEditionWPSURLPage} from "./pom/lizmap-edit-wps-url-page";

async function initializeServersURLs(page, wps, map) {
    const lizmapEditionWPS_URL_Page = new LizmapEditionWPSURLPage(page);
    await lizmapEditionWPS_URL_Page.initializeURLS(wps, map);
}

setup('authenticate as admin and add map', async ({ page }) => {
    const WPS_URL = "http://tests-wps-1:8080/";

    await authUsingLogin(page, 'admin', 'admin', getAuthStorageStatePath('admin'));
    await initializeServersURLs(page, WPS_URL);
});
