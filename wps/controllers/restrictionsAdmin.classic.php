<?php
use LizmapWPS\WPS;

class restrictionsAdminCtrl extends jController
{
    public $pluginParams = array(
        '*' => array('jacl2.right' => 'wps.options.manage'),
    );

    private $iniFile;

    private $wpsSection = 'wps';

    public function __construct($request) {
        parent::__construct($request);
        $file = jApp::varconfigPath('localconfig.ini.php');
        $this->iniFile = new \Jelix\IniFile\IniModifier($file);
    }

    public function show() {
        $resp = $this->getResponse('html');
        $form = jForms::create('wps~project_restriction_params');
        $tpl = new jTpl();
        $this->initFormWithIni($form);
        $tpl->assign('form', $form);

        $resp->body->assign('MAIN', $tpl->fetch('restrictions.show'));
        $resp->body->assign('selectedMenuItem', 'wps_proj_restrict');

        return $resp;
    }

    public function prepare() {
        $form = jForms::create('wps~project_restriction_params');
        $this->initFormWithIni($form);
        return $this->redirect('restrictionsAdmin:edit');
    }

    public function edit() {
        /**
         * @var $resp jResponseHTML;
         */
        $resp = $this->getResponse('html');

        $form = jForms::get('wps~project_restriction_params');
        if ( is_null($form) ) {
            // redirect to default page
            return $this->redirect('restrictionsAdmin:prepare');
        }
        $tpl = new jTpl();
        $tpl->assign('form', $form);

        $resp->body->assign('MAIN', $tpl->fetch('restrictions.edit'));
        $resp->body->assign('selectedMenuItem', 'wps_proj_restrict');

        return $resp;
    }

    public function save() {
        $form = jForms::fill('wps~project_restriction_params');
        if ( is_null($form) ) {
            // redirect to default page
            return $this->redirect('restrictionsAdmin:prepare');
        }

        if (!$form->check()) {
            return $this->redirect('restrictionsAdmin:edit');
        }
        // Save the data
        foreach ($form->getControls() as $ctrl) {
            if ($ctrl->type != 'submit') {
                if ($form->getData($ctrl->ref) == true) {
                    $optionValue = 'on';
                } else {
                    $optionValue = 'off';
                }
                $this->iniFile->setValue($ctrl->ref, $optionValue, $this->wpsSection);
            }
        }
        $this->iniFile->save();
        jForms::destroy('wps~project_restriction_params');
        return $this->redirect('restrictionsAdmin:show');
    }


    private function initFormWithIni($form) {
        foreach ($form->getControls() as $ctrl) {
            if ($ctrl->type != 'submit') {
                $form->setData($ctrl->ref, $this->iniFile->getValue($ctrl->ref , $this->wpsSection));
            }
        }
    }

}
