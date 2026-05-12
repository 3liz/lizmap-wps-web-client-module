# Lizmap WPS Web Client

[![🔤 Lint](https://github.com/3liz/lizmap-wps-web-client-module/actions/workflows/lint.yml/badge.svg)](https://github.com/3liz/lizmap-wps-web-client-module/actions/workflows/lint.yml)
[![🚀 Release](https://github.com/3liz/lizmap-wps-web-client-module/actions/workflows/release.yml/badge.svg)](https://github.com/3liz/lizmap-wps-web-client-module/actions/workflows/release.yml)
[![Packagist](https://img.shields.io/packagist/v/lizmap/lizmap-wps-web-client)](https://packagist.org/packages/lizmap/lizmap-wps-web-client)

Lizmap WPS Web Client is a Lizmap module to add a WPS panel into [Lizmap Web Client](https://github.com/3liz/lizmap-web-client/).

This is an example showing the QGIS Processing Buffer algorithm, exposed as a WPS algorithm within Lizmap Web Client:

![Screenshot](docs/media/wps-panel.png)

![Screenshot](docs/media/screenshot.png)

![Demo gif](docs/media/demo.gif)

It's also providing another panel showing you the results which have been executed on the Lizmap instance.

## Installation

Since version 0.1.1, it is recommended to install the module
with [Composer](https://getcomposer.org), the package manager for PHP.
If you can't use it or if you are using Lizmap 3.3 or lower, use the manual way to
install the module (jump to the corresponding section below)

### Automatic installation with Composer and lizmap 3.4 or higher

* into `lizmap/my-packages`, create the file `composer.json` (if it doesn't exist)
  by copying the file `composer.json.dist`, and install the module with Composer:

```bash
cp -n lizmap/my-packages/composer.json.dist lizmap/my-packages/composer.json
composer require --working-dir=lizmap/my-packages "lizmap/lizmap-wps-web-client"
```

* If you are using Lizmap 3.6 or higher, execute

```bash
php lizmap/install/configurator.php wps
```

* Then for any version, execute Lizmap install scripts into `lizmap/install/` :

```bash
php lizmap/install/installer.php
./lizmap/install/clean_vartmp.sh
./lizmap/install/set_rights.sh
```

Go to the "Configuration" section.

### Manual installation into lizmap 3.3 or 3.4 without Composer

* Download the zip archive from the [release page into GitHub](https://github.com/3liz/lizmap-wps-web-client-module/releases).
* Extract files from the archive and copy the directory `wps` into `lizmap/lizmap-modules/` of Lizmap.
* Edit the file  `lizmap/var/config/localconfig.ini.php` to add this
  into the `[modules]` section

```ini
wps.access=2
```

* Then execute Lizmap install scripts into `lizmap/install/` :

```bash
php lizmap/install/installer.php
./lizmap/install/clean_vartmp.sh
./lizmap/install/set_rights.sh
```


## configuration

Add a section `[wps]` in your `localconfig.ini.php` and add the variables:

```ini
[wps]
wps_rootUrl=http://wps:8080/
wps_rootDirectories=/srv/projects

redis_host=localhost
redis_port=6379
redis_key_prefix=wpslizmap
redis_db=1
ows_url=http://map:8080/ows/
restrict_to_config_projects=off
restrict_to_authenticated_users=off
enable_job_realm=off
admin_job_realm=
wps_restartmonPath="/srv/projects/restart.dummy"
```

The WPS configuration:

* `wps_rootUrl` is the URL of the WPS service
* `wps_rootDirectories` is the path of the directories defined for the WPS Service MAP

The redis configuration for saving process status: uuid, INPUTS, OUTPUTS.

* `redis_host` the redis host to use
* `redis_port` the redis port to use
* `redis_db` the redis database to use
* `redis_key_prefix` the redis key prefix to use

The OWS proxy configuration:

* `ows_url` is the URL of the OWS service used by the WPS service

The availability of WPS algorithms in the Lizmap Web Client web maps

* `restrict_to_config_projects` the module is not enabled for projects without a json config for processes.
* `restrict_to_authenticated_users` the module is not enabled if the user is not authenticated.
* `enable_job_realm` enable job access control by associating a realm token to each job. Job realm will be built at user level.
* `admin_job_realm` administrator realm token. It allows bearer to bypass any other token.
* `wps_restartmonPath` restart point which refreshes list of models for a user to select from a dropdown list.

It is also necessary to upload into a project directory configuration file for a WPS plugin. Example of the file was uploaded in the example project directoy: [france_parts.qgs.json](tests\lizmap\instances\test_france_parts\france_parts.qgs.json). 

In the example, project name and configuration file have to have the same names.

Configuration file content consists of few parameters:
```json
{
    "model:nameOfModel": {
        "input": [
            "france_parts tuilé en cache"
        ],
        "__job_label": "native:centroids_1:OUTPUT"
    },
    "model:Modèle": {
    }
}
```

* `nameOfModel` parameter describes a name of the used model3 uploaded by user through admin panel. If users' model name is centroides.model3, this parameter has to be set to centroides.

* `input` list of layers to be used by the algorithm as input layer. If it is geometrical layer, it must have `geom` column describing geometry. If not, processing won't work.

**WARNING** Plugin requires set-up backend for background process execution. For docker, please follow the [docker-compose.yml](tests\docker-compose.yml) file and adjust your environment for wps container adaption. If you're using local lizmap version, install WPS plugin inside of QGIS server.
