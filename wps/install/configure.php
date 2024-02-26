<?php
/**
 * @author    3liz
 * @copyright 2024 3liz
 *
 * @see      https://3liz.com
 *
 * @license    GPL 3
 */

use Jelix\Routing\UrlMapping\EntryPointUrlModifier;
use Jelix\Routing\UrlMapping\MapEntry\MapInclude;

/**
 * Configurator for Lizmap 3.6+/Jelix 1.8+.
 */
class wpsModuleConfigurator extends \Jelix\Installer\Module\Configurator
{
    public function getDefaultParameters()
    {
        return array();
    }

    public function declareUrls(EntryPointUrlModifier $registerOnEntryPoint)
    {
        $registerOnEntryPoint->havingName(
            'admin',
            array(
                new MapInclude('adminurls.xml'),
            )
        )
        ;

        $registerOnEntryPoint->havingName(
            'index',
            array(
                new MapInclude('urls.xml'),
            )
        )
        ;
    }

    public function configure(Jelix\Installer\Module\API\ConfigurationHelpers $helpers)
    {
    }
}
