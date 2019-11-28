;<?php die(''); ?>
;for security reasons , don't remove or modify the first line

;theme=

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

[urlengine]
;checkHttpsOnParsing=
;forceProxyProtocol=
;domainName=
;basePath=
;backendBasePath=


[mailer]
webmasterEmail="hosting-no-reply@lizmap.com"
webmasterName="Lizmap Docker"
mailerType=smtp
smtpHost=smtp.host.net
smtpPort=25
smtpSecure=tls
smtpHelo=
smtpAuth=1
smtpUsername="hosting-no-reply@lizmap.com"
smtpPassword=mysecretpassword
smtpTimeout=10
















[coordplugins]
lizmap=lizmapConfig.ini.php









