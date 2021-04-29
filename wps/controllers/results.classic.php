<?php
/**
* Php get results saved
* @package   lizmap
* @subpackage wps
* @author    3liz
* @copyright 2017 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class resultsCtrl extends jController {

    function index() {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'wps_results.json';
        $rep->mimeType = 'application/json';
        $content = 'null';
        $rep->content = $content;

        // wps process identifier
        $identifier = $this->param('identifier');
        if ( !$identifier ) {
          return $rep;
        }

        // lizmap project and repository
        $repository = $this->param('repository');
        if ( !$repository ) {
          return $rep;
        }
        $project = $this->param('project');
        if ( !$project ) {
          return $rep;
        }

        $pStatus = jClasses::getService('wps~processStatus');

        $data = array();
        $saved = $pStatus->saved( $identifier, $repository, $project );
        foreach( $saved as $uuid ) {
            $data[$uuid] = $pStatus->get( $identifier, $repository, $project, $uuid );
        }
        if ( count($data) > 0 )
            $rep->content = json_encode($data);
        return $rep;
    }

    function update() {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'wps_result_update.json';
        $rep->mimeType = 'application/json';
        $content = 'null';
        $rep->content = $content;

        // wps process identifier
        $identifier = $this->param('identifier');
        if ( !$identifier ) {
            return $rep;
        }

        // lizmap project and repository
        $repository = $this->param('repository');
        if ( !$repository ) {
          return $rep;
        }
        $project = $this->param('project');
        if ( !$project ) {
          return $rep;
        }

        // Get and decode json post
        $requestJson = $this->param('__httpbody');

        if ( !$requestJson ) {
            return $rep;
        }
        // depending on how jelix is configured, we could have directly
        // decoded json, so let's decode data only if needed
        $data = (is_string($requestJson)?json_decode( $requestJson, true ):$requestJson);

        if ( !array_key_exists( 'uuid', $data ) ) {
            return $rep;
        }

        $pStatus = jClasses::getService('wps~processStatus');
        $pStatus->update( $identifier, $repository, $project, $data['uuid'], $data );

        $rep->content = json_encode( $pStatus->get( $identifier, $repository, $project, $data['uuid']) );
        return $rep;
    }

    function delete() {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'wps_result_update.json';
        $rep->mimeType = 'application/json';
        $content = 'null';
        $rep->content = $content;

        // wps process identifier
        $identifier = $this->param('identifier');
        if ( !$identifier ) {
            return $rep;
        }

        // wps process uuid
        $uuid = $this->param('uuid');
        if ( !$uuid ) {
            return $rep;
        }

        $pStatus = jClasses::getService('wps~processStatus');
        $pStatus->delete( $identifier, $uuid );

        $rep->content = json_encode( $pStatus->get( $identifier, $data['uuid']) );
        return $rep;
    }
}

?>
