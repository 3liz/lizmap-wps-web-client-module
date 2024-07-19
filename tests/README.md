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

## End-to-End tests with Cypress

The `end2end` directory contains some end-to-end tests made for Cypress.
Go in `end2end` directory and execute `npm install` to install Cypress (only the first time).
You can then :
- execute `npm run cy:open` to open Cypress window.
- select the target browser then click one of the integration tests or 'Run n integration specs' to run all.

or

- execute `npm run cy:test` to automatically open Cypress window and run tests in Electron browser.

You can also use GNU Parallel to parallelize Cypress tests execution on 8 cores for example:

`find cypress/integration/ -name '*.js' | parallel -j8 --group  npx cypress run --spec {}`

Output colors can be kept with `--tty` parameter, but it won't work with `--group` which is useful to not mix outputs from different tests.
