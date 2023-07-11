<?php

use bbn\X;

$mgr = new \bbn\User\Manager($model->inc->user);
$is_dev = $model->inc->user->isDev();
$theme = $model->inc->user->getSession('theme') ?: (defined('BBN_THEME') ? BBN_THEME : 'dark');
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
  //'shortcuts' => $model->getModel($model->pluginUrl('appui-menu').'/shortcuts/list'),
  'options' => $model->inc->options->jsCategories(),
  'theme' => $theme,
  'cdn_lib' => 'bbn-css|latest|' . $theme . ',bbn-cp',
  'app' => [
    'users' => $mgr->fullList(),
    'groups' => $mgr->groups(),
    'user' => [
      'id' => $model->inc->user->getId(),
      'isAdmin' => $model->inc->user->isAdmin(),
      'isDev' => $model->inc->user->isDev(),
      'name' => $mgr->getName($model->inc->user->getId()),
      'email' => $mgr->getEmail($model->inc->user->getId()),
      'chat' => $chat
    ],
    'group' => $mgr->getGroup($model->inc->user->getGroup()),
    'userId' => $model->inc->user->getId(), // Deprecated
    'groupId' => $model->inc->user->getGroup() // Deprecated
  ]
]);

$data['options']['media_types'] = $model->inc->options->codeOptions(\bbn\Appui\Note::getAppuiOptionId('media'));
$data['options']['categories'] = $model->inc->options->fullOptions();

if ($model->hasPlugin('appui-hr')) {
  /*
  $hr = new \bbn\Appui\Hr($model->db);
  $data['options']['hr']['absences'] = $model->inc->options->fullOptions(\bbn\Appui\Hr::getAppuiOptionId('absences'));
  $data['app'] = X::mergeArrays($data['app'], [
    'staff' => $hr->getStaff(),
    'staffActive' => $hr->getActiveStaff()
  ]);
  */
}

if (($custom_data = $model->getPluginModel('index', $data)) && is_array($custom_data)) {
  $data = X::mergeArrays($data, $custom_data);
}
$data['script_src'] = BBN_SHARED_PATH . '?' . http_build_query([
  'lang' => $data['lang'] ?? BBN_LANG,
  'lib' => $data['cdn_lib'],
  'test' => !BBN_IS_PROD,
  'dirs' => $data['cdn_dirs'] ?? '',
  'v' => $data['version']
]);
return $data;
