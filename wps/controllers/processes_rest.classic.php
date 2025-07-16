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

class processes_restCtrl extends RestApiCtrl
{
    /**
     * Retrieves all processes.
     * If a specific processID is set, return it.
     * Optionals 'repository' and 'project' to build map path.
     *
     * @return jResponseJson|object the response object containing processes information
     */
    public function get(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Authenticator::verify()) {
            return Error::setJSONError($rep, 401);
        }

        $url = UrlServerUtil::retrieveServerURL('pygiswps_server_url').'processes';
        $processID = $this->param('processid');
        $repository = $this->param('repository');
        $project = $this->param('project');

        try {
            if ($processID != null) {
                $url = $url.'/'.$processID;
                if ($repository != null && $project != null) {
                    $repositoryObject = lizmap::getRepository($repository);
                    if (is_null($repositoryObject)) {
                        throw new \Exception('No repository "'.$repository.'" found', 404);
                    }
                    $path = Utils::getLastPartPath($repositoryObject->getOriginalPath());
                    $url = $url.'?map='.$path.$project.'.qgs';
                }
                $response = RequestHandler::curlRequestGET($url);
            } else {
                $response = RequestHandler::curlRequestGET($url);
            }
            $rep->data = json_decode($response, true);
        } catch (\Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setJSONError($rep, $e->getCode(), $e->getMessage());
        }

        return $rep;
    }
}
