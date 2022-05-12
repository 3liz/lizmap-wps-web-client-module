php-cs-fixer-test:
	php-cs-fixer fix --config=.php-cs-fixer.dist.php --allow-risky=yes --dry-run --diff

php-cs-fixer-apply:
	php-cs-fixer fix --config=.php-cs-fixer.dist.php --allow-risky=yes

php-cs-fixer-apply-docker:
	docker run --rm -it -w=/app -v ${PWD}:/app oskarstark/php-cs-fixer-ga:3.8.0 --allow-risky=yes --config=.php-cs-fixer.dist.php -- wps
