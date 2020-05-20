<?php
$ctrl->data = $ctrl->get;
if ( !empty($ctrl->data['id']) && !empty($ctrl->data['key']) ){
  $ctrl->add_data([
  'css' => $ctrl->get_less(),
  'isValidLink' => !!$ctrl->inc->user->get_id_from_magic_string($ctrl->get['id'], $ctrl->get['key'])
]);
$ctrl->add_data($ctrl->get_model());
if ( ($custom_data = $ctrl->get_plugin_model('login/password/index', $ctrl->data)) && is_array($custom_data) ){
	$ctrl->data = \bbn\x::merge_arrays($ctrl->data, $custom_data);
}
$ctrl->set_title($ctrl->data['site_title']);
$ctrl->data['script'] = $ctrl->get_js($ctrl->data);
echo $ctrl->get_view();


}
