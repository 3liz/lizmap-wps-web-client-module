<?php
/**
 * @author    3liz
 * @copyright 2025 3liz
 *
 * @see      https://3liz.com
 *
 * @license    GPL 3
 */
class wpsModuleUpgrader_06 extends \Jelix\Installer\Module\Installer
{
    public $targetVersions = array(
        '0.6.0',
    );
    public $date = '2025-06-18';

    public function install(Jelix\Installer\Module\API\InstallHelpers $helpers)
    {
        $rights = array(
            'wps.urlserver.manage' => 'wps~wps.acl2.urlserver.manage',
            'wps.modelfile.manage' => 'wps~wps.acl2.model.manage',
            'wps.options.manage' => 'wps~wps.acl2.options.manage',
        );
        foreach ($rights as $rightName => $rightLocale) {
            // Add right subject
            jAcl2DbManager::addSubject($rightName, $rightLocale, 'lizmap.admin.grp');

            // Add right on admins group
            jAcl2DbManager::addRight('admins', $rightName);
        }
    }
}
