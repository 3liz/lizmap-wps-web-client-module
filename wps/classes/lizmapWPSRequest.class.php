<?php
/**
* Manage WPS request.
* @package   lizmap
* @subpackage wps
* @author    3liz
* @copyright 2015 3liz
* @link      http://3liz.com
* @license Mozilla Public License : http://www.mozilla.org/MPL/
*/

class lizmapWPSRequest extends lizmapOGCRequest {

    protected $tplExceptions = 'wps~wps_exception';
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
        $this->wps_url = $localConfig->getValue('wps_rootUrl', 'wps');
        if ( substr($this->wps_url, -1) != '/' )
            $this->wps_url .= '/';
        $this->wps_rootDirectories = $localConfig->getValue('wps_rootDirectories', 'wps');
        $this->ows_url = $localConfig->getValue('ows_url', 'wps');
        if ( substr($this->ows_url, -1) != '/' )
            $this->ows_url .= '/';
    }

    public function process ( ) {
        return $this->{$this->param('request')}();
    }

    protected function constructUrl ( ) {
        $url = $this->wps_url.'ows/';
        if (strpos($url, '?') === false)
            $url .= '?';

        $params = Array();
        foreach ( $this->params as $k=>$v ) {
            if ( $k !== '__httpbody' )
                $params[$k] = $v;
        }

        if ( $this->wps_rootDirectories &&
             array_key_exists('repository', $params) &&
             array_key_exists('project', $params) ) {
            $project = $params['project'];
            $repository = $params['repository'];
            $lproj = lizmap::getProject($repository.'~'.$project);
            if ( $lproj ) {
                $mapParam = $lproj->getPath();
                if ( strpos($mapParam, $this->wps_rootDirectories) === 0) {
                    $mapParam = str_replace( $this->wps_rootDirectories, '', $mapParam );
                    $mapParam = ltrim($mapParam, '/');
                    $params['map'] = $mapParam;
                    unset( $params['project'] );
                    unset( $params['repository'] );
                }
            }
        }

        if ( !array_key_exists('service', $params) )
            $params['service'] = 'WPS';

        $bparams = http_build_query($params);

        // replace some chars (not needed in php 5.4, use the 4th parameter of http_build_query)
        $a = array('+', '_', '.', '-');
        $b = array('%20', '%5F', '%2E', '%2D');
        $bparams = str_replace($a, $b, $bparams);

        $querystring = $url . $bparams;
        return $querystring;
    }

    protected function getcapabilities ( ) {
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
        if ( empty( $data ) ) {
            jMessage::add('Server Error !', 'Error');
            return $this->serviceException();
        }

        if ( preg_match( '#ServiceExceptionReport#i', $data ) )
            return $result;

        // Replace qgis server url in the XML (hide real location)
        $sUrl = jUrl::getFull(
          "wps~service:index"
        );
        $sUrl = str_replace('&', '&amp;', $sUrl);
        preg_match('/<get>.*\n*.+xlink\:href="([^"]+)"/i', $data, $matches);
        if ( count( $matches ) < 2 )
            preg_match('/get onlineresource="([^"]+)"/i', $data, $matches);
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

    function describeprocess(){
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
        if ( empty( $data ) ) {
            jMessage::add('Server Error !', 'Error');
            return $this->serviceException();
        }

        return $result;
    }

    function execute() {
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
        if ( empty( $data ) ) {
            jMessage::add('Server Error !', 'Error');
            return $this->serviceException();
        }

        preg_match_all('/wps:Reference.*xlink:href="([^"]+)"/i', $data, $matches);
        if ( count( $matches ) > 0 ) {
            $wps_url = ltrim($this->wps_url, '/');
            $store_url = $wps_url.'store/';
            foreach( $matches[1] as $oUrl ) {
                if ( substr($oUrl, 0, strlen($store_url) ) === $store_url ) {
                    $exUrl = explode('/', explode('?', substr( $oUrl, strlen($store_url) ) )[0]);
                    $sUrl = jUrl::getFull(
                        "wps~service:store",
                        array(
                            "uuid"=>$exUrl[0],
                            "file"=>$exUrl[1]
                        )
                    );
                    $sUrl = str_replace('&', '&amp;', $sUrl);
                    $data = str_replace($oUrl, $sUrl, $data);
                }
                else if ( $ows_url && $ows_url !== ''
                       && substr($oUrl, 0, strlen($ows_url) ) === $ows_url ) {
                    $sUrl = jUrl::getFull(
                      "wps~ows:index"
                    );
                    $sUrl = str_replace('&', '&amp;', $sUrl);
                    $sUrl.= '?'.explode('?', substr( $oUrl, strlen($ows_url) ) )[1];
                    $data = str_replace($oUrl, $sUrl, $data);
                }
            }
            $data = str_replace('&amp;&amp;', '&amp;', $data);
        }

        return (object) array(
            'code' => $result->code,
            'mime' => $result->mime,
            'data' => $data,
            'cached' => False
        );
    }

    function getresults(){
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
        if ( empty( $data ) ) {
            jMessage::add('Server Error !', 'Error');
            return $this->serviceException();
        }

        preg_match_all('/wps:Reference.*xlink:href="([^"]+)"/i', $data, $matches);
        if ( count( $matches ) > 0 ) {
            $ows_url = ltrim($this->ows_url, '/');
            $wps_url = ltrim($this->wps_url, '/');
            $store_url = $wps_url.'store/';
            foreach( $matches[1] as $oUrl ) {
                if ( substr($oUrl, 0, strlen($store_url) ) === $store_url ) {
                    $exUrl = explode('/', explode('?', substr( $oUrl, strlen($store_url) ) )[0]);
                    $sUrl = jUrl::getFull(
                        "wps~service:store",
                        array(
                            "uuid"=>$exUrl[0],
                            "file"=>$exUrl[1]
                        )
                    );
                    $sUrl = str_replace('&', '&amp;', $sUrl);
                    $data = str_replace($oUrl, $sUrl, $data);
                }
                else if ( $ows_url && $ows_url !== ''
                       && substr($oUrl, 0, strlen($ows_url) ) === $ows_url ) {
                    $sUrl = jUrl::getFull(
                      "wps~ows:index"
                    );
                    $sUrl = str_replace('&', '&amp;', $sUrl);
                    $sUrl.= '?'.explode('?', substr( $oUrl, strlen($ows_url)-1 ) )[1];
                    $data = str_replace($oUrl, $sUrl, $data);
                }
            }
            $data = str_replace('&amp;&amp;', '&amp;', $data);
        }
        return (object) array(
            'code' => $result->code,
            'mime' => $result->mime,
            'data' => $data,
            'cached' => False
        );
    }

    /**
     * get
     * @return request.
     */
    protected function get(){
        $querystring = $this->constructUrl();

        // Get data form server
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_URL, $querystring);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false );
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Connection: close'
        ));
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

    /**
     * post
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
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Connection: close',
            'Content-Type: text/xml'
        ));
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
