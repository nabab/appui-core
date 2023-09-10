<?php

/** @var \bbn\Mvc\Model $model */

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
    return ['success' => false, 'error' => $model->inc->user->getError()['text']];
  }
}
else {
  return [
    'site_url' => BBN_URL,
    'site_title' => BBN_SITE_TITLE,
    'is_dev' => (bool)BBN_IS_DEV,
    'is_prod' => (bool)BBN_IS_PROD,
    'is_test' => (bool)BBN_IS_TEST,
    'shared_path' => BBN_SHARED_PATH,
    'static_path' => BBN_STATIC_PATH,
    'test' => (bool)BBN_IS_DEV,
    'year' => date('Y'),
    'theme' => defined('BBN_THEME') ? BBN_THEME : 'black',
    'lang' => BBN_LANG,
    'formData' => [
      'appui_salt' => $model->inc->user->getSalt(),
      'user' => '',
      'pass' => ''
    ],
    'lost_pass' => true,
    'core_root' => APPUI_CORE_ROOT,
    'logo' => false
  ];
}
