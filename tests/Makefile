SHELL = bash
.ONESHELL:
.PHONY: env
#

LIZMAP_DIR=$(shell pwd)/lizmap

LIZMAP_USER_ID:=$(shell id -u)
LIZMAP_USER_GID:=$(shell id -g)

LIZMAP_VERSION_TAG:=3.4
QGIS_VERSION_TAG:=3.16

QGIS_MAP_WORKERS:=1
WPS_NUM_WORKERS:=1

LIZMAP_PORT:=127.0.0.1:9090
OWS_PORT:=127.0.0.1:9091
WPS_PORT:=127.0.0.1:9092

BASEDIR:=$(shell realpath ..)

WPS_MODULE_SRC:=$(shell realpath ..)

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
		LIZMAP_VERSION_TAG=$(LIZMAP_VERSION_TAG)
		QGIS_VERSION_TAG=$(QGIS_VERSION_TAG)
		EOF

run: env
	docker compose up -V --force-recreate

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


