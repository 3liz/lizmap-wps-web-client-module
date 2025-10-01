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
            return Error::setJSONError($rep, 401);
        }

        $jobID = $this->param('jobid');

        try {
            if ($jobID != null) {
                $url = UrlServerUtil::retrieveServerURL('pygiswps_server_url').'jobs/'.$jobID.'/results';
                $response = RequestHandler::curlRequestGET($url);
            } else {
                $response = Error::setJSONError($rep, '400', 'Job id not found.');
            }
            $json = json_decode($response, true);

            $json = $this->handleTypes($json);

            $rep->data = $json;
        } catch (\Exception $e) {
            jLog::logEx($e, 'error');

            return Error::setJSONError($rep, $e->getCode(), $e->getMessage());
        }

        return $rep;
    }

    /**
     * Handle types like JSON or GEOPACKAGE where we have the WPS Server address in the 'href'.
     *
     * @param array $json JSON array containing result's information
     *
     * @return array JSON array without the WPS Server address
     */
    private function handleTypes(array $json): array
    {
        $WPSurl = UrlServerUtil::retrieveServerURL('pygiswps_server_url');

        foreach ($json as &$item) {
            if (isset($item['href'])) {
                $href = $item['href'];
                if (str_contains($href, $WPSurl)) {
                    $item['href'] = explode($this->param('jobid').'/', $href)[1];
                }
            }
        }
        unset($item);

        return $json;
    }
}
