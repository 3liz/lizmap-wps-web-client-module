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

class jobs_results_restCtrl extends RestApiCtrl
{
    /**
     * Retrieves the result of a job.
     *
     * @return jResponseJson|object the response object containing job's result
     */
    public function get(): object
    {
        /** @var jResponseJson $rep */
        $rep = $this->getResponse('json');

        if (!Authenticator::verify()) {
            return Error::setError($rep, 401);
        }

        $jobID = $this->param('jobid');

        try {
            if ($jobID != null) {
                $url = UrlServerUtil::retrieveServerURL('pygiswps_server_url').'jobs/'.$jobID.'/results';
                $response = RequestHandler::curlRequestGET($url);
            } else {
                $response = Error::setError($rep, '400', 'Job id not found.');
            }
            $rep->data = json_decode($response, true);
        } catch (\Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setError($rep, $e->getCode(), $e->getMessage());
        }

        return $rep;
    }
}
