<?php

use bbn\X;
use bbn\User\Manager;
use bbn\Mvc\Model;

/** @var Model $model  */

$mgr = new Manager($model->inc->user);
$is_dev = $model->inc->user->isDev();
$theme = $model->inc->user->getSession('theme') ?: (defined('BBN_THEME') ? constant('BBN_THEME') : 'default');
if ($model->hasPlugin('appui-chat')) {
  $chat = true;
  /*
  $cchat = new \bbn\Appui\Chat($model->db, $model->inc->user);
  $chat = $cchat->getUserStatus();
  */
}
$data = X::mergeArrays($model->data, [
  'logo_big' => 'https://ressources.app-ui.com/logo_big.png',
  'version' => $version,
  'lang' => BBN_LANG,
  //'shortcuts' => $model->getModel($model->pluginUrl('appui-menu').'/shortcuts/list'),
  'options' => $model->inc->options->jsCategories(null, true),
  'theme' => $theme,
  'cdn_lib' => 'bbn-css|latest|' . $theme . ',bbn-cp',
  'default' => $model->getDefault(),
  'users' => $mgr->fullList(),
  'groups' => $mgr->groups(),
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

if (($custom_data = $model->getPluginModel('index', $data)) && is_array($custom_data)) {
  $data = X::mergeArrays($data, $custom_data);
}

return $data;
