<?php

$lproj = Null;

class wpsListener extends jEventListener{


    function ongetMapAdditions ($event) {
        if ( !$this->isAvailable($event) )
            return;

        $bp = jApp::config()->urlengine['basePath'];
        $js = array(
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

    function onmapRightDockable ($event) {
        if ( !$this->isAvailable($event) )
            return;

        // Use template dataviz-dock
        $assign = array();
        $content = array( 'wps~dockright', $assign );
        $dock = new lizmapMapDockItem(
            'processing-results',
            'WPS Résultats',
            $content,
            15,
            null, // fait via getMapAdditions
            null
        );
        $event->add($dock);
    }

    protected function isAvailable ($event) {

        // get wps rootDirectories
        $localConfig = jApp::configPath('localconfig.ini.php');
        $localConfig = new jIniFileModifier($localConfig);
        $rootDirectories = $localConfig->getValue('wps_rootDirectories', 'wps');
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
