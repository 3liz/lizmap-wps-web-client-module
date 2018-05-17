# Module Petra

## Manual Installation

Copy the *wps* directory to lizmap/lizmap-modules/ folder.

## Configuration

In `var/config/localconfig.ini.php` create or update the section `[modules]`:
```
wps.access=2
```

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
