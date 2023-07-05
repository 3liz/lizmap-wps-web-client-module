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
        $options = array(
            'method' => 'get',
            'headers' => self::userHttpHeader($repository, $project),
        );
        list($data, $mime, $code) = lizmapProxy::getRemoteData($url, $options);

        if (empty($data) or floor($code / 100) >= 4) {
            jLog::log('Status get all is empty or failed with code '.$code, 'errors');

            $data = array();
        }

        $wpsConfig = jApp::config()->wps;
        $realm = null;
        if (array_key_exists('restrict_to_authenticated_users', $wpsConfig)
            && $wpsConfig['restrict_to_authenticated_users']
            && array_key_exists('enable_job_realm', $wpsConfig)
            && $wpsConfig['enable_job_realm']
            && array_key_exists('X-Job-Realm', $options['headers'])) {
            $realm = $options['headers']['X-Job-Realm'];
        }
        $adminRealm = $wpsConfig['admin_job_realm'];
        $data = json_decode($data);

        if (property_exists($data, 'status')) {
            $uuids = array();
            foreach ($data->status as $s) {
                if ($realm === null
                    || $realm === $adminRealm
                    || $s->realm === $realm) {
                    $uuids[] = $s->uuid;
                }
            }
            $data = $uuids;
        } else {
            $data = array();
        }

        $saved = $this->getFromDb($identifier, $repository, $project);

        if (!$saved) {
            return array();
        }

        if (count($saved) > 0) {
            $uuids = array();
            foreach ($data as $d) {
                if (in_array($d, $saved)) {
                    $uuids[] = $d;
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
        $options = array(
            'method' => 'get',
            'headers' => self::userHttpHeader($repository, $project),
        );
        list($data, $mime, $code) = lizmapProxy::getRemoteData($url, $options);
        if (empty($data) or floor($code / 100) >= 4) {
            jLog::log('Status get '.$uuid.' is empty or failed with code '.$code, 'errors');

            return null;
        }

        $status = $this->getFromDb($identifier, $repository, $project, $uuid);
        if (!$status) {
            jLog::log('Status get '.$uuid.' not in db', 'errors');

            return null;
        }

        return $status;
    }

    public function update($identifier, $repository, $project, $uuid, $status)
    {
        if (!$this->available) {
            return false;
        }

        if (!self::isAvailableForProject($repository, $project)) {
            return false;
        }

        return $this->setToDb($identifier, $repository, $project, $uuid, $status);
    }

    public function delete($identifier, $repository, $project, $uuid)
    {
        if (!$this->available) {
            return false;
        }

        if (!self::isAvailableForProject($repository, $project)) {
            return false;
        }

        return $this->setToDb($identifier, $repository, $project, $uuid);
    }

    protected function getFromDb($identifier, $repository, $project, $uuid = null)
    {
        // Get the list of uuids saved in db
        $saved = $this->db->get($identifier.':'.$repository.':'.$project);

        if (!$saved && !$uuid) {
            // the list of uuids is empty and no uuid provided
            // return an empty list, it is probably the first time
            // db is requested
            return array();
        }
        if (!$saved && $uuid) {
            // the list of uuids is empty and a uuid provided
            // log message and set an empty array
            jLog::log('Status getFromDb '.$identifier.':'.$repository.':'.$project.' not in db');
            $saved = array();
        } else {
            // the list of uuids is not empty in db
            // transform to an aray and removed empty string
            $saved = explode(',', $saved);
            $saved = array_filter($saved, function ($s) {
                return strlen($s) != 0;
            });
        }

        // No uuid provided, returns the list of uuids as an array
        if (!$uuid) {
            return $saved;
        }

        // Get the status from DB
        $status = $this->db->get($uuid);
        if (!$status) {
            jLog::log('Status getFromDb '.$uuid.' not in db');

            $this->setToDb($identifier, $repository, $project, $uuid);

            return null;
        }
        $this->setToDb($identifier, $repository, $project, $uuid, $status);

        return json_decode($status);
    }

    public function setToDb($identifier, $repository, $project, $uuid, $status = null)
    {
        // Get list of uuids
        $saved = $this->getFromDb($identifier, $repository, $project);

        // if status is null, update the db by removing uuid from list and status in db associated
        if ($status === null) {
            if (!in_array($uuid, $saved)) {
                // check if uuid is in db and removed it
                if ($this->db->get($uuid)) {
                    $this->db->delete($uuid);

                    return true;
                }
                // Nothing has been done
                return false;
            }

            // Reduced the list of uuids
            unset($saved[array_search($uuid, $saved)]);

            // removed uuid and saved new uuids list
            $this->db->delete($uuid);
            $this->db->set($identifier.':'.$repository.':'.$project, implode(',', $saved));

            return true;
        }

        // Adding uuid to the list if needed
        if (!in_array($uuid, $saved)) {
            $saved[] = $uuid;
        }

        // Save status associated to the uuid to the db
        if (is_object($status) || is_array($status)) {
            $this->db->set($uuid, json_encode($status));
        } else {
            $this->db->set($uuid, $status);
        }

        // Save list of uuids
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

    protected static function isAvailable()
    {
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

    protected static function isAvailableForProject($repository, $project)
    {
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

    public function allFromServer($identifier, $repository, $project)
    {
        $url = $this->url.'?SERVICE=WPS';
        $headers = $this->userHttpHeader($repository, $project);
        $options = array(
            'method' => 'get',
            'headers' => $headers,
        );
        list($data, $mime, $code) = lizmapProxy::getRemoteData($url, $options);

        if (empty($data) or floor($code / 100) >= 4) {
            $data = array();
        } else {
            $data = json_decode($data);
        }

        return $data;
    }

    protected static function userHttpHeader($repository, $project)
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
        ) {
            $lrep = lizmap::getRepository($repository);
            $lproj = lizmap::getProject($repository.'~'.$project);
            $realm = jApp::coord()->request->getDomainName()
                .'~'.$lrep->getKey()
                .'~'.$lproj->getKey()
                .'~'.jAuth::getUserSession()->login;
            $headers['X-Job-Realm'] = sha1($realm);

            if (jAcl2::check('lizmap.admin.access')
                && array_key_exists('admin_job_realm', $wpsConfig)
                && $wpsConfig['admin_job_realm']
            ) {
                $headers['X-Job-Realm'] = $wpsConfig['admin_job_realm'];
            }
        }

        return $headers;
    }
}
