<?php

namespace LizmapWPS\WPS;

class ModelFileManager
{
    public const MODEL_PATH_PARAM_NAME = 'wps_processingModelsPath';

    public const RESTART_FILE_PATH_PARAM_NAME = 'wps_restartmonPath';

    private $modelPath;

    private function getModelsPath()
    {
        if (is_null($this->modelPath)) {
            $this->modelPath = \jApp::config()->wps[self::MODEL_PATH_PARAM_NAME];
            if (empty($this->modelPath)) {
                \jlog::log('WPS path is empty', 'lizmapadmin');

                throw new \Exception('WPS path is empty');
            }
            // ensure trailing slash is here
            if (substr($this->modelPath, -1) == '/') {
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
            if (is_file($this->getModelsPath().$file)
                && pathinfo($file, PATHINFO_EXTENSION) === 'model3') {
                $realModels[] = new ModelFile($file);
            }
        }

        return $realModels;
    }

    public function getStyleFiles()
    {
        $files = scandir($this->getModelsPath());
        $realModels = array();
        foreach ($files as $file) {
            if (is_file($this->getModelsPath().$file)
                && pathinfo($file, PATHINFO_EXTENSION) === 'qml') {
                $realModels[] = new StyleFile($file);
            }
        }

        return $realModels;
    }

    public function findBySHA1(string $sha1)
    {
        $files = scandir($this->getModelsPath());
        foreach ($files as $file) {
            if ($sha1 == sha1($file) && is_file($this->getModelsPath().$file)) {
                if (pathinfo($file, PATHINFO_EXTENSION) === 'model3') {
                    return new ModelFile($file);
                }
                if (pathinfo($file, PATHINFO_EXTENSION) === 'qml') {
                    return new StyleFile($file);
                }
            }
        }

        return false;
    }

    public function deleteModel(ModelFile $file)
    {
        unlink($this->getModelsPath().$file->fileName());
        $this->notifyWPS();
    }

    public function saveModel(\jFormsControlUpload2 $ctrl, bool $new)
    {
        // check filename
        $filePath = $this->getModelsPath().$ctrl->getNewFile();
        if ($ctrl->isModified() && !preg_match('/^.+\.model3$/i', $ctrl->getNewFile())) {
            throw new \Exception(\jLocale::get('wps.message.error.upload.model3_bad_filename'));
        }
        if (!$new && $ctrl->isModified() && $ctrl->getOriginalFile() != $ctrl->getNewFile()) {
            throw new \Exception(\jLocale::get('wps.message.error.upload.modify.not_same'));
        }
        if ($new && is_file($filePath)) {
            throw new \Exception(\jLocale::get('wps.message.error.upload.existing'));
        }
        // disable xml reader error
        $previouXMLErrorConfig = libxml_use_internal_errors(true);
        $alternateName = '';
        $originalFilePath = $this->getModelsPath().$ctrl->getNewFile();
        if (!$new) {
            // use a temp file to perform check content
            $alternateName = $ctrl->getUniqueFileName($this->getModelsPath());
            $filePath = $this->getModelsPath().$alternateName;
        }
        $ctrl->saveFile($this->getModelsPath(), $alternateName);
        $fileAsXML = simplexml_load_file($filePath);
        if ($ctrl->isModified() && ($fileAsXML === false || (!property_exists($fileAsXML, 'Option')) || $fileAsXML->attributes()['type'] != 'Map')) {
            unlink($filePath);

            throw new \Exception(\jLocale::get('wps.message.error.upload.bad_content'));
        }
        // restore xml error conf
        libxml_use_internal_errors($previouXMLErrorConfig);
        if (!$new) {
            // content is ok, rename tempfile to initial fileName
            rename($filePath, $originalFilePath);
        }
        $this->notifyWPS();
    }

    private function notifyWPS()
    {
        $restartMon = \jApp::config()->wps[self::RESTART_FILE_PATH_PARAM_NAME];
        if (empty($restartMon)) {
            \jMessage::add(\jLocale::get('wps.message.error.restart_notify'), 'danger');
        } else {
            touch($restartMon);
        }
    }

    public function deleteStyle(StyleFile $file)
    {
        unlink($this->getModelsPath().$file->fileName());
    }

    public function saveStyle(\jFormsControlUpload2 $ctrl, bool $new)
    {
        // check filename
        $filePath = $this->getModelsPath().$ctrl->getNewFile();
        if ($ctrl->isModified() && !preg_match('/^.+\.qml$/i', $ctrl->getNewFile())) {
            throw new \Exception(\jLocale::get('wps.message.error.upload.qml_bad_filename'));
        }
        if (!$new && $ctrl->isModified() && $ctrl->getOriginalFile() != $ctrl->getNewFile()) {
            throw new \Exception(\jLocale::get('wps.message.error.upload.modify.not_same'));
        }
        if ($new && is_file($filePath)) {
            throw new \Exception(\jLocale::get('wps.message.error.upload.existing'));
        }
        // disable xml reader error
        $previouXMLErrorConfig = libxml_use_internal_errors(true);
        $alternateName = '';
        $originalFilePath = $this->getModelsPath().$ctrl->getNewFile();
        if (!$new) {
            // use a temp file to perform check content
            $alternateName = $ctrl->getUniqueFileName($this->getModelsPath());
            $filePath = $this->getModelsPath().$alternateName;
        }
        $ctrl->saveFile($this->getModelsPath(), $alternateName);
        $fileAsXML = simplexml_load_file($filePath);
        if ($ctrl->isModified() && $fileAsXML === false) {
            unlink($filePath);

            throw new \Exception(\jLocale::get('wps.message.error.upload.bad_content'));
        }
        // restore xml error conf
        libxml_use_internal_errors($previouXMLErrorConfig);
        if (!$new) {
            // content is ok, rename tempfile to initial fileName
            rename($filePath, $originalFilePath);
        }
    }
}
