<?php

use LizmapWPS\WPS\Error;

class urlServerCtrl extends jController
{
    // Configure access via jacl2 rights management
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'wps.urlserver.manage'),
    );

    private $iniFile;

    private $wpsSection = 'wps';

    public function __construct($request)
    {
        parent::__construct($request);
        $file = jApp::varConfigPath('liveconfig.ini.php');
        $this->iniFile = new \Jelix\IniFile\IniModifier($file);
    }

    /**
     * Display a summary of the information taken from the ~ configuration file.
     *
     * @return jResponseHtml
     */
    public function show()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        if (\lizmap::getServices()->hideSensitiveProperties()) {
            return Error::setHTMLError($rep, "403");
        }

        // Create the form
        $form = jForms::create('wps~url_server_manage');

        $tpl = new jTpl();
        $this->initFormWithIni($form);
        $tpl->assign('urlForm', $form);
        $rep->body->assign('MAIN', $tpl->fetch('urlServer.show'));
        $rep->body->assign('selectedMenuItem', 'wps_url_change');

        return $rep;
    }

    public function prepare()
    {
        if (\lizmap::getServices()->hideSensitiveProperties()) {
            return $this->redirect('urlServer:show');
        }

        $form = jForms::create('wps~url_server_manage');
        $this->initFormWithIni($form);

        return $this->redirect('urlServer:edit');
    }

    public function edit()
    {
        /** @var jResponseHtml $rep */
        $rep = $this->getResponse('html');

        if (\lizmap::getServices()->hideSensitiveProperties()) {
            return Error::setHTMLError($rep, "403");
        }

        // Create the form
        $form = jForms::create('wps~url_server_manage');
        if (is_null($form)) {
            // redirect to default page
            return $this->redirect('restrictionsAdmin:prepare');
        }

        $tpl = new jTpl();
        $this->initFormWithIni($form);
        $tpl->assign('urlForm', $form);
        $rep->body->assign('MAIN', $tpl->fetch('urlServer.edit'));
        $rep->body->assign('selectedMenuItem', 'wps_url_change');

        return $rep;
    }

    public function save()
    {
        if (\lizmap::getServices()->hideSensitiveProperties()) {
            return $this->redirect('urlServer:show');
        }

        $form = jForms::fill('wps~url_server_manage');
        if (is_null($form)) {
            // redirect to default page
            return $this->redirect('urlServer:prepare');
        }

        if (!$form->check()) {
            return $this->redirect('urlServer:edit');
        }
        // Save the data
        foreach ($form->getControls() as $ctrl) {
            if ($ctrl->type != 'submit') {
                $this->iniFile->setValue($ctrl->ref, $form->getData($ctrl->ref), $this->wpsSection);
            }
        }
        $this->iniFile->save();
        jForms::destroy('wps~url_server_manage');

        return $this->redirect('urlServer:show');
    }

    private function initFormWithIni($form)
    {
        // read the value from the actual config, not the ini file, as we
        // don't know if the value is set into mainconfig, localconfig or liveconfig.
        $config = \jApp::config()->wps;
        foreach ($form->getControls() as $ctrl) {
            if ($ctrl->type != 'submit') {
                $form->setData($ctrl->ref, $config[$ctrl->ref]);
            }
        }
    }
}
