<?php
$menu = new \bbn\appui\menus();
$mgr = new \bbn\user\manager($model->inc->user);
$is_dev = $model->inc->user->is_dev();
$theme = $model->inc->user->get_session('theme') ?: (defined('BBN_DEFAULT_THEME') ? BBN_DEFAULT_THEME : 'default');
$data = \bbn\x::merge_arrays($model->data, [
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
]);

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