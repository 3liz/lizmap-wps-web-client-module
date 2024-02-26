<?php

namespace LizmapWPS\WPS;

class ModelFileManager
{
    public const MODEL_PATH_PARAM_NAME = 'wps_processingModelsPath';

    public const RESTART_FILE_PATH_PARAM_NAME = 'wps_restartmonPath';

    private $modelPath = null;

    private function getModelsPath()
    {
        if (is_null($this->modelPath)) {
            $this->modelPath = \jApp::config()->wps[self::MODEL_PATH_PARAM_NAME];
            if (empty($this->modelPath)) {
                \jlog::log('WPS path is empty', 'lizmapadmin');
                throw new \Exception('WPS path is empty');
            }
            // ensure trailing slash is here
            if(substr($this->modelPath, -1) == '/') {
                $this->modelPath.'/';
            }
            if (!is_dir($this->modelPath)) {
                \jlog::log('WPS path is invalid', 'lizmapadmin');
                throw new \Exception('WPS path is invalid');
            }
        }
        return $this->modelPath;
    }

    public function getModelFiles()
    {
        $files = scandir($this->getModelsPath());
        $realModels = array();
        foreach ($files as $file) {
            if (is_file($this->getModelsPath().$file)) {
                $realModels[] = new ModelFile($file);
            }
        }

        return $realModels;
    }

    public function findBySHA1(string $sha1)
    {
        $files = scandir($this->getModelsPath());
        foreach ($files as $file) {
            if ($sha1 == sha1($file) && is_file($this->getModelsPath().$file)) {
                return new ModelFile($file);
            }
        }

        return false;
    }

    public function delete(ModelFile $file)
    {
        unlink($this->getModelsPath().$file->fileName());
        $this->notifyWPS();
    }

    public function saveFile(\jFormsControlUpload2 $ctrl) {
        // check filename
        $filePath = $this->getModelsPath().$ctrl->getNewFile();
        if (!preg_match('/^.+\.model3$/i', $ctrl->getNewFile())) {
            throw new \Exception(\jLocale::get('wps.message.error.upload.bad_filename'));
        }
        if (is_file($filePath)) {
            throw new \Exception(\jLocale::get('wps.message.error.upload.existing'));
        }
        // disable xml reader error
        $previouXMLErrorConfig = libxml_use_internal_errors(true);
        $ctrl->saveFile($this->getModelsPath());
        $fileAsXML = simplexml_load_file($filePath);
        if ($fileAsXML === false || (!property_exists($fileAsXML, "Option")) || $fileAsXML->attributes()['type'] != "Map" ) {
            unlink($filePath);
            throw new \Exception(\jLocale::get('wps.message.error.upload.bad_content'));
        }
        // restore xml error conf
        libxml_use_internal_errors($previouXMLErrorConfig);

        $this->notifyWPS();
    }

    private function notifyWPS() {
        $restartMon = \jApp::config()->wps[self::RESTART_FILE_PATH_PARAM_NAME];
        if (empty($restartMon)) {
            \jMessage::add(\jLocale::get('wps.message.error.restart_notify'), 'danger');
        } else {
            touch($restartMon);
        }
    }
}
