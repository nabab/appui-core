<?php
$ctrl->data = $ctrl->get;
if ( !empty($ctrl->data['id']) && !empty($ctrl->data['key']) ){
  $username = '';
  $login = '';
  if (($idUser = $ctrl->inc->user->getIdFromMagicString($ctrl->get['id'], $ctrl->get['key']))
    && ($userCfg = $ctrl->inc->user->getClassCfg())
    && ($mgr = $ctrl->inc->user->getManager())
    && ($user = $mgr->getUser($idUser))
  ) {
    if (isset($user[$userCfg['show']])) {
      $username = $user[$userCfg['show']];
    }
    if (isset($user[$userCfg['arch']['users']['login']])) {
      $login = $user[$userCfg['arch']['users']['login']];
    }
  }
  $ctrl->addData([
    'css' => $ctrl->getLess(),
    'isValidLink' => !!$idUser,
    'username' => $username,
    'login' => $login
  ]);
  $ctrl->addData($ctrl->getModel());
  if ( ($custom_data = $ctrl->getPluginModel('login/index', $ctrl->data)) && is_array($custom_data) ){
    $ctrl->data = \bbn\X::mergeArrays($ctrl->data, $custom_data);
  }

  $ctrl->setTitle($ctrl->data['site_title']);
  $ctrl->data['script'] = $ctrl->getJs($ctrl->data);
  echo $ctrl->getView();
}
