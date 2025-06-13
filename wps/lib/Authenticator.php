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

class Authenticator
{
    /**
     * Checks if the restriction to authorize user is active.
     * If yes, verify if the current user is connected.
     *
     * @return bool returns true if the user is authorized, and false otherwise
     */
    public static function verify()
    {
        $restricted = self::retrieveAuthorization();

        if (!$restricted) {
            return true;
        }

        return \jAuth::isConnected();
    }

    /**
     * Find authorization from the config file.
     *
     * @return bool Returns true if the value is 'on', otherwise false
     */
    private static function retrieveAuthorization()
    {
        $file = \jApp::varConfigPath('liveconfig.ini.php');
        $iniFile = new \Jelix\IniFile\IniModifier($file);

        if ($iniFile->getValue('restrict_to_authenticated_users', 'wps') == 'on') {
            return true;
        }

        return false;
    }
}
