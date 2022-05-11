<?php
/**
 * Manage OGC request.
 *
 * @author    3liz
 * @copyright 2015 3liz
 *
 * @see      http://3liz.com
 *
 * @license Mozilla Public License : http://www.mozilla.org/MPL/
 */
class wpsOGCRequest extends lizmapOGCRequest
{
    protected $params;

    protected $xml_post;

    protected $services;

    protected $tplExceptions;

    protected $ows_url;

    /**
     * constructor
     * params : the params array
     * xml_post : the post request as SimpleXML element.
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

        $this->ows_url = jApp::config()->wps['ows_url'];
    }

    /**
     * Do the process.
     *
     * @internal we override the process() method of lizmapOGCRequest to be sure
     * we have the secure version of the method, in case where the lizmap version
     * is <= 3.4.3, <= 3.3.15
     *
     * @deprecated remove this overrided method when we will mark the module compatible
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
        $url = $this->ows_url;
        if (strpos($url, '?') === false) {
            $url .= '?';
        }

        $params = array();
        foreach ($this->params as $k => $v) {
            if ($k !== '__httpbody') {
                $params[$k] = $v;
            }
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
        $querystring = $this->constructUrl();

        // Get remote data
        list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);

        // Retry if 500 error ( hackish, but QGIS Server segfault sometimes with cache issue )
        if ($code == 500) {
            // Get remote data
            list($data, $mime, $code) = lizmapProxy::getRemoteData($querystring);
        }

        return (object) array(
            'code' => $code,
            'mime' => $mime,
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

        if ($this->xml_post !== null) {
            $options = array(
                'method' => 'post',
                'headers' => array(
                    'Content-Type' => 'text/xml',
                ),
                'body' => $this->xml_post,
            );
        } else {
            $options = array(
                'method' => 'get',
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
}
