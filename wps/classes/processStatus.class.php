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
class processStatus
{
    protected static $profile = 'wpsProcessStatus';
    protected $db;

    /**
     * constructor
     * project : the project has a lizmapProject Class
     * params : the params array.
     */
    public function __construct()
    {
        self::declareRedisProfile();
        $this->db = jKVDb::getConnection(self::$profile);
        $wps_url = jApp::config()->wps['wps_rootUrl'];
        $wps_url = ltrim($wps_url, '/');
        if (substr($wps_url, -1) != '/') {
            $wps_url .= '/';
        }

        $this->url = $wps_url.'status/';
    }

    public function saved($identifier, $repository, $project)
    {
        $url = $this->url.'?SERVICE=WPS';
        list($data, $mime, $code) = lizmapProxy::getRemoteData($url);

        if (empty($data) or floor($code / 100) >= 4) {
            $data = array();
        }

        $data = json_decode($data);

        if (property_exists($data, 'status')) {
            $uuids = array();
            foreach ($data->status as $s) {
                $uuids[] = $s->uuid;
            }
            $data = $uuids;
        } else {
            $data = array();
        }

        $saved = $this->db->get($identifier.':'.$repository.':'.$project);

        if (!$saved) {
            return array();
        }

        $saved = explode(',', $saved);
        if (count($saved) > 0) {
            $uuids = array();
            foreach ($saved as $s) {
                if (in_array($s, $data)) {
                    $uuids[] = $s;
                }
            }

            return $uuids;
        }

        return array();
    }

    public function get($identifier, $repository, $project, $uuid)
    {
        $url = $this->url.$uuid.'?SERVICE=WPS';
        list($data, $mime, $code) = lizmapProxy::getRemoteData($url);

        $saved = $this->saved($identifier, $repository, $project);

        $status = $this->db->get($uuid);
        if (empty($data) or floor($code / 100) >= 4) {
            $status = null;
        }

        if (!$status) {
            unset($saved[array_search($uuid, $saved)]);
            $this->db->set($identifier.':'.$repository.':'.$project, implode(',', $saved));

            return null;
        }

        return json_decode($status);
    }

    public function update($identifier, $repository, $project, $uuid, $status)
    {
        $saved = $this->saved($identifier, $repository, $project);

        if (!in_array($uuid, $saved)) {
            $saved[] = $uuid;
        }

        if (is_object($status) || is_array($status)) {
            $this->db->set($uuid, json_encode($status));
        } else {
            $this->db->set($uuid, $status);
        }

        $this->db->set($identifier.':'.$repository.':'.$project, implode(',', $saved));

        return true;
    }

    public function delete($identifier, $repository, $project, $uuid)
    {
        $saved = $this->saved($identifier, $repository, $project);

        if (!in_array($uuid, $saved)) {
            return false;
        }

        $this->db->delete($uuid);
        unset($saved[array_search($uuid, $saved)]);

        $this->db->set($identifier.':'.$repository.':'.$project, implode(',', $saved));

        return true;
    }

    protected static function declareRedisProfile()
    {
        $wpsConfig = jApp::config()->wps;

        $statusRedisHost = $wpsConfig['redis_host'];
        $statusRedisPort = $wpsConfig['redis_port'];
        $statusRedisKeyPrefix = $wpsConfig['redis_key_prefix'];
        $statusRedisDb = $wpsConfig['redis_db'];

        if (extension_loaded('redis')) {
            $driver = 'redis_ext';
        } else {
            $driver = 'redis_php';
        }

        // Virtual status profile parameter
        $statusParams = array(
            'driver' => $driver,
            'host' => $statusRedisHost,
            'port' => $statusRedisPort,
            'key_prefix' => $statusRedisKeyPrefix,
            'db' => $statusRedisDb,
        );

        // Create the virtual status profile
        jProfiles::createVirtualProfile('jkvdb', self::$profile, $statusParams);
    }
}
