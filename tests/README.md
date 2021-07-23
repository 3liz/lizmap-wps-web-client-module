# Run Lizmap stack with docker-compose

Just do:

```
make env LIZMAP_VERSION_TAG=<lizmap_version_tag> QGIS_VERSION_TAG=<qgis_version_tag>
docker-compose up -V --force-recreate [-d]
```

Stop and clean the stack with:
```
docker-compose down -v 
```


Open your browser at `http://localhost:9090`


For more informations, refer to the [docker-compose documentation](https://docs.docker.com/compose/)


