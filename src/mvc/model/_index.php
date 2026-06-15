<?php

use bbn\X;
use bbn\User\Manager;
use bbn\Mvc\Model;

/** @var Model $model  */


if ($model->inc->user->check()) {
  $t = $model->getTimer();
  $t->start('global');
  $t->start('bbn');
  $mgr = new Manager($model->inc->user);
  $theme = $model->inc->user->getSession('theme') ?: (defined('BBN_THEME') ? constant('BBN_THEME') : 'default');
  if ($model->hasPlugin('appui-chat')) {
    $chat = true;
    /*
    $cchat = new \bbn\Appui\Chat($model->db, $model->inc->user);
    $chat = $cchat->getUserStatus();
    */
  }
  $t->start('js_cat');
  $jsCat = $model->inc->options->jsCategories(null, true);
  $t->stop('js_cat');
  $t->start('default');
  $default = $model->getDefault();
  $t->stop('default');
  $t->start('users');
  $usersList = $mgr->fullList();
  $userGroups = $mgr->groups();
  $t->stop('users');
  $t->start('data');
  $data = X::mergeArrays($model->data, [
    'logo_big' => 'https://ressources.app-ui.com/logo_big.png',
    'lang' => BBN_LANG, 
    //'shortcuts' => $model->getModel($model->pluginUrl('appui-menu').'/shortcuts/list'),
    'options' => $jsCat,
    'theme' => $theme,
    'cdn_lib' => 'bbn-css|latest|' . $theme . ',bbn-cp',
    'default' => $default,
    'users' => $usersList,
    'groups' => $userGroups,
    'cur_path' => $model->curPath(),
    'user' => [
      'id' => $model->inc->user->getId(),
      'isAdmin' => $model->inc->user->isAdmin(),
      'isDev' => $model->inc->user->isDev(),
      'name' => $mgr->getName($model->inc->user->getId()),
      'email' => $mgr->getEmail($model->inc->user->getId()),
      'chat' => $chat,
      'id_group' => $model->inc->user->getIdGroup() // Deprecated
    ]
  ]);

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
    $data = [
      'site_url' => constant('BBN_URL'),
      'site_title' => constant('BBN_SITE_TITLE'),
      'is_dev' => (bool)constant('BBN_IS_DEV'),
      'is_prod' => (bool)constant('BBN_IS_PROD'),
      'is_test' => (bool)constant('BBN_IS_TEST'),
      'shared_path' => constant('BBN_SHARED_PATH'),
      'static_path' => constant('BBN_STATIC_PATH'),
      'test' => (bool)constant('BBN_IS_DEV'),
      'cur_path' => $model->curPath(),
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
      'logo_big' => 'https://ressources.app-ui.com/logo_big.png',
      'logo' => false
    ];
    if ($custom_data = $model->getPluginModel('login/index', $data)) {
      $data = X::mergeArrays($data, $custom_data);
    }
    return $data;
  }
}