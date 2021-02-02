<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 04/04/2017
 * Time: 05:02
 */
/** @var \bbn\Mvc\Controller $ctrl */
$css = $ctrl->getPluginView('login/index', 'css') ?: $ctrl->getLess();
$ctrl->addData(['css' => $css]);
$ctrl->addData($ctrl->getModel());
if ( ($custom_data = $ctrl->getPluginModel('login/index', $ctrl->data)) && is_array($custom_data) ){
	$ctrl->data = \bbn\X::mergeArrays($ctrl->data, $custom_data);
}
$ctrl->setTitle($ctrl->data['site_title']);
$ctrl->data['script'] = $ctrl->getJs($ctrl->data);

echo $ctrl->getView();

