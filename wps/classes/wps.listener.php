<?php

$lproj = null;

class wpsListener extends jEventListener
{
    public function ongetMapAdditions($event)
    {
        if (!$this->isAvailable($event)) {
            return;
        }

        $js = array(
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/WCSGetCoverage.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/Filter.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/Filter/v1.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/Filter/v1_1_0.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/OWSCommon.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/OWSCommon/v1.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/OWSCommon/v1_0_0.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule' => 'wps', 'file' => 'OpenLayers/Format/OWSCommon/v1_1_0.js')),
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
            'lizUrls[\'wps_wps\'] = \''.jUrl::get('wps~service:index').'\'',
            'lizUrls[\'wps_wps_results\'] = \''.jUrl::get('wps~results:index').'\'',
            'lizUrls[\'wps_wps_results_update\'] = \''.jUrl::get('wps~results:update').'\'',
            'lizUrls[\'wps_wps_results_delete\'] = \''.jUrl::get('wps~results:delete').'\'',
            'lizUrls[\'wps_wps_status\'] = \''.jUrl::get('wps~service:status').'\'',
            'lizUrls[\'wps_wps_store\'] = \''.jUrl::get('wps~service:store').'\'',
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
        $rconfig = jFile::read($path);
        if (!empty($rconfig)) {
            $config = json_decode($rconfig);
            $je = json_last_error();
            if ($je === 0 and is_object($config)) {
                $jscode[] = 'try{ var wps_wps_project_config = '.trim($rconfig).';}catch(e){console.log(e);}';
            }
        }

        $event->add(
            array(
                'js' => $js,
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
            'WPS',
            $content,
            15,
            null, // fait via getMapAdditions
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
            'WPS results',
            $content,
            15,
            null, // fait via getMapAdditions
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
}
