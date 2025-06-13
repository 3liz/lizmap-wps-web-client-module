<?php

/**
 * @author    3liz.com
 * @copyright 2011-2025 3Liz
 *
 * @see      https://3liz.com
 *
 * @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
 */

namespace LizmapWPS\WPS;

class UrlServerUtil
{
    /**
     * Retrieves the server URL from the specified configuration parameter.
     *
     * @param string $param the configuration parameter used to retrieve the server URL
     *
     * @return null|string the server URL associated with the provided parameter, or null if not found
     */
    public static function retrieveServerURL($param)
    {
        $file = \jApp::varConfigPath('liveconfig.ini.php');
        $iniFile = new \Jelix\IniFile\IniModifier($file);

        return $iniFile->getValue($param, 'wps');
    }
}
