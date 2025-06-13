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

class jobs_restCtrl extends RestApiCtrl
{
    /**
     * Retrieves all existing jobs if 'jobid' isn't set.
     * Else, retrieves the status of a specific job.
     *
     * @return jResponseJson|object the response object containing job information
     */
    public function get(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Authenticator::verify()) {
            return Error::setError($rep, 401);
        }

        $url = UrlServerUtil::retrieveServerURL('pygiswps_server_url').'jobs';
        $jobID = $this->param('jobid');

        try {
            if ($jobID != null) {
                $response = RequestHandler::curlRequestGET($url.'/'.$jobID);
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

    /**
     * Delete a specific job.
     *
     * @return jResponseJson|object the response object containing information on the deletion process
     */
    public function delete(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Authenticator::verify()) {
            return Error::setError($rep, 401);
        }

        $url = UrlServerUtil::retrieveServerURL('pygiswps_server_url').'jobs';
        $jobID = $this->param('jobid');

        try {
            if ($jobID != null) {
                $response = RequestHandler::curlRequestDELETE($url.'/'.$jobID);
            } else {
                $response = Error::setError($rep, '400', 'Job ID not found');
            }
            $rep->data = json_decode($response, true);
        } catch (\Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setError($rep, $e->getCode(), $e->getMessage());
        }

        return $rep;
    }
}
