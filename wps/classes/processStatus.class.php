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
    protected $available;
    protected $db;

    /**
     * constructor
     * project : the project has a lizmapProject Class
     * params : the params array.
     */
    public function __construct()
    {
        $this->available = self::isAvailable();

        if (!$this->available) {
            return;
        }

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
        if (!$this->available) {
            return array();
        }

        if (!self::isAvailableForProject($repository, $project)) {
            return array();
        }

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
        if (!$this->available) {
            return null;
        }

        if (!self::isAvailableForProject($repository, $project)) {
            return null;
        }

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
        if (!$this->available) {
            return false;
        }

        if (!self::isAvailableForProject($repository, $project)) {
            return false;
        }

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
        if (!$this->available) {
            return false;
        }

        if (!self::isAvailableForProject($repository, $project)) {
            return false;
        }

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

    protected static function isAvailable() {
        // WPS Config
        $wpsConfig = jApp::config()->wps;

        // get wps rootDirectories
        $rootDirectories = $wpsConfig['wps_rootDirectories'];
        if (!$rootDirectories) {
            return false;
        }

        // WPS only available to authenticated users
        if (array_key_exists('restrict_to_authenticated_users', $wpsConfig)
            && $wpsConfig['restrict_to_authenticated_users']
            && !jAuth::isConnected()) {

            return false;
        }

        return true;
    }

    protected static function isAvailableForProject($repository, $project) {
        // WPS Config
        $wpsConfig = jApp::config()->wps;

        // get wps rootDirectories
        $rootDirectories = $wpsConfig['wps_rootDirectories'];
        if (!$rootDirectories) {
            return false;
        }

        $lrep = lizmap::getRepository($repository);
        if (!$lrep) {
            return false;
        }

        if (strpos($lrep->getPath(), $rootDirectories) !== 0) {
            return false;
        }

        $lproj = lizmap::getProject($repository.'~'.$project);
        if (!$lproj) {
            return false;
        }

        // WPS only available for configured projects
        if (array_key_exists('restrict_to_config_projects', $wpsConfig)
            && $wpsConfig['restrict_to_config_projects']
            && !file_exists($lproj->getQgisPath().'.json')) {
            return false;
        }

        return true;
    }
}
