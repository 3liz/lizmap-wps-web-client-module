<?php
/**
 * Manage WPS request.
 *
 * @author    3liz
 * @copyright 2015 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class lizmapWPSRequest extends lizmapOGCRequest
{
    protected $tplExceptions = 'wps~wps_exception';
    protected $xml_post;

    /**
     * constructor
     * project : the project has a lizmapProject Class
     * params : the params array.
     *
     * @param mixed      $params
     * @param null|mixed $xml_post
     */
    public function __construct($params, $xml_post = null)
    {
        $this->services = lizmap::getServices();
        $nParams = lizmapProxy::normalizeParams($params);
        foreach ($params as $k => $v) {
            if (strtolower($k) === 'repository' || strtolower($k) === 'project') {
                $nParams[strtolower($k)] = $v;
            }
        }
        $this->params = $nParams;
        $this->xml_post = $xml_post;

        $wpsConfig = jApp::config()->wps;
        $this->wps_url = $wpsConfig['wps_rootUrl'];
        if (substr($this->wps_url, -1) != '/') {
            $this->wps_url .= '/';
        }
        $this->wps_rootDirectories = $wpsConfig['wps_rootDirectories'];
        $this->ows_url = $wpsConfig['ows_url'];
        if (substr($this->ows_url, -1) != '/') {
            $this->ows_url .= '/';
        }
    }

    /**
     * Do the process.
     *
     * @internal we override the process() method of lizmapOGCRequest to be sure
     * we have the secure version of the method, in case where the lizmap version
     * is <= 3.4.3, <= 3.3.15
     *
     * deprecated: remove this overrided method when we will mark the module compatible
     * only with Lizmap 3.5.
     *
     * @return array
     */
    public function process()
    {
        $req = $this->param('request');
        if ($req) {
            $reqMeth = 'process_'.$req;
            if (method_exists($this, $reqMeth)) {
                return $this->{$reqMeth}();
            }
            // old unsecure way, to be compatible with methods of lizmap <= 3.4.3, <= 3.3.15
            if (method_exists($this, $req)) {
                return $this->{$req}();
            }
        }

        if (!$req) {
            jMessage::add('Please add or check the value of the REQUEST parameter', 'OperationNotSupported');
        } else {
            jMessage::add('Request '.$req.' is not supported', 'OperationNotSupported');
        }

        return $this->serviceException(501);
    }

    protected function constructUrl()
    {
        $url = $this->wps_url.'ows/';
        if (strpos($url, '?') === false) {
            $url .= '?';
        }

        $params = array();
        foreach ($this->params as $k => $v) {
            if ($k !== '__httpbody') {
                $params[$k] = $v;
            }
        }

        if ($this->wps_rootDirectories
             && array_key_exists('repository', $params)
             && array_key_exists('project', $params)) {
            $project = $params['project'];
            $repository = $params['repository'];
            $lproj = lizmap::getProject($repository.'~'.$project);
            if ($lproj) {
                $mapParam = $lproj->getPath();
                if (strpos($mapParam, $this->wps_rootDirectories) === 0) {
                    $mapParam = str_replace($this->wps_rootDirectories, '', $mapParam);
                    $mapParam = ltrim($mapParam, '/');
                    $params['map'] = $mapParam;
                    unset($params['project'] , $params['repository']);
                }
            }
        }

        if (!array_key_exists('service', $params)) {
            $params['service'] = 'WPS';
        }

        $bparams = http_build_query($params);

        // replace some chars (not needed in php 5.4, use the 4th parameter of http_build_query)
        $a = array('+', '_', '.', '-');
        $b = array('%20', '%5F', '%2E', '%2D');
        $bparams = str_replace($a, $b, $bparams);

        return $url.$bparams;
    }

    protected function process_getcapabilities()
    {
        $result = $this->doRequest();

        if (!$result) {
            jMessage::add('Server Error !', 'Error');

            return $this->serviceException();
        }

        $data = $result->data;
        if (empty($data)) {
            jMessage::add('Server Error !', 'Error');

            return $this->serviceException();
        }

        if (preg_match('#ServiceExceptionReport#i', $data)) {
            return $result;
        }

        // Replace qgis server url in the XML (hide real location)
        $sUrl = jUrl::getFull(
            'wps~service:index'
        );
        $sUrl = str_replace('&', '&amp;', $sUrl);
        preg_match('/<get>.*\n*.+xlink\:href="([^"]+)"/i', $data, $matches);
        if (count($matches) < 2) {
            preg_match('/get onlineresource="([^"]+)"/i', $data, $matches);
        }
        if (count($matches) > 1) {
            $data = str_replace($matches[1], $sUrl, $data);
        }
        $data = str_replace('&amp;&amp;', '&amp;', $data);

        return (object) array(
            'code' => 200,
            'mime' => $result->mime,
            'data' => $data,
            'cached' => false,
        );
    }

    protected function process_describeprocess()
    {
        $result = $this->doRequest();

        if (!$result) {
            jMessage::add('Server Error !', 'Error');

            return $this->serviceException();
        }

        $data = $result->data;
        if (empty($data)) {
            jMessage::add('Server Error !', 'Error');

            return $this->serviceException();
        }

        return $result;
    }

    protected function process_execute()
    {
        $result = $this->doRequest();

        if (!$result) {
            jMessage::add('Server Error !', 'Error');

            return $this->serviceException();
        }

        $data = $result->data;
        if (empty($data)) {
            jMessage::add('Server Error !', 'Error');

            return $this->serviceException();
        }

        preg_match_all('/wps:Reference.*(?:xlink:)?href="([^"]+)"/i', $data, $matches);
        if (count($matches) > 0) {
            $wps_url = ltrim($this->wps_url, '/');
            $store_url = $wps_url.'store/';
            foreach ($matches[1] as $oUrl) {
                if (substr($oUrl, 0, strlen($store_url)) === $store_url) {
                    $exUrl = explode('/', explode('?', substr($oUrl, strlen($store_url)))[0]);
                    $sUrl = jUrl::getFull(
                        'wps~service:store',
                        array(
                            'uuid' => $exUrl[0],
                            'file' => $exUrl[1],
                        )
                    );
                    $sUrl = str_replace('&', '&amp;', $sUrl);
                    $data = str_replace($oUrl, $sUrl, $data);
                } elseif ($ows_url && $ows_url !== ''
                       && substr($oUrl, 0, strlen($ows_url)) === $ows_url) {
                    $sUrl = jUrl::getFull(
                        'wps~ows:index'
                    );
                    $sUrl = str_replace('&', '&amp;', $sUrl);
                    $sUrl .= '?'.explode('?', substr($oUrl, strlen($ows_url)))[1];
                    $data = str_replace($oUrl, $sUrl, $data);
                }
            }
            $data = str_replace('&amp;&amp;', '&amp;', $data);
        }

        return (object) array(
            'code' => $result->code,
            'mime' => $result->mime,
            'data' => $data,
            'cached' => false,
        );
    }

    protected function process_getresults()
    {
        $result = $this->doRequest();

        if (!$result) {
            jMessage::add('Server Error !', 'Error');

            return $this->serviceException();
        }

        $data = $result->data;
        if (empty($data)) {
            jMessage::add('Server Error !', 'Error');

            return $this->serviceException();
        }

        preg_match_all('/wps:Reference.*(?:xlink:)?href="([^"]+)"/i', $data, $matches);
        if (count($matches) > 0) {
            $ows_url = ltrim($this->ows_url, '/');
            $wps_url = ltrim($this->wps_url, '/');
            $store_url = $wps_url.'store/';
            $jobs_url = $wps_url.'jobs/';
            foreach ($matches[1] as $oUrl) {
                if (substr($oUrl, 0, strlen($store_url)) === $store_url) {
                    $exUrl = explode('/', explode('?', substr($oUrl, strlen($store_url)))[0]);
                    $sUrl = jUrl::getFull(
                        'wps~service:store',
                        array(
                            'uuid' => $exUrl[0],
                            'file' => $exUrl[1],
                        )
                    );
                    $sUrl = str_replace('&', '&amp;', $sUrl);
                    $data = str_replace($oUrl, $sUrl, $data);
                } elseif (substr($oUrl, 0, strlen($jobs_url)) === $jobs_url) {
                    $exUrl = explode('/', explode('?', substr($oUrl, strlen($jobs_url)))[0]);
                    if (count($exUrl) > 2 && $exUrl[1] == 'files') {
                        $fUrl = jUrl::getFull(
                            'wps~service:files',
                            array(
                                'uuid' => $exUrl[0],
                                'file' => $exUrl[2],
                            )
                        );
                        $fUrl = str_replace('&', '&amp;', $fUrl);
                        $data = str_replace($oUrl, $fUrl, $data);
                    }
                } elseif ($ows_url && $ows_url !== ''
                       && substr($oUrl, 0, strlen($ows_url)) === $ows_url) {
                    $sUrl = jUrl::getFull(
                        'wps~ows:index'
                    );
                    $sUrl = str_replace('&', '&amp;', $sUrl);
                    $sUrl .= '?'.explode('?', substr($oUrl, strlen($ows_url) - 1))[1];
                    $data = str_replace($oUrl, $sUrl, $data);
                }
            }
            $data = str_replace('&amp;&amp;', '&amp;', $data);
        }

        return (object) array(
            'code' => $result->code,
            'mime' => $result->mime,
            'data' => $data,
            'cached' => false,
        );
    }

    /**
     * @return array
     */
    protected function doRequest()
    {
        $querystring = $this->constructUrl();

        $headers = $this->userHttpHeader();
        $headers['Connection'] = 'close';

        if ($this->xml_post !== null) {
            $headers['Content-Type'] = 'text/xml';
            $options = array(
                'method' => 'post',
                'headers' => $headers,
                'body' => $this->xml_post,
            );
        } else {
            $options = array(
                'method' => 'get',
                'headers' => $headers,
            );
        }

        // launch request
        list($data, $mime, $code) = lizmapProxy::getRemoteData(
            $querystring,
            $options
        );

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => false,
        );
    }

    protected function userHttpHeader()
    {
        // Check if a user is authenticated
        if (!jAuth::isConnected()) {
            // return empty header array
            return array();
        }

        $user = jAuth::getUserSession();
        $userGroups = jAcl2DbUserGroup::getGroups();

        $headers = array(
            'X-Lizmap-User' => $user->login,
            'X-Lizmap-User-Groups' => implode(', ', $userGroups),
        );

        $wpsConfig = jApp::config()->wps;
        if (array_key_exists('restrict_to_authenticated_users', $wpsConfig)
            && $wpsConfig['restrict_to_authenticated_users']
            && array_key_exists('enable_job_realm', $wpsConfig)
            && $wpsConfig['enable_job_realm']
            && array_key_exists('repository', $this->params)
            && array_key_exists('project', $this->params)) {
            $project = $this->params['project'];
            $repository = $this->params['repository'];
            $lrep = lizmap::getRepository($repository);
            $lproj = lizmap::getProject($repository.'~'.$project);
            $realm = jApp::coord()->request->getDomainName()
                .'~'.$lrep->getKey()
                .'~'.$lproj->getKey()
                .'~'.jAuth::getUserSession()->login;
            $headers['X-Job-Realm'] = sha1($realm);

            if ($this->param('request') == 'getresults'
                && jAcl2::check('lizmap.admin.access')
                && array_key_exists('admin_job_realm', $wpsConfig)
                && $wpsConfig['admin_job_realm']
            ) {
                $headers['X-Job-Realm'] = $wpsConfig['admin_job_realm'];
            }
        }

        return $headers;
    }
}
