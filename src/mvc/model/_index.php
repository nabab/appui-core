<?php
$menu = new \bbn\appui\menus();
$mgr = new \bbn\user\manager($model->inc->user);
$is_dev = $model->inc->user->is_dev();
$theme = $model->inc->user->get_session('theme') ?: (defined('BBN_DEFAULT_THEME') ? BBN_DEFAULT_THEME : 'default');
$vfile = BBN_DATA_PATH.'version.txt';
if ( !is_file($vfile) ){
  file_put_contents($vfile, '1');
  $version = 1;
}
else{
  $version = intval(file_get_contents($vfile));
}
$data = [
  'version' => $version,
  'site_url' => BBN_URL,
  'site_title' => BBN_SITE_TITLE,
  'app_name' => BBN_APP_NAME,
  'app_prefix' => defined('BBN_APP_PREFIX') ? BBN_APP_PREFIX : BBN_APP_NAME,
  'is_dev' => (bool)BBN_IS_DEV,
  'is_prod' => (bool)BBN_IS_PROD,
  'is_test' => (bool)BBN_IS_TEST,
  'shared_path' => BBN_SHARED_PATH,
  'static_path' => BBN_STATIC_PATH,
  'test' => BBN_IS_DEV ? 1 : 0,
  'year' => date('Y'),
  'lang' => BBN_LANG,
  'root' => APPUI_CORE_ROOT,
  'current_menu' => $menu->get_default(),
  'menus' => count(($m = $menu->get_menus())) > 1 ? $m : [],
  //'shortcuts' => $model->get_model($model->plugin_url('appui-menu').'/shortcuts/list'),
  'options' => $model->inc->options->js_categories(),
  'theme' => $theme,
  'cdn_lib' => 'nerd-fonts,bbnjs|latest|'.$theme.',bbn-vue,font-mfizz,devicon,webmin-font,jsPDF',
  'app' => [
    'users' => $mgr->full_list(),
    'groups' => $mgr->groups(),
    'user' => [
      'id' => $model->inc->user->get_id(),
      'isAdmin' => $model->inc->user->is_admin(),
      'isDev' => $model->inc->user->is_dev(),
      'name' => $mgr->get_name($model->inc->user->get_id()),
      'email' => $mgr->get_email($model->inc->user->get_id())
    ],
    'group' => $mgr->get_group($model->inc->user->get_group()),
    'userId' => $model->inc->user->get_id(), // Deprecated
    'groupId' => $model->inc->user->get_group() // Deprecated
  ]
];
$data['options']['media_types'] = $model->inc->options->code_options(\bbn\appui\notes::get_appui_option_id('media'));
$data['options']['categories'] = $model->inc->options->full_options();

if ( ($custom_data = $model->get_plugin_model('index', $data)) && is_array($custom_data) ){
	$data = \bbn\x::merge_arrays($data, $custom_data);
}
$data['script_src'] = BBN_SHARED_PATH.'?'.http_build_query([
  'lang' => $data['lang'],
  'lib' => $data['cdn_lib'],
  'test' => !BBN_IS_PROD,
  'dirs' => $data['cdn_dirs'] ?? '',
  'v' => $data['version']
]);
return $data;