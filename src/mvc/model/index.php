<?php

use bbn\X;
use bbn\User\Manager;
use bbn\Mvc\Model;

/** @var Model $model  */


$data = [
  'version' => file_get_contents(constant('BBN_DATA_PATH') . 'version.txt') ?: '666',
  'site_url' => $model->getRootUrl(),
  'site_title' => constant('BBN_SITE_TITLE'),
  'app_name' => constant('BBN_APP_NAME'),
  'app_prefix' => defined('BBN_APP_PREFIX') ? constant('BBN_APP_PREFIX') : constant('BBN_APP_NAME'),
  'is_dev' => (bool)constant('BBN_IS_DEV'),
  'is_prod' => (bool)constant('BBN_IS_PROD'),
  'is_test' => (bool)constant('BBN_IS_TEST'),
  'shared_path' => constant('BBN_SHARED_PATH'),
  'static_path' => constant('BBN_STATIC_PATH'),
  'test' => constant('BBN_IS_DEV') ? 1 : 0,
  'year' => date('Y'),
  'language' => constant('BBN_LANG'),
  'lang' => constant('BBN_LANG'),
  'logo_big' => 'https://ressources.app-ui.com/logo_big.png',
  'cdn_lib' => 'bbn-css|latest|' . (defined('BBN_THEME') ? constant('BBN_THEME') : 'default') . ',bbn-cp',
  'cur_path' => $model->curPath(),
  'core_root' => constant('APPUI_CORE_ROOT'),
  'theme' => defined('BBN_THEME') ? constant('BBN_THEME') : 'default',
  'root' => '',
  'connected' => $model->inc->user->checkSession()
];

if ($data['connected']) {
  $t = $model->getTimer();
  $t->start('global');
  $t->start('bbn');
  $mgr = new Manager($model->inc->user);
  if ($theme = $model->inc->user->getSession('theme')) {
    $data['theme'] = $model->inc->user->getSession('theme');
  }

  if ($model->hasPlugin('appui-chat')) {
    $chat = true;
    /*
    $cchat = new \bbn\Appui\Chat($model->db, $model->inc->user);
    $chat = $cchat->getUserStatus();
    */
  }
  $t->start('js_cat');
  $data['options'] = $model->inc->options->jsCategories(null, true);
  $t->stop('js_cat');
  $t->start('default');
  $data['default'] = $model->getDefault();
  $t->stop('default');
  $t->start('users');
  $data['users'] = $mgr->fullList();
  $data['groups'] = $mgr->groups();
  $t->stop('users');
  $t->start('data');
  $data['user'] = [
    'id' => $model->inc->user->getId(),
    'isAdmin' => $model->inc->user->isAdmin(),
    'isDev' => $model->inc->user->isDev(),
    'name' => $mgr->getName($model->inc->user->getId()),
    'email' => $mgr->getEmail($model->inc->user->getId()),
    'chat' => $chat,
    'id_group' => $model->inc->user->getIdGroup() // Deprecated
  ];
  $data['options']['media_types'] = $model->inc->options->codeOptions(\bbn\Appui\Note::getOptionId('media'));
  $data['options']['categories'] = $model->inc->options->fullOptions();
  $t->stop('data');

  if ($model->hasPlugin('appui-hr')) {
    /*
    $hr = new \bbn\Appui\Hr($model->db);
    $data['options']['hr']['absences'] = $model->inc->options->fullOptions(\bbn\Appui\Hr::getOptionId('absences'));
    $data['app'] = X::mergeArrays($data['app'], [
      'staff' => $hr->getStaff(),
      'staffActive' => $hr->getActiveStaff()
    ]);
    */
  }
  $t->stop('bbn');
  $t->start('custom');
  if (($custom_data = $model->getPluginModel('index', $data)) && is_array($custom_data)) {
    $data = X::mergeArrays($data, $custom_data);
  }

  $t->stop('custom');
  $t->stop('global');
  $data['timings'] = $t->results();
  return $data;
}
else {
  if (
    $model->hasData(['email', 'mode'], true)
    && ($model->data['mode'] === 'lost')
    && ($cfg = $model->inc->user->getClassCfg())
    && ($mgr = $model->inc->user->getManager())
    && ($id = $model->db->selectOne($cfg['table'], $cfg['arch']['users']['id'], [$cfg['arch']['users']['email'] => $model->data['email']]))
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
    $data['formData'] = [
      'appui_salt' => $model->inc->user->getSalt(),
      'user' => '',
      'pass' => ''
    ];
    $data['lost_pass'] = true;
    if ($custom_data = $model->getPluginModel('login/index', $data)) {
      $data = X::mergeArrays($data, $custom_data);
    }

    return $data;
  }
}