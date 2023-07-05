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
class serviceCtrl extends jController
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
        if ($service != 'WPS') {
            jMessage::add('SERVICE '.$service.' is not supported!', 'InvalidRequest');

            return $this->serviceException();
        }
        if (!array_key_exists('request', $params)) {
            jMessage::add('REQUEST parameter is mandatory!', 'InvalidRequest');

            return $this->serviceException();
        }

        // WPS Config
        $wpsConfig = jApp::config()->wps;

        // WPS only available to authenticated users
        if (array_key_exists('restrict_to_authenticated_users', $wpsConfig)
            && $wpsConfig['restrict_to_authenticated_users']
            && !jAuth::isConnected()) {
            jMessage::add('Authorization is required to access WPS!', 'AuthorizationRequired');

            return $this->serviceException();
        }

        $request = strtolower($params['request']);
        $wpsRequest = null;
        if ($request == 'getcapabilities') {
            $wpsRequest = new lizmapWPSRequest(
                array(
                    'service' => 'WPS',
                    'request' => 'GetCapabilities',
                )
            );
        } elseif ($request == 'describeprocess') {
            $wpsRequest = new lizmapWPSRequest($params, $this->xml_post);
        } elseif ($request == 'execute') {
            $wpsRequest = new lizmapWPSRequest($params, $this->xml_post);
        } elseif ($request == 'getresults') {
            $wpsRequest = new lizmapWPSRequest($params, $this->xml_post);
        }

        if ($wpsRequest === null) {
            jMessage::add('REQUEST '.$request.' not supported', 'InvalidRequest');

            return $this->serviceException();
        }

        $result = $wpsRequest->process();

        $rep = $this->getResponse('binary');
        $rep->mimeType = $result->mime;
        $rep->content = $result->data;
        $rep->doDownload = false;
        $rep->outputFileName = 'wps_'.$request;

        return $rep;
    }

    /**
     * Send an OGC service Exception.
     *
     * @param $SERVICE the OGC service
     *
     * @return XML OGC Service Exception
     */
    public function serviceException()
    {
        $messages = jMessage::getAll();
        if (!$messages) {
            $messages = array();
        }
        $rep = $this->getResponse('xml');
        $rep->contentTpl = 'wps~wps_exception';
        $rep->content->assign('messages', $messages);
        jMessage::clearAll();

        foreach ($messages as $code => $msg) {
            if ($code == 'AuthorizationRequired') {
                $rep->setHttpStatus(401, $code);
            } elseif ($code == 'ProjectNotDefined') {
                $rep->setHttpStatus(404, 'Not Found');
            } elseif ($code == 'RepositoryNotDefined') {
                $rep->setHttpStatus(404, 'Not Found');
            }
        }

        return $rep;
    }

    public function store()
    {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'wps_store.json';
        $rep->mimeType = 'application/json';
        $content = 'null';
        $rep->content = $content;

        $uuid = $this->param('uuid');
        if (!$uuid) {
            return $rep;
        }

        $file = $this->param('file');
        if (!$file) {
            return $rep;
        }

        $wps_url = jApp::config()->wps['wps_rootUrl'];
        $wps_url = ltrim($wps_url, '/');
        if (substr($wps_url, -1) != '/') {
            $wps_url .= '/';
        }

        $url = $wps_url.'store/'.$uuid.'/'.$file.'?service=WPS';

        list($data, $mime, $code) = lizmapProxy::getRemoteData($url);

        $rep->outputFileName = $file;
        $rep->mimeType = $mime;
        $rep->content = $data;
        $rep->doDownload = false;

        return $rep;
    }

    public function files()
    {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'wps_store.json';
        $rep->mimeType = 'application/json';
        $content = 'null';
        $rep->content = $content;

        $uuid = $this->param('uuid');
        if (!$uuid) {
            return $rep;
        }

        $file = $this->param('file');
        if (!$file) {
            return $rep;
        }

        $wps_url = jApp::config()->wps['wps_rootUrl'];
        $wps_url = ltrim($wps_url, '/');
        if (substr($wps_url, -1) != '/') {
            $wps_url .= '/';
        }

        $url = $wps_url.'jobs/'.$uuid.'/'.'files/'.$file;

        list($data, $mime, $code) = lizmapProxy::getRemoteData($url);

        $rep->outputFileName = $file;
        $rep->mimeType = $mime;
        $rep->content = $data;
        $rep->doDownload = false;

        return $rep;
    }

    public function status()
    {
        $rep = $this->getResponse('binary');
        $rep->outputFileName = 'wps_store.json';
        $rep->mimeType = 'application/json';
        $content = 'null';
        $rep->content = $content;

        $wps_url = jApp::config()->wps['wps_rootUrl'];
        $wps_url = ltrim($wps_url, '/');
        if (substr($wps_url, -1) != '/') {
            $wps_url .= '/';
        }

        $url = $wps_url.'status/';

        $uuid = $this->param('uuid');
        if ($uuid) {
            $url .= $uuid;
        }

        $url .= '?SERVICE=WPS';

        list($data, $mime, $code) = lizmapProxy::getRemoteData($url);

        if (empty($data) or floor($code / 100) >= 4) {
            $rep->setHttpStatus($code, 'Not Found');

            return $rep;
        }

        $sUrl = jUrl::getFull(
            'wps~service:index'
        );
        $data = json_decode($data);

        if (property_exists($data, 'status')) {
            if (property_exists($data->status, 'status_url')) {
                $oUrl = $data->status->status_url;
                $data->status->status_url = $sUrl.'?'.explode('?', $oUrl)[1];
            } else {
                $uuids = array();
                foreach ($data->status as $s) {
                    $uuids[] = $s->uuid;
                }
                $data = $uuids;
            }
        }

        $rep->mimeType = $mime;
        $rep->content = json_encode($data);
        $rep->doDownload = false;

        return $rep;
    }
}
