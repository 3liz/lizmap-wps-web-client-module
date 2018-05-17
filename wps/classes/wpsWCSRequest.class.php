<?php
/**
* Manage WCS request.
* @package   lizmap
* @subpackage wps
* @author    3liz
* @copyright 2015 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class wpsWCSRequest extends lizmapOGCRequest {

    protected $tplExceptions = 'wps~wcs_exception';
    protected $xml_post = null;

    /**
     * constructor
     * project : the project has a lizmapProject Class
     * params : the params array
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

        $localConfig = jApp::configPath('localconfig.ini.php');
        $localConfig = new jIniFileModifier($localConfig);
        $this->ows_url = $localConfig->getValue('ows_url', 'wps');
    }

    public function process ( ) {
        if ( $this->xml_post !== null )
            return $this->post();
        return $this->{$this->param('request')}();
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

        if ( !array_key_exists('service', $params) )
            $params['service'] = 'WCS';

        $bparams = http_build_query($params);

        // replace some chars (not needed in php 5.4, use the 4th parameter of http_build_query)
        $a = array('+', '_', '.', '-');
        $b = array('%20', '%5F', '%2E', '%2D');
        $bparams = str_replace($a, $b, $bparams);

        $querystring = $url . $bparams;
        return $querystring;
    }

    protected function getcapabilities ( ) {
        $result = parent::getcapabilities();

        $data = $result->data;
        if ( empty( $data ) or floor( $result->code / 100 ) >= 4 ) {
            jMessage::add('Server Error !', 'Error');
            return $this->serviceException();
        }

        if ( preg_match( '#ServiceExceptionReport#i', $data ) )
            return $result;

        // Replace qgis server url in the XML (hide real location)
        $sUrl = jUrl::getFull(
          "wps~ows:index"
        );
        $sUrl = str_replace('&', '&amp;', $sUrl);
        preg_match('/<get>.*\n*.+xlink\:href="([^"]+)"/i', $data, $matches);
        if ( count( $matches ) < 2 )
            preg_match('/get onlineresource="([^"]+)"/i', $data, $matches);
        if ( count( $matches ) < 2 )
            preg_match('/ows:get.+xlink\:href="([^"]+)"/i', $data, $matches);
        if ( count( $matches ) > 1 )
            $data = str_replace($matches[1], $sUrl, $data);
        $data = str_replace('&amp;&amp;', '&amp;', $data);

        return (object) array(
            'code' => 200,
            'mime' => $result->mime,
            'data' => $data,
            'cached' => False
        );
    }

    protected function describecoverage ( ) {
        $result = null;
        if ( $this->xml_post !== null )
            $result = $this->post();
        else
            $result = $this->get();

        if ( !$result ) {
            jMessage::add('Server Error !', 'Error');
            return $this->serviceException();
        }

        $data = $result->data;
        if ( empty( $data ) or floor( $result->code / 100 ) >= 4 ) {
            jMessage::add('Server Error !', 'Error');
            return $this->serviceException();
        }

        return $result;
    }

    protected function getcoverage ( ) {
        $result = null;
        if ( $this->xml_post !== null )
            $result = $this->post();
        else
            $result = $this->get();

        if ( !$result ) {
            jMessage::add('Server Error !', 'Error');
            return $this->serviceException();
        }

        $data = $result->data;
        if ( empty( $data ) or floor( $result->code / 100 ) >= 4 ) {
            jMessage::add('Server Error !', 'Error');
            return $this->serviceException();
        }

        return $result;
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
