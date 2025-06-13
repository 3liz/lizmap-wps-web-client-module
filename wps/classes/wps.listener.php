<?php

use LizmapWPS\WPS\UrlServerUtil;

$lproj = null;

class wpsListener extends jEventListener
{
    public function ongetMapAdditions($event)
    {
        if (!$this->isAvailable($event)) {
            return;
        }

        $js = array(
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Request.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Request/XMLHttpRequest.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/OWSCommon.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/OWSCommon/v1.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/OWSCommon/v1_0_0.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/OWSCommon/v1_1_0.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/GML.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/GML/Base.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/GML/v2.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/GML/v3.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/Filter.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/Filter/v1.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/Filter/v1_1_0.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/WCSGetCoverage.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/WFST.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/WFST/v1.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/WFST/v1_1_0.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/WPSDescribeProcess.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/WPSExecute.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/WPSCapabilities.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/WPSCapabilities/v1_0_0.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'wps.js')),
        );
        $jscode = array(
        );
        $jsvars = array(
            'lizWpsUrls' => array(
                'wps_wps' => jUrl::get('wps~service:index'),
                'wps_wps_results' => jUrl::get('wps~results:index'),
                'wps_wps_results_update' => jUrl::get('wps~results:update'),
                'wps_wps_results_delete' => jUrl::get('wps~results:delete'),
                'wps_wps_status' => jUrl::get('wps~service:status'),
                'wps_wps_store' => jUrl::get('wps~service:store'),
                'wps_ogc_processes' => jUrl::get('wps~processes_rest:get'),
                'wps_ogc_jobs' => jUrl::get('wps~jobs_rest:get'),
            ),
            'mapURL' => UrlServerUtil::retrieveServerURL('map_server_url'),
        );
        $css = array(
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'wps.css')),
        );

        // Add Dataviz if not already available
        if (!$this->getDatavizStatus($event)) {
            $bp = jApp::urlBasePath();
            $js[] = $bp.'assets/js/dataviz/plotly-latest.min.js';
            $js[] = $bp.'assets/js/dataviz/dataviz.js';
        }

        // Check if there is a processing configuration for this project
        $path = $this->lproj->getPath().'.json';
        $rconfig = file_exists($path) ? jFile::read($path) : null;
        if (!empty($rconfig)) {
            $config = json_decode($rconfig);
            $je = json_last_error();
            if ($je === JSON_ERROR_NONE && is_object($config)) {
                $jsvars = array_merge($jsvars, array('wps_wps_project_config' => $config));
            } else {
                $errorMsg = 'Error in processing configuration file: '.$path;
                $errorMsg .= ' - Error code: '.$je.' - '.json_last_error_msg();
                if ($je === JSON_ERROR_NONE) {
                    $errorMsg .= ' but parsing result is not an object';
                }
                jLog::log($errorMsg, 'error');
            }
        }

        // Add translation
//         $locales = $this->getLocales();
//         $jscode[] = 'var wpsLocales = '.json_encode($locales).';';

        $event->add(
            array(
                'js' => $js,
                'jsvars' => $jsvars,
                'jscode' => $jscode,
                'css' => $css,
            )
        );
    }

    public function onmapDockable($event)
    {
        if (!$this->isAvailable($event)) {
            return;
        }

        // Use template dock
        $assign = array();
        $content = array('wps~dock', $assign);
        $dock = new lizmapMapDockItem(
            'processing',
            \jLocale::get('wps~wps.dock.main.title'),
            $content,
            15,
            null, // done with getMapAdditions
            null
        );
        $event->add($dock);
    }

    public function onmapBottomDockable($event)
    {
        if (!$this->isAvailable($event)) {
            return;
        }

        // Use template dataviz-dock
        $assign = array();
        $content = array('wps~bottomdock', $assign);
        $dock = new lizmapMapDockItem(
            'processing-results',
            \jLocale::get('wps~wps.dock.results.title'),
            $content,
            15,
            null, // done with getMapAdditions
            null
        );
        $event->add($dock);
    }

    protected function isAvailable($event)
    {
        // WPS Config
        $wpsConfig = jApp::config()->wps;

        // get wps rootDirectories
        $rootDirectories = $wpsConfig['wps_rootDirectories'];
        if (!$rootDirectories) {
            return false;
        }

        // WPS only available to authenticated users
        if (array_key_exists('restrict_to_authenticated_users', $wpsConfig)
            && $wpsConfig['restrict_to_authenticated_users']
            && !jAuth::isConnected()) {
            return false;
        }

        $project = $event->getParam('project');
        $repository = $event->getParam('repository');

        $lrep = lizmap::getRepository($repository);
        if (!$lrep) {
            return false;
        }

        if (strpos($lrep->getPath(), $rootDirectories) !== 0) {
            return false;
        }

        $lproj = lizmap::getProject($repository.'~'.$project);
        if (!$lproj) {
            return false;
        }

        $this->lproj = $lproj;

        // WPS only available for configured projects
        if (array_key_exists('restrict_to_config_projects', $wpsConfig)
            && $wpsConfig['restrict_to_config_projects']
            && !file_exists($lproj->getQgisPath().'.json')) {
            return false;
        }

        return true;
    }

    protected function getDatavizStatus($event)
    {
        $project = $event->getParam('project');
        $repository = $event->getParam('repository');

        // Check dataviz config
        jClasses::inc('dataviz~datavizConfig');
        $dv = new datavizConfig($repository, $project);

        return $dv->getStatus();
    }

    protected function onmasteradminGetMenuContent($event)
    {
        // new section
        $sectionAuth = new masterAdminMenuItem('wps_admin', \jLocale::get('wps~wps.ui.admin.menu.group'), '', 150);

        if (jAcl2::check('wps.modelfile.manage')) {
            // add config page
            $sectionAuth->childItems[] = new masterAdminMenuItem('wps_admin_upload', \jLocale::get('wps~wps.ui.admin.menu.model3list'), jUrl::get('wps~admin:list'), 150, 'wps_admin');
        }
        if (jAcl2::check('wps.options.manage')) {
            // add config page for projects restriction options
            $sectionAuth->childItems[] = new masterAdminMenuItem('wps_proj_restrict', \jLocale::get('wps~wps.ui.admin.menu.project_restriction'), jUrl::get('wps~restrictionsAdmin:show'), 160, 'wps_admin');
        }
        if (jAcl2::check('wps.urlserver.manage')) {
            // add config page
            $sectionAuth->childItems[] = new masterAdminMenuItem('wps_url_change', \jLocale::get('wps~wps.ui.admin.menu.url_server'), jUrl::get('wps~urlServer:show'), 150, 'wps_admin');
        }
        $event->add($sectionAuth);
    }

    private function getLocales()
    {
        $data = array();
        $path = jApp::getModulePath('wps').'locales/en_US/wps.UTF-8.properties';
        if (file_exists($path)) {
            $lines = file($path);
            foreach ($lines as $lineNumber => $lineContent) {
                if (!empty($lineContent) and $lineContent != '\n') {
                    $exp = explode('=', trim($lineContent));
                    if (!empty($exp[0])) {
                        $data[$exp[0]] = jLocale::get('wps~wps.'.$exp[0]);
                    }
                }
            }
        }

        return $data;
    }
}
