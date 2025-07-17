<?php

/**
 * @author    3liz.com
 * @copyright 2011-2025 3Liz
 *
 * @see      https://3liz.com
 *
 * @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
 */

use LizmapWPS\WPS\Authenticator;
use LizmapWPS\WPS\Error;
use LizmapWPS\WPS\RequestHandler;
use LizmapWPS\WPS\RestApiCtrl;
use LizmapWPS\WPS\UrlServerUtil;

class processes_exec_restCtrl extends RestApiCtrl
{
    /**
     * Create a job thanks to a processID and a Map with a repository and a project.
     *
     * @return jResponseJson|object the response object containing information about the job created
     */
    public function post(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Authenticator::verify()) {
            return Error::setJSONError($rep, 401);
        }

        $processID = $this->param('processid');
        $repository = $this->param('repository');
        $projectName = $this->param('project');
        $data = $this->request->getBody();

        $project = null;

        if (!is_null($projectName) && !is_null($repository)) {
            try {
                $repoObj = lizmap::getRepository($repository);
                if (is_null($repoObj)) {
                    throw new Exception('Repository not found.');
                }
                $project = $repoObj->getProject($projectName);
            } catch (Exception $e) {
                return Error::setJSONError($rep, 404, $e->getMessage());
            }
        }

        try {
            if ($processID != null) {
                $url = UrlServerUtil::retrieveServerURL('pygiswps_server_url').
                    'processes/'.
                    $processID.
                    '/execution'.
                    '?map='.$project->getRelativeQgisPath();
                $response = RequestHandler::curlRequestPOST($url, $data);
            } else {
                $response = Error::setJSONError($rep, '400', 'Process id not found.');
            }
            $rep->data = json_decode($response, true);
        } catch (\Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setJSONError($rep, $e->getCode(), $e->getMessage());
        }

        return $rep;
    }
}
