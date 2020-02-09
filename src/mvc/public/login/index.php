<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 04/04/2017
 * Time: 05:02
 */
/** @var \bbn\mvc\controller $ctrl */
$css = $ctrl->get_plugin_view('login/index', 'css') ?: $ctrl->get_less();
$ctrl->add_data(['css' => $css]);
$ctrl->add_data($ctrl->get_model());
if ( ($custom_data = $ctrl->get_plugin_model('login/index', $ctrl->data)) && is_array($custom_data) ){
	$ctrl->data = \bbn\x::merge_arrays($ctrl->data, $custom_data);
}
$ctrl->set_title($ctrl->data['site_title']);
$ctrl->data['script'] = $ctrl->get_js($ctrl->data);

echo $ctrl->get_view();

