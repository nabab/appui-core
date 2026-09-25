<?php

/** @var bbn\Mvc\Model $model */

if (
  !empty($model->data['email']) &&
  ($cfg = $model->inc->user->getClassCfg()) &&
  ($mgr = $model->inc->user->getManager()) &&
  ($id = $model->db->selectOne($cfg['table'], $cfg['arch']['users']['id'], [$cfg['arch']['users']['email'] => $model->data['email']]))
){
  return ['success' => $mgr->makeHotlink($id, 'password')];
}
elseif ($model->hasData(['pass1', 'pass2', 'key'], true)) {
  if ($model->inc->user->checkSession()) {
    return ['success' => true];
  }
  else {
    return ['success' => false, 'error' => $model->inc->user->getFullError()];
  }
}
else {
  return [
    'site_url' => $model->getRootUrl(),
    'site_title' => constant('BBN_SITE_TITLE'),
    'is_dev' => (bool)constant('BBN_IS_DEV'),
    'is_prod' => (bool)constant('BBN_IS_PROD'),
    'is_test' => (bool)constant('BBN_IS_TEST'),
    'shared_path' => constant('BBN_SHARED_PATH'),
    'static_path' => constant('BBN_STATIC_PATH'),
    'test' => (bool)constant('BBN_IS_DEV'),
    'year' => date('Y'),
    'theme' => defined('BBN_THEME') ? constant('BBN_THEME') : 'black',
    'language' => constant('BBN_LANG'),
    'formData' => [
      'appui_salt' => $model->inc->user->getSalt(),
      'user' => '',
      'pass' => ''
    ],
    'lost_pass' => true,
    'core_root' => constant('APPUI_CORE_ROOT'),
    'logo' => false
  ];
}
