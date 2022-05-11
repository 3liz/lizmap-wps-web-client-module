<?php
/**
 * Php proxy to access map services.
 *
 * @author    3liz
 * @copyright 2017 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class owsCtrl extends jController
{
    protected $params;
    protected $xml_post;

    public function index()
    {

        // Variable stored to log lizmap metrics
        $_SERVER['LIZMAP_BEGIN_TIME'] = microtime(true);

        if (isset($_SERVER['PHP_AUTH_USER'])) {
            $ok = jAuth::login($_SERVER['PHP_AUTH_USER'], $_SERVER['PHP_AUTH_PW']);
        }

        // Get and normalize the passed parameters
        $pParams = jApp::coord()->request->params;
        $params = lizmapProxy::normalizeParams($pParams);
        foreach ($pParams as $k => $v) {
            if (strtolower($k) === 'repository' || strtolower($k) === 'project') {
                $params[strtolower($k)] = $v;
            }
        }
        $this->params = $params;

        // Get and parsed xml post
        $requestXml = $this->param('__httpbody');

        if ($requestXml) {
            $xml = simplexml_load_string($requestXml);
            if ($xml !== false) {
                $attrs = $xml->attributes();
                if (isset($attrs['service'])) {
                    $params['service'] = (string) $attrs['service'];
                    if (isset($attrs['version'])) {
                        $params['version'] = (string) $attrs['version'];
                    }
                    $xml_request = $xml->getName();
                    if (strpos($xml_request, ':') !== false) {
                        $xml_request = explode(':', $xml_request)[1];
                    }
                    $params['request'] = (string) $xml_request;
                    $this->xml_post = $requestXml;
                }
            }
        }

        // Return the appropriate action
        if (!array_key_exists('service', $params)) {
            jMessage::add('SERVICE parameter is mandatory!', 'InvalidRequest');

            return $this->serviceException();
        }
        $service = strtoupper($params['service']);
        if (!array_key_exists('request', $params)) {
            jMessage::add('REQUEST parameter is mandatory!', 'InvalidRequest');

            return $this->serviceException();
        }
        $request = strtolower($params['request']);

        $owsRequest = null;
        if ($service === 'WMS') {
            $owsRequest = new wpsWMSRequest($params, $this->xml_post);
        } elseif ($service === 'WFS') {
            $owsRequest = new wpsWFSRequest($params, $this->xml_post);
        } elseif ($service === 'WCS') {
            $owsRequest = new wpsWCSRequest($params, $this->xml_post);
        }

        if ($owsRequest === null) {
            jMessage::add('SERVICE '.$service.' not supported', 'InvalidRequest');

            return $this->serviceException();
        }

        $result = $owsRequest->process();

        $rep = $this->getResponse('binary');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
        $rep->doDownload = false;
        $rep->outputFileName = $service.'_'.$request;

        return $rep;
    }
}
