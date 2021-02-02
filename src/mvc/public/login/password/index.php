<?php
$ctrl->data = $ctrl->get;
if ( !empty($ctrl->data['id']) && !empty($ctrl->data['key']) ){
  $ctrl->addData([
    'css' => $ctrl->getLess(),
    'isValidLink' => !!$ctrl->inc->user->getIdFromMagicString($ctrl->get['id'], $ctrl->get['key'])
  ]);
  $ctrl->addData($ctrl->getModel());
  if ( ($custom_data = $ctrl->getPluginModel('login/password/index', $ctrl->data)) && is_array($custom_data) ){
    $ctrl->data = \bbn\X::mergeArrays($ctrl->data, $custom_data);
  }
  $ctrl->setTitle($ctrl->data['site_title']);
  $ctrl->data['script'] = $ctrl->getJs($ctrl->data);
  echo $ctrl->getView();
}
