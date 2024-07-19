<?php

use LizmapWPS\WPS;

class adminCtrl extends jController
{
    // only for admin
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'wps.modelfile.manage'),
    );

    public function showUpload()
    {
        $form = jForms::get('wps~model_upload');
        if (is_null($form)) {
            $form = jForms::create('wps~model_upload');
        }

        /**
         * @var jResponseHTML; $resp
         */
        $resp = $this->getResponse('html');
        $resp->body->assign('selectedMenuItem', 'wps_admin_upload');
        $tpl = new jTpl();
        $tpl->assign('form', $form);
        $resp->body->assign('MAIN', $tpl->fetch('admin.showform'));

        return $resp;
    }

    public function saveUpload()
    {
        /**
         * @var jResponseHTML; $resp
         */
        $resp = $this->getResponse('redirect');
        $form = jForms::fill('wps~model_upload');

        if (is_null($form) || !$form->check()) {
            return $this->redirect('admin:showUpload');
        }
        $finder = new WPS\ModelFileManager();

        /** @var \jFormsControlUpload2 $uploadCtrl */
        $uploadCtrl = $form->getControl('modelfile');

        try {
            $finder->saveFile($uploadCtrl);
        } catch (Exception $e) {
            $form->setErrorOn('modelfile', $e->getMessage());

            return $this->redirect('admin:showUpload');
        }
        \jMessage::add(\jLocale::get('wps.message.ok.file_added'), 'success');
        jForms::destroy('wps~model_upload');
        $resp->action = 'wps~admin:list';

        return $resp;
    }

    public function delete()
    {
        // TODO confirm ?
        $finder = new WPS\ModelFileManager();

        $file = $finder->findBySHA1($this->param('fileId'));
        if ($file === false) {
            \jMessage::add(\jLocale::get('wps.message.error.unknown_file'), 'error');

            return $this->redirect('admin:list');
        }

        $finder->delete($file);
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
        $files = array();

        try {
            $files = $finder->getModelFiles();
        } catch (\Exception $e) {
            \jMessage::add(\jLocale::get('wps.message.error.model3_path_invalid'), 'error');

            return $resp;
        }
        $tpl->assign('models', $files);
        $resp->body->assign('MAIN', $tpl->fetch('admin.listmodels'));

        return $resp;
    }
}
