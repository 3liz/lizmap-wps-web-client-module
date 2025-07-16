<?php

/**
 * @author    3liz.com
 * @copyright 2011-2025 3Liz
 *
 * @see      https://3liz.com
 *
 * @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
 */

use LizmapApi\Utils;
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
        $project = $this->param('project');
        $data = $this->request->getBody();

        try {
            if ($processID != null) {
                $repositoryObject = lizmap::getRepository($repository);
                if (is_null($repositoryObject)) {
                    throw new \Exception('No repository "'.$repository.'" found', 404);
                }
                $path = Utils::getLastPartPath($repositoryObject->getOriginalPath());
                $url = UrlServerUtil::retrieveServerURL('pygiswps_server_url').
                    'processes/'.
                    $processID.
                    '/execution'.
                    '?map='.$path.$project.'.qgs';
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
