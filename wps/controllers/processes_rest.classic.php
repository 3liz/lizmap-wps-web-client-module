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

class processes_restCtrl extends RestApiCtrl
{
    /**
     * Retrieves all processes.
     * If a specific processID is set, return it.
     *
     * @return jResponseJson|object the response object containing processes information
     */
    public function get(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Authenticator::verify()) {
            return Error::setError($rep, 401);
        }

        $url = UrlServerUtil::retrieveServerURL('pygiswps_server_url').'processes';
        $processID = $this->param('processid');
        $map = $this->param('map');

        try {
            if ($processID != null) {
                $url = $url.'/'.$processID;
                if ($map != null) {
                    $url = $url.'?map='.$map;
                }
                $response = RequestHandler::curlRequestGET($url);
            } else {
                $response = RequestHandler::curlRequestGET($url);
            }
            $rep->data = json_decode($response, true);
        } catch (\Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setError($rep, $e->getCode(), $e->getMessage());
        }

        return $rep;
    }
}
