php-cs-fixer-test:
	php-cs-fixer fix --config=.php_cs.dist --allow-risky=yes --dry-run --diff

php-cs-fixer-apply:
	php-cs-fixer fix --config=.php_cs.dist --allow-risky=yes

php-cs-fixer-apply-docker:
	docker run --rm -it -w=/app -v ${PWD}:/app oskarstark/php-cs-fixer-ga:2.19.0 --allow-risky=yes --config=.php_cs.dist -- wps
