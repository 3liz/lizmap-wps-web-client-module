<?php

$lproj = Null;

class wpsListener extends jEventListener{


    function ongetMapAdditions ($event) {
        if ( !$this->isAvailable($event) )
            return;

        $bp = jApp::config()->urlengine['basePath'];
        $js = array(
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/WCSGetCoverage.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/Filter.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/Filter/v1.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/Filter/v1_1_0.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/OWSCommon.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/OWSCommon/v1.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/OWSCommon/v1_0_0.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/OWSCommon/v1_1_0.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/WFST.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/WFST/v1.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/WFST/v1_1_0.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/WPSDescribeProcess.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/WPSExecute.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/WPSCapabilities.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'OpenLayers/Format/WPSCapabilities/v1_0_0.js')),
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'wps.js'))
        );
        $jscode = array(
            'lizUrls[\'wps_wps\'] = \''.jUrl::get('wps~service:index').'\'',
            'lizUrls[\'wps_wps_results\'] = \''.jUrl::get('wps~results:index').'\'',
            'lizUrls[\'wps_wps_results_update\'] = \''.jUrl::get('wps~results:update').'\'',
            'lizUrls[\'wps_wps_results_delete\'] = \''.jUrl::get('wps~results:delete').'\'',
            'lizUrls[\'wps_wps_status\'] = \''.jUrl::get('wps~service:status').'\'',
            'lizUrls[\'wps_wps_store\'] = \''.jUrl::get('wps~service:store').'\''
        );
        $css = array(
            jUrl::get('jelix~www:getfile', array('targetmodule'=>'wps', 'file'=>'wps.css'))
        );

        // Add Dataviz if not already available
        if ( !$this->getDatavizStatus($event) ) {
            $bp = jApp::config()->urlengine['basePath'];
            $js[] = $bp.'js/dataviz/plotly-latest.min.js';
            $js[] = $bp.'js/dataviz/dataviz.js';
        }

        // Check if there is a processing configuration for this project
        $path = $this->lproj->getPath() . '.json';
        $rconfig = jFile::read($path);
        if(!empty($rconfig)){
            $config = json_decode($rconfig);
            $je = json_last_error();
            if($je === 0 and is_object($config)){
               $jscode[] = 'try{ var wps_wps_project_config = ' . trim($rconfig) . ';}catch(e){console.log(e);}';
            }
        }

        $event->add(
            array(
                'js' => $js,
                'jscode' => $jscode,
                'css' => $css
            )
        );
    }

    function onmapDockable ($event) {
        if ( !$this->isAvailable($event) )
            return;

        // Use template dock
        $assign = array();
        $content = array( 'wps~dock', $assign );
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

    function onmapBottomDockable ($event) {
        if ( !$this->isAvailable($event) )
            return;

        // Use template dataviz-dock
        $assign = array();
        $content = array('wps~bottomdock', $assign );
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

    protected function isAvailable ($event) {

        // get wps rootDirectories
        $rootDirectories =  jApp::config()->wps['wps_rootDirectories'];
        if ( !$rootDirectories )
            return false;

        $project = $event->getParam( 'project' );
        $repository = $event->getParam( 'repository' );

        $lrep = lizmap::getRepository($repository);
        if ( !$lrep )
            return false;

        if ( strpos($lrep->getPath(), $rootDirectories) !== 0)
            return;

        $lproj = lizmap::getProject($repository.'~'.$project);
        if ( !$lproj )
            return false;

        $this->lproj = $lproj;

        return true;
    }

    protected function getDatavizStatus ($event) {
        $project = $event->getParam( 'project' );
        $repository = $event->getParam( 'repository' );

        // Check dataviz config
        jClasses::inc('dataviz~datavizConfig');
        $dv = new datavizConfig($repository, $project);
        return $dv->getStatus();
    }
}
?>
