<?php
/**
 * Php get results saved.
 *
 * @author    3liz
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class resultsCtrl extends jController
{
    public function index()
    {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'wps_results.json';
        $rep->mimeType = 'application/json';
        $content = 'null';
        $rep->content = $content;

        // wps process identifier
        $identifier = $this->param('identifier');
        if (!$identifier) {
            jLog::log('results controller, index: No identifier param', 'errors');

            return $rep;
        }

        // lizmap project and repository
        $repository = $this->param('repository');
        if (!$repository) {
            jLog::log('results controller, index: No repository param', 'errors');

            return $rep;
        }
        $project = $this->param('project');
        if (!$project) {
            jLog::log('results controller, index: No project param', 'errors');

            return $rep;
        }

        $pStatus = jClasses::getService('wps~processStatus');

        $data = array();
        $saved = $pStatus->saved($identifier, $repository, $project);
        foreach ($saved as $uuid) {
            $data[$uuid] = $pStatus->get($identifier, $repository, $project, $uuid);
        }
        if (count($data) > 0) {
            $rep->content = json_encode($data);
        }

        return $rep;
    }

    public function all()
    {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'wps_results.json';
        $rep->mimeType = 'application/json';
        $content = 'null';
        $rep->content = $content;

        // wps process identifier
        $identifier = $this->param('identifier');
        if (!$identifier) {
            jLog::log('results controller, index: No identifier param', 'errors');

            return $rep;
        }

        // lizmap project and repository
        $repository = $this->param('repository');
        if (!$repository) {
            jLog::log('results controller, index: No repository param', 'errors');

            return $rep;
        }
        $project = $this->param('project');
        if (!$project) {
            jLog::log('results controller, index: No project param', 'errors');

            return $rep;
        }

        $pStatus = jClasses::getService('wps~processStatus');

        $rep->content = json_encode($pStatus->allFromServer($identifier, $repository, $project));

        return $rep;
    }

    public function update()
    {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'wps_result_update.json';
        $rep->mimeType = 'application/json';
        $content = 'null';
        $rep->content = $content;

        // wps process identifier
        $identifier = $this->param('identifier');
        if (!$identifier) {
            jLog::log('results controller, update: No identifier param', 'errors');

            return $rep;
        }

        // lizmap project and repository
        $repository = $this->param('repository');
        if (!$repository) {
            jLog::log('results controller, update: No repository param', 'errors');

            return $rep;
        }
        $project = $this->param('project');
        if (!$project) {
            jLog::log('results controller, update: No project param', 'errors');

            return $rep;
        }

        // Get and decode json post
        $requestJson = $this->param('__httpbody');
        if (!$requestJson) {
            $requestJson = json_decode($this->request->getBody(), true);
        }

        if (!$requestJson) {
            jLog::log('results controller, update: No request JSON', 'errors');

            return $rep;
        }
        // depending on how jelix is configured, we could have directly
        // decoded json, so let's decode data only if needed
        $data = (is_string($requestJson) ? json_decode($requestJson, true) : $requestJson);

        if (!array_key_exists('uuid', $data)) {
            jLog::log('results controller, update: No uuid in request JSON');

            return $rep;
        }

        $pStatus = jClasses::getService('wps~processStatus');
        $pStatus->update($identifier, $repository, $project, $data['uuid'], $data);

        $rep->content = json_encode($pStatus->get($identifier, $repository, $project, $data['uuid']));

        return $rep;
    }

    public function delete()
    {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'wps_result_update.json';
        $rep->mimeType = 'application/json';
        $content = 'null';
        $rep->content = $content;

        // wps process identifier
        $identifier = $this->param('identifier');
        if (!$identifier) {
            jLog::log('results controller, delete: No identifier param', 'errors');

            return $rep;
        }

        // lizmap project and repository
        $repository = $this->param('repository');
        if (!$repository) {
            jLog::log('results controller, delete: No repository param', 'errors');

            return $rep;
        }
        $project = $this->param('project');
        if (!$project) {
            jLog::log('results controller, delete: No project param', 'errors');

            return $rep;
        }

        // wps process uuid
        $uuid = $this->param('uuid');
        if (!$uuid) {
            return $rep;
        }

        $pStatus = jClasses::getService('wps~processStatus');
        $pStatus->delete($identifier, $repository, $project, $uuid);

        $rep->content = json_encode($pStatus->get($identifier, $repository, $project, $uuid));

        return $rep;
    }
}
