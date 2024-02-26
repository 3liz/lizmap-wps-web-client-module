<?php
/**
 * @author    3liz
 * @copyright 2024 3liz
 *
 * @see      https://3liz.com
 *
 * @license    GPL 3
 */
class wpsModuleInstaller extends \Jelix\Installer\Module\Installer {
    public function install(Jelix\Installer\Module\API\InstallHelpers $helpers) {
        $rightName = 'wps.modelfile.manage';
        // Add right subject
        jAcl2DbManager::addSubject($rightName, 'wps~wps.acl2.model.manage', 'lizmap.admin.grp');

        // Add right on admins group
        jAcl2DbManager::addRight('admins', $rightName);
    }
}
