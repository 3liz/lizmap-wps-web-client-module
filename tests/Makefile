SHELL = bash
.ONESHELL:
.PHONY: env
#

LIZMAP_DIR=$(shell pwd)/lizmap

LIZMAP_USER_ID:=$(shell id -u)
LIZMAP_USER_GID:=$(shell id -g)

LIZMAP_VERSION_TAG:=3.8.0-rc.3
QGIS_VERSION_TAG:=ltr-rc
POSTGIS_VERSION_TAG:=14-3

QGIS_MAP_WORKERS:=1
WPS_NUM_WORKERS:=1

LIZMAP_PORT:=127.0.0.1:9090
OWS_PORT:=127.0.0.1:9091
WPS_PORT:=127.0.0.1:9092
LZMPGPORT:=127.0.0.1:9093

BASEDIR:=$(shell realpath ..)

WPS_MODULE_SRC:=$(shell realpath ..)

SERVER_ENABLE_JOB_REALM:=0
SERVER_ADMIN_REALM:=e8c10c9dc66f62dec1d52af7549bfc67a11dd6a2

main:
	@cat <<- EOF
		Commandes:
			run:   initialise environnement and run stack
			stop:  stop docker and remove containers
			clean: reset containers and remove lizmap configuration

			Note: Un fichier environment pour docker compose
			est crée à chaque invocation de 'run'.
			Cela permet d'utiliser les commandes 'docker compose'
			sans passer par le Makefile
	EOF

dirs:
	@mkdir -p $(LIZMAP_DIR)/www/var/log \
			  $(LIZMAP_DIR)/var/log/nginx \
			  $(LIZMAP_DIR)/var/nginx-cache \
			  $(LIZMAP_DIR)/var/lizmap-theme-config \
			  $(LIZMAP_DIR)/var/lizmap-db \
			  $(LIZMAP_DIR)/var/lizmap-config \
			  $(LIZMAP_DIR)/qgis-server-plugins \
			  $*

env: dirs
	@echo "Creating environment file for docker compose"
	@cat <<- EOF > .env
		LIZMAP_DIR=$(LIZMAP_DIR)
		LIZMAP_USER_ID=$(LIZMAP_USER_ID)
		LIZMAP_USER_GID=$(LIZMAP_USER_GID)
		QGIS_MAP_WORKERS=$(QGIS_MAP_WORKERS)
		WPS_NUM_WORKERS=$(WPS_NUM_WORKERS)
		LIZMAP_PORT=$(LIZMAP_PORT)
		OWS_PORT=$(OWS_PORT)
		WPS_PORT=$(WPS_PORT)
		WPS_MODULE_SRC=$(WPS_MODULE_SRC)
		LZMPGPORT=$(LZMPGPORT)
		LIZMAP_VERSION_TAG=$(LIZMAP_VERSION_TAG)
		QGIS_VERSION_TAG=$(QGIS_VERSION_TAG)
		POSTGIS_VERSION_TAG=$(POSTGIS_VERSION_TAG)
		SERVER_ENABLE_JOB_REALM=$(SERVER_ENABLE_JOB_REALM)
		SERVER_ADMIN_REALM=$(SERVER_ADMIN_REALM)
		EOF

install-plugins: dirs
	@echo "Install QGIS server plugins"
	docker run \
		-u $(LIZMAP_USER_ID):$(LIZMAP_USER_GID) \
		--rm -i \
		-e QGSRV_SERVER_PLUGINPATH=/srv/plugins \
		-e QGIS_PLUGIN_MANAGER_SOURCES_FILE=/tmp/sources-plugin-manager.list \
		-e QGIS_PLUGIN_MANAGER_CACHE_DIR=/tmp/cache-plugin-manager \
		-v $(LIZMAP_DIR)/qgis-server-plugins:/srv/plugins \
		-v $(shell pwd)/:/src \
		--entrypoint /bin/bash \
		3liz/qgis-map-server:$(QGIS_VERSION_TAG) \
		-c "qgis-plugin-manager init; \
		    qgis-plugin-manager update; \
		    qgis-plugin-manager install 'Lizmap server'"

run: env install-plugins
	docker compose up -V --force-recreate -d

stop:
	docker compose down -v --remove-orphans

