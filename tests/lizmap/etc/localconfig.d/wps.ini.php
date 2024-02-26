[modules]
wps.access=2

[wps]
wps_rootUrl="http://wps:8080/"
ows_url="http://map:8080/ows/"
wps_rootDirectories="/srv/projects"
redis_host=redis
redis_port=6379
redis_db=1
redis_key_prefix=wpslizmap
restrict_to_config_projects=off
restrict_to_authenticated_users=off
enable_job_realm=off
admin_job_realm=e8c10c9dc66f62dec1d52af7549bfc67a11dd6a2
wps_processingModelsPath="/www/lizmap/var/models/"
wps_restartmonPath="/srv/projects/test_france_parts/restart.dummy"
