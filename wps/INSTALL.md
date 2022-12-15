# Module Petra

## Manual Installation

Copy the *wps* directory to lizmap/lizmap-modules/ folder.

For Lizmap 3.5 or lower, in `var/config/localconfig.ini.php` create or update the section `[modules]` with the value:
```
wps.access=2
```

For Lizmap 3.6 or higher, run the command `php lizmap/install/configurator.php wps`.

For all Lizmap, then run 

```bash
php lizmap/install/installer.php
lizmap/install/clean_vartmp.sh
lizmap/install/set_rights.sh
```



## Configuration


In `localconfig.ini.php` add:
```
[wps]
wps_rootUrl=<root url to py-qgis-wps without ows>
wps_rootDirectory=<path to wps projects directory>
redis_host=localhost
redis_port=6379
redis_key_prefix=lzmwps
ows_url=<url to ows service configured in wps>
```

The `wps_rootUrl` is the URL of the WPS QGIS Server.
The `wps_rootDirectory` is the directory of the lizmap installation mounted as the WPS QGIS Server projects directory.
The `ows_url` is the URL of the OWS defined in WPS QGIS Server for generated services.
