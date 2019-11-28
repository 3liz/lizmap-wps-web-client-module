#

export LIZMAP_DIR=$(shell pwd)/lizmap
export LIZMAP_USER_ID:=$(shell id -u)
export LIZMAP_USER_GID:=$(shell id -g)

export LIZMAP_VERSION_TAG:=3.3
export QGIS_VERSION_TAG:=3.4

export LIZMAP_PORT:=127.0.0.1:9090
export OWS_PORT:=127.0.0.1:9091
export WPS_PORT:=127.0.0.1:9092

export REG_PREFIX:=3liz/

export WPS_MODULE_SRC:=$(shell realpath ..)

export QGIS_MAP_WORKERS:=1
export WPS_NUM_WORKERS:=1

run:
	docker-compose rm -f || true
	docker-compose up

rm:
	docker-compose stop || true
	docker-compose rm -f

clean:
	rm -rf $(LIZMAP_DIR)/www/*
	rm -rf $(LIZMAP_DIR)/var/*
	rm -rf $(LIZMAP_DIR)/wps-data/*

