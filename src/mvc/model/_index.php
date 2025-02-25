<?php

use bbn\X;
use bbn\User\Manager;
use bbn\Mvc\Model;

/** @var Model $model  */

$mgr = new Manager($model->inc->user);
$is_dev = $model->inc->user->isDev();
$theme = $model->inc->user->getSession('theme') ?: (defined('BBN_THEME') ? BBN_THEME : 'default');
$vfile = $model->dataPath() . 'version.txt';
if (!is_file($vfile)) {
  file_put_contents($vfile, '1');
  $version = 1;
}
else {
  $version = intval(file_get_contents($vfile));
}

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
  'options' => $model->inc->options->jsCategories(),
  'theme' => $theme,
  'cdn_lib' => 'axios,dayjs,bbn-css|latest|' . $theme . ',bbn-cp',
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
    'id_group' => $model->inc->user->getGroup() // Deprecated
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
$data['script_src'] = BBN_SHARED_PATH . 'lib/bbn-cp/v2/dist/bbn-cp.js?' . http_build_query([
  'lang' => $data['lang'] ?? BBN_LANG,
  'test' => !BBN_IS_PROD,
  'v' => $data['version']
]);
return $data;
