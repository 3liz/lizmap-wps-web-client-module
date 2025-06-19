<?php

/**
 * @author    3liz.com
 * @copyright 2011-2025 3Liz
 *
 * @see      https://3liz.com
 *
 * @license   https://www.mozilla.org/MPL/ Mozilla Public Licence
 */

namespace LizmapWPS\WPS;

class RequestHandler
{
    /**
     * Sends a GET request to the specified URL using cURL and returns the response.
     *
     * @param string $url the URL to which the GET request will be sent
     *
     * @return string the response returned from the server
     */
    public static function curlRequestGET(string $url): string
    {
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Accept: application/json',
        ));

        $response = curl_exec($ch);
        curl_close($ch);

        return $response;
    }

    /**
     * Sends a POST request to the specified URL with the provided data.
     *
     * @param string $url  the URL to send the POST request to
     * @param string $data the data to be sent in the POST request body
     *
     * @return string the response returned by the request
     */
    public static function curlRequestPOST(string $url, string $data): string
    {
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Accept: application/json',
        ));

        $response = curl_exec($ch);
        curl_close($ch);

        return $response;
    }

    /**
     * Sends a DELETE request to the specified URL.
     *
     * @param string $url the URL to send the DELETE request to
     *
     * @return string the response returned by the request
     */
    public static function curlRequestDELETE(string $url): string
    {
        $ch = curl_init($url);

        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'DELETE');
        curl_setopt($ch, CURLOPT_HTTPHEADER, array(
            'Accept: application/json',
        ));

        $response = curl_exec($ch);
        curl_close($ch);

        return $response;
    }
}
