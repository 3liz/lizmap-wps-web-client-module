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
class wpsOGCRequest extends lizmapOGCRequest {

    protected $params;

    protected $xml_post = null;

    protected $services;

    protected $tplExceptions;

    protected $ows_url;

    /**
     * constructor
     * params : the params array
     * xml_post : the post request as SimpleXML element
     */
    public function __construct ( $params, $xml_post=null ) {
        $this->services = lizmap::getServices();
        $nParams = lizmapProxy::normalizeParams($params);
        foreach ( $params as $k=>$v ) {
            if ( strtolower($k) === 'repository' || strtolower($k) === 'project' ){
                $nParams[strtolower($k)] = $v;
            }
        }
        $this->params = $nParams;
        $this->xml_post = $xml_post;

        $this->ows_url = jApp::config()->wps['ows_url'];
    }

    public function process ( ) {
        $req = $this->param('request');
        if ($req && method_exists($this, $req)) {
            return $this->{$req}();
        }

        if (!$req) {
            jMessage::add('Please add or check the value of the REQUEST parameter', 'OperationNotSupported');
        } else {
            jMessage::add('Request '.$req.' is not supported', 'OperationNotSupported');
        }

        return $this->serviceException(501);
    }

    protected function constructUrl ( ) {
        $url = $this->ows_url;
        if (strpos($url, '?') === false)
            $url .= '?';

        $params = Array();
        foreach ( $this->params as $k=>$v ) {
            if ( $k !== '__httpbody' )
                $params[$k] = $v;
        }

        $bparams = http_build_query($params);

        // replace some chars (not needed in php 5.4, use the 4th parameter of http_build_query)
        $a = array('+', '_', '.', '-');
        $b = array('%20', '%5F', '%2E', '%2D');
        $bparams = str_replace($a, $b, $bparams);

        $querystring = $url . $bparams;
        return $querystring;
    }

    protected function getcapabilities()
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
     * get
     * @return request.
     */
    protected function get(){
        $querystring = $this->constructUrl();

        // Get remote data
        $getRemoteData = lizmapProxy::getRemoteData(
          $querystring,
          $this->services->proxyMethod,
          $this->services->debugMode
        );
        $data = $getRemoteData[0];
        $mime = $getRemoteData[1];
        $code = $getRemoteData[2];

        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => False
        );
    }

    /**
     * post
     * @param string $xml_post
     * @return request.
     */
    protected function post(){
        $querystring = $this->constructUrl();

        // Get data form server
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_URL, $querystring);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type: text/xml'));
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $this->xml_post);
        $data = curl_exec($ch);
        $info = curl_getinfo($ch);
        $mime = $info['content_type'];
        $code = (int) $info['http_code'];
        curl_close($ch);


        return (object) array(
            'code' => $code,
            'mime' => $mime,
            'data' => $data,
            'cached' => False
        );
    }

}
