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
     * Create a job thanks to a processID and a Map.
     *
     * @return jResponseJson|object the response object containing information about the job created
     */
    public function post(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Authenticator::verify()) {
            return Error::setError($rep, 401);
        }

        $processID = $this->param('processid');
        $map = $this->param('map');
        $data = $this->request->getBody();

        try {
            if ($processID != null) {
                $url = UrlServerUtil::retrieveServerURL('pygiswps_server_url').
                    'processes/'.
                    $processID.
                    '/execution'.
                    '?map='.
                    $map;
                $response = RequestHandler::curlRequestPOST($url, $data);
            } else {
                $response = Error::setError($rep, '400', 'Process id not found.');
            }
            $rep->data = json_decode($response, true);
        } catch (\Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setError($rep, $e->getCode(), $e->getMessage());
        }

        return $rep;
    }
}
