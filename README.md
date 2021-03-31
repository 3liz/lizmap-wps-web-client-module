# Lizmap WPS Web Client

Lizmap WPS Web Client is a Lizmap module to add a WPS panel into [Lizmap Web Client](https://github.com/3liz/lizmap-web-client/).

This is an example showing the QGIS Processing Buffer algorithm, exposed as a WPS algorithm within Lizmap Web Client:

![Screenshot](screenshot.png)

![Demo gif](demo.gif)

It's also providing another panel showing you the results which have been executed on the Lizmap instance.

## Installation

Since version 0.1.1, it is recommended to install the module
with [Composer](https://getcomposer.org), the package manager for PHP.
If you can't use it or if you are using Lizmap 3.3 or lower, use the manual way to
install the module (jump to the corresponding section below)

### Automatic install with Composer and lizmap 3.4 or higher

* into `lizmap/my-packages`, create the file `composer.json` (if it doesn't exists)
  by copying the file `composer.json.dist`, and install the module with Composer:

```bash
cp -n lizmap/my-packages/composer.json.dist lizmap/my-packages/composer.json
composer require --working-dir=lizmap/my-packages "lizmap/lizmap-wps-web-client"
```

* Then execute Lizmap install scripts into `lizmap/install/` :

```bash
php lizmap/install/installer.php
./lizmap/install/clean_vartmp.sh
./lizmap/install/set_rights.sh
```

Go to the "Configuration" section.

### Manual installation into lizmap 3.3 or 3.4 without Composer

* Download the zip archive from the [release page into github](https://github.com/3liz/lizmap-wps-web-client-module/releases).
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
wps_url=http://wps:8080
wps_rootDirectories=/projects/wps
redis_host=localhost
redis_port=6379
redis_key_prefix=lzmwps
ows_url=http://map:8080
```

The WPS configuration:

* `wps_url` is the URL of the WPS service
* `wps_rootDirectories` is the path of the directories defined for the WPS Service MAP 

The redis configuration for saving process status: uuid, INPUTS, OUTPUTS.

* `redis_host` the redis host to use
* `redis_port` the redis port to use
* `redis_key_prefix` the redis key prefix to use

The OWS proxy configuration:

* `ows_url` is the URL of the OWS service used by the WPS service
