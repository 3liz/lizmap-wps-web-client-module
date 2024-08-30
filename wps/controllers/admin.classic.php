<?php

use LizmapWPS\WPS;

class adminCtrl extends jController
{
    // only for admin
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'wps.modelfile.manage'),
    );

    public function showUploadModel()
    {
        $formID = null;
        if (!empty($this->param('fileId'))) {
            $formID = $this->param('fileId');
        }
        $form = jForms::get('wps~model_upload', $formID);
        if (is_null($form)) {
            $form = jForms::create('wps~model_upload', $formID);
        }
        if ($formID != null) {
            // file update : ensure it exists and set data
            $finder = new WPS\ModelFileManager();
            $file = $finder->findBySHA1($formID);
            if ($file === false) {
                \jMessage::add(\jLocale::get('wps.message.error.unknow_file'), 'error');

                return $this->redirect('admin:list');
            }
            $formUploadCtrl = $form->getControl('modelfile');
            $formUploadCtrl->setDataFromDao($file->fileName(), 'string');
        }

        /**
         * @var jResponseHTML; $resp
         */
        $resp = $this->getResponse('html');
        $resp->body->assign('selectedMenuItem', 'wps_admin_upload');
        $tpl = new jTpl();
        $tpl->assign('form', $form);
        $tpl->assign('fileId', $formID);
        $resp->body->assign('MAIN', $tpl->fetch('admin.model3.showform'));

        return $resp;
    }

    public function saveUploadModel()
    {
        $formID = null;
        $newFile = true;
        if (!empty($this->param('fileId'))) {
            $formID = $this->param('fileId');
            $newFile = false;
        }

        /**
         * @var jResponseHTML; $resp
         */
        $resp = $this->getResponse('redirect');
        $form = jForms::fill('wps~model_upload', $formID);

        if (is_null($form) || !$form->check()) {
            return $this->redirect('admin:showUploadModel', array('fileId' => $formID));
        }
        $finder = new WPS\ModelFileManager();

        /** @var \jFormsControlUpload2 $uploadCtrl */
        $uploadCtrl = $form->getControl('modelfile');

        try {
            $finder->saveModel($uploadCtrl, $newFile);
        } catch (Exception $e) {
            $form->setErrorOn('modelfile', $e->getMessage());

            return $this->redirect('admin:showUploadModel', array('fileId' => $formID));
        }
        if ($newFile) {
            \jMessage::add(\jLocale::get('wps.message.ok.file_added'), 'success');
            jForms::destroy('wps~model_upload');
        } else {
            \jMessage::add(\jLocale::get('wps.message.ok.file_modified'), 'success');
            jForms::destroy('wps~model_upload', $formID);
        }

        $resp->action = 'wps~admin:list';

        return $resp;
    }

    public function confirmDeleteModel()
    {
        $finder = new WPS\ModelFileManager();

        $file = $finder->findBySHA1($this->param('fileId'));
        if ($file === false) {
            \jMessage::add(\jLocale::get('wps.message.error.unknow_file'), 'error');

            return $this->redirect('admin:list');
        }

        $tpl = \lizmap::getAppContext()->getTpl();
        $tpl->assign('file', $file);

        /**
         * @var jResponseHTML; $resp
         */
        $resp = $this->getResponse('html');
        $resp->body->assign('MAIN', $tpl->fetch('wps~admin.model3.confirmdelete'));

        return $resp;
    }

    public function deleteModel()
    {
        $finder = new WPS\ModelFileManager();

        $file = $finder->findBySHA1($this->param('fileId'));
        if ($file === false) {
            \jMessage::add(\jLocale::get('wps.message.error.unknown_file'), 'error');

            return $this->redirect('admin:list');
        }

        $finder->deleteModel($file);
        \jMessage::add(\jLocale::get('wps.message.ok.file_deleted'), 'success');

        return $this->redirect('admin:list');
    }

    public function showUploadStyle()
    {
        $formID = null;
        if (!empty($this->param('fileId'))) {
            $formID = $this->param('fileId');
        }
        $form = jForms::get('wps~style_upload', $formID);
        if (is_null($form)) {
            $form = jForms::create('wps~style_upload', $formID);
        }
        if ($formID != null) {
            // file update : ensure it exists and set data
            $finder = new WPS\ModelFileManager();
            $file = $finder->findBySHA1($formID);
            if ($file === false) {
                \jMessage::add(\jLocale::get('wps.message.error.unknow_file'), 'error');

                return $this->redirect('admin:list');
            }
            $formUploadCtrl = $form->getControl('stylefile');
            $formUploadCtrl->setDataFromDao($file->fileName(), 'string');
        }

        /**
         * @var jResponseHTML; $resp
         */
        $resp = $this->getResponse('html');
        $resp->body->assign('selectedMenuItem', 'wps_admin_upload');
        $tpl = new jTpl();
        $tpl->assign('form', $form);
        $tpl->assign('fileId', $formID);
        $resp->body->assign('MAIN', $tpl->fetch('admin.qml.showform'));

        return $resp;
    }

    public function saveUploadStyle()
    {
        $formID = null;
        $newFile = true;
        if (!empty($this->param('fileId'))) {
            $formID = $this->param('fileId');
            $newFile = false;
        }

        /**
         * @var jResponseHTML; $resp
         */
        $resp = $this->getResponse('redirect');
        $form = jForms::fill('wps~style_upload', $formID);

        if (is_null($form) || !$form->check()) {
            return $this->redirect('admin:showUploadStyle', array('fileId' => $formID));
        }
        $finder = new WPS\ModelFileManager();

        /** @var \jFormsControlUpload2 $uploadCtrl */
        $uploadCtrl = $form->getControl('stylefile');

        try {
            $finder->saveModel($uploadCtrl, $newFile);
        } catch (Exception $e) {
            $form->setErrorOn('stylefile', $e->getMessage());

            return $this->redirect('admin:showUploadStyle', array('fileId' => $formID));
        }
        if ($newFile) {
            \jMessage::add(\jLocale::get('wps.message.ok.file_added'), 'success');
            jForms::destroy('wps~style_upload');
        } else {
            \jMessage::add(\jLocale::get('wps.message.ok.file_modified'), 'success');
            jForms::destroy('wps~style_upload', $formID);
        }

        $resp->action = 'wps~admin:list';

        return $resp;
    }

    public function confirmDeleteStyle()
    {
        $finder = new WPS\ModelFileManager();

        $file = $finder->findBySHA1($this->param('fileId'));
        if ($file === false) {
            \jMessage::add(\jLocale::get('wps.message.error.unknow_file'), 'error');

            return $this->redirect('admin:list');
        }

        $tpl = \lizmap::getAppContext()->getTpl();
        $tpl->assign('file', $file);

        /**
         * @var jResponseHTML; $resp
         */
        $resp = $this->getResponse('html');
        $resp->body->assign('MAIN', $tpl->fetch('wps~admin.qml.confirmdelete'));

        return $resp;
    }

    public function deleteStyle()
    {
        $finder = new WPS\ModelFileManager();

        $file = $finder->findBySHA1($this->param('fileId'));
        if ($file === false) {
            \jMessage::add(\jLocale::get('wps.message.error.unknown_file'), 'error');

            return $this->redirect('admin:list');
        }

        $finder->deleteStyle($file);
        \jMessage::add(\jLocale::get('wps.message.ok.file_deleted'), 'success');

        return $this->redirect('admin:list');
    }

    public function list()
    {
        /**
         * @var jResponseHTML; $resp
         */
        $resp = $this->getResponse('html');
        $resp->body->assign('selectedMenuItem', 'wps_admin_upload');
        $tpl = new jTpl();
        $finder = new WPS\ModelFileManager();
        $models = array();
        $styles = array();

        try {
            $models = $finder->getModelFiles();
        } catch (\Exception $e) {
            \jMessage::add(\jLocale::get('wps.message.error.model3_path_invalid'), 'error');

            return $resp;
        }

        try {
            $styles = $finder->getStyleFiles();
        } catch (\Exception $e) {
            \jMessage::add(\jLocale::get('wps.message.error.model3_path_invalid'), 'error');

            return $resp;
        }
        $tpl->assign('models', $models);
        $tpl->assign('styles', $styles);
        $resp->body->assign('MAIN', $tpl->fetch('admin.list'));

        return $resp;
    }
}