_clean: stop
	rm -rf $(LIZMAP_DIR)/www/*
	rm -rf $(LIZMAP_DIR)/var/*
	rm -rf $(LIZMAP_DIR)/wps-data/*

clean: _clean dirs

# Pull images from github 3liz
pull:
	docker pull 3liz/lizmap-web-client:${LIZMAP_VERSION_TAG}
	docker pull 3liz/qgis-map-server:${QGIS_VERSION_TAG}
	docker pull 3liz/qgis-wps:${QGIS_VERSION_TAG}

import-lizmap-acl-35:
	@echo "Set repositories and users rights if needed"
	@echo "Set view project"
	docker compose exec -u $(LIZMAP_USER_ID) lizmap /bin/sh -c ' \
		php lizmap/cmd.php acl2right add __anonymous "lizmap.repositories.view" tests ; \
		php lizmap/cmd.php acl2right add users "lizmap.repositories.view" tests ; \
		php lizmap/cmd.php acl2right add admins "lizmap.repositories.view" tests'
	@echo "Display WMS links"
	docker compose exec -u $(LIZMAP_USER_ID) lizmap /bin/sh -c ' \
		php lizmap/cmd.php acl2right add users "lizmap.tools.displayGetCapabilitiesLinks" tests ; \
		php lizmap/cmd.php acl2right add admins "lizmap.tools.displayGetCapabilitiesLinks" tests'
	@echo "Edition"
	docker compose exec -u $(LIZMAP_USER_ID) lizmap /bin/sh -c ' \
		php lizmap/cmd.php acl2right add users "lizmap.tools.edition.use" tests ; \
		php lizmap/cmd.php acl2right add admins "lizmap.tools.edition.use" tests'
	@echo "Export layers"
	docker compose exec -u $(LIZMAP_USER_ID) lizmap /bin/sh -c ' \
		php lizmap/cmd.php acl2right add users "lizmap.tools.layer.export" tests ; \
		php lizmap/cmd.php acl2right add admins "lizmap.tools.layer.export" tests'

install-module:
	docker compose exec -u $(LIZMAP_USER_ID) lizmap php /www/lizmap/install/configurator.php --no-interaction wps
	docker compose exec -u $(LIZMAP_USER_ID) lizmap php /www/lizmap/install/installer.php -v

import-lizmap-acl:
	@echo "Create users"
	docker compose exec -u $(LIZMAP_USER_ID) lizmap /bin/sh -c ' \
		php lizmap/console.php jcommunity:user:create user_in_group_a user_in_group_a@nomail.nomail admin ; \
		php lizmap/console.php jcommunity:user:create publisher publisher@nomail.nomail admin'
	@echo "Create groups"
	docker compose exec -u $(LIZMAP_USER_ID) lizmap /bin/sh -c ' \
		php lizmap/console.php acl2group:create group_a group_a'
	@echo "Add users to groups"
	docker compose exec -u $(LIZMAP_USER_ID) lizmap /bin/sh -c ' \
		php lizmap/console.php acl2user:addgroup user_in_group_a group_a ; \
		php lizmap/console.php acl2user:addgroup publisher publishers'
	@echo "Set repositories and users rights if needed"
	@echo "Set view project"
	docker compose exec -u $(LIZMAP_USER_ID) lizmap /bin/sh -c ' \
		php lizmap/console.php acl2:add __anonymous "lizmap.repositories.view" tests ; \
		php lizmap/console.php acl2:add users "lizmap.repositories.view" tests ; \
		php lizmap/console.php acl2:add admins "lizmap.repositories.view" tests'
	@echo "Display WMS links"
	docker compose exec -u $(LIZMAP_USER_ID) lizmap /bin/sh -c ' \
		php lizmap/console.php acl2:add users "lizmap.tools.displayGetCapabilitiesLinks" tests ; \
		php lizmap/console.php acl2:add admins "lizmap.tools.displayGetCapabilitiesLinks" tests'
	@echo "Edition"
	docker compose exec -u $(LIZMAP_USER_ID) lizmap /bin/sh -c ' \
		php lizmap/console.php acl2:add users "lizmap.tools.edition.use" tests ; \
		php lizmap/console.php acl2:add admins "lizmap.tools.edition.use" tests'
	@echo "Export layers"
	docker compose exec -u $(LIZMAP_USER_ID) lizmap /bin/sh -c ' \
		php lizmap/console.php acl2:add users "lizmap.tools.layer.export" tests ; \
		php lizmap/console.php acl2:add admins "lizmap.tools.layer.export" tests'

shell:
	docker compose exec -u $(LIZMAP_USER_ID) -it lizmap /bin/sh -l
