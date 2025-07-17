# Testing Lizmap Web Client WPS module

## Run docker compose

Steps

- Launch  with  docker compose

```bash
# Clean previous versions (optional)
make clean

# Run the different services
make run

# Install the wps module (default version is lizmap web client 3.8)
make install-module
# Set Lizmap ACL
make import-lizmap-acl
```

- Open your browser at http://localhost:9090

## Environment

Use the `make env` command with some specific versions :

* [Lizmap Web Client tags](https://hub.docker.com/r/3liz/lizmap-web-client/tags)
* [QGIS Server tags](https://hub.docker.com/r/3liz/qgis-map-server/tags)

```
make env LIZMAP_VERSION_TAG=<lizmap_version_tag> QGIS_VERSION_TAG=<qgis_version_tag>
docker compose up -V --force-recreate [-d]
```

Stop and clean the stack with:
```
docker compose down -v
```


Open your browser at http://localhost:9090


For more information, refer to the [docker compose documentation](https://docs.docker.com/compose/)

## End-to-End tests with Playwright for API

The `end2end` directory contains some end-to-end tests made for Playwright.
Go in `end2end` directory and execute `npm install` to install Playwright (only the first time).

### Playwright

You have to install the browsers with npx playwright install (only the first time or after an update) You can then :

* `npx playwright test --ui --project=chromium` to open a UI as in Cypress which ease testing
* `npx playwright test` to execute all tests with all browsers
* `npx playwright test --project=chromium` to execute all tests with the Chromium browser
