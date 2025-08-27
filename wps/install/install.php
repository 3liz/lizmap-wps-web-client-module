<?php
/**
 * @author    3liz
 * @copyright 2024 3liz
 *
 * @see      https://3liz.com
 *
 * @license    GPL 3
 */
class wpsModuleInstaller extends \Jelix\Installer\Module\Installer
{
    public function install(Jelix\Installer\Module\API\InstallHelpers $helpers)
    {
        $rights = array(
            'wps.modelfile.manage' => 'wps~wps.acl2.model.manage',
            'wps.options.manage' => 'wps~wps.acl2.options.manage',
            'wps.urlserver.manage' => 'wps~wps.acl2.urlserver.manage',
        );
        foreach ($rights as $rightName => $rightLocale) {
            // Add right subject
            jAcl2DbManager::addSubject($rightName, $rightLocale, 'lizmap.admin.grp');

            // Add right on admins group
            jAcl2DbManager::addRight('admins', $rightName);
        }
        $helpers->copyDirectoryContent('../www/dist', \jApp::wwwPath("assets/js/wps"), true);
    }
}
