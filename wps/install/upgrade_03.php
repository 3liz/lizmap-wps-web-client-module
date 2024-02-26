<?php
/**
 * @author    3liz
 * @copyright 2024 3liz
 *
 * @see      https://3liz.com
 *
 * @license    GPL 3
 */
class wpsModuleUpgrader_03 extends \Jelix\Installer\Module\Installer
{
    public $targetVersions = array(
        '0.3.0',
    );
    public $date = '2024-02-15';

    public function install(Jelix\Installer\Module\API\InstallHelpers $helpers)
    {
        $rights = array(
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
