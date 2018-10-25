<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 25/11/2017
 * Time: 06:24
 *
 * @var $ctrl \bbn\mvc\controller
 */

$menu = new \bbn\appui\menus();
$pm = new \bbn\appui\tasks($ctrl->db);
$mgr = new \bbn\user\manager($ctrl->inc->user);
$is_dev = $ctrl->inc->user->is_dev();

$routes = $ctrl->get_routes();
$plugins = [];
foreach ( $routes as $r ){
  $plugins[$r['name']] = $r['url'];
}

/** @todo Thomas fix it!!*/
$ctrl->set_mode('html');
$shortcuts = $ctrl->get_model($ctrl->plugin_url('appui-menu').'/shortcuts/list');
$ctrl->set_mode('dom');

$ctrl->data = [
  'plugins' => $plugins,
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
  'current_menu' => $menu->get_option_id('default', 'menus'),
  'menus' => $is_dev ? $menu->get_options_menus() : [],
  //'shortcuts' => $ctrl->get_model($ctrl->plugin_url('appui-menu').'/shortcuts/list'),
  'shortcuts' => $shortcuts,
  'options' => $ctrl->inc->options->js_categories(),
  'theme' => $ctrl->inc->user->get_session('theme') ?: 'default',
  'token' => BBN_USER_TOKEN,
  'app' => [
    'users' => $mgr->full_list(),
    'groups' => $mgr->groups(),
    'user' => [
      'id' => $ctrl->inc->user->get_id(),
      'isAdmin' => $ctrl->inc->user->is_admin(),
      'isDev' => $ctrl->inc->user->is_dev(),
      'name' => $mgr->get_name($ctrl->inc->user->get_id())
    ],
    'group' => $mgr->get_group($ctrl->inc->user->get_group()),
    'userId' => $ctrl->inc->user->get_id(), // Deprecated
    'groupId' => $ctrl->inc->user->get_group() // Deprecated
  ]
];

$ctrl->data['options']['media_types'] = $ctrl->inc->options->code_options('media', 'notes', 'appui');
$ctrl->data['options']['categories'] = $ctrl->inc->options->full_options();
$ctrl->data['options']['bbn_tasks'] = \bbn\appui\tasks::get_options();


$ctrl->data['options']['tasks'] = [
  'roles' => \bbn\appui\tasks::get_options_ids('roles'),
  'states' => \bbn\appui\tasks::get_options_ids('states'),
  'options' => [
    'states' => \bbn\appui\tasks::get_options_text_value('states'),
    'roles' => \bbn\appui\tasks::get_options_text_value('roles'),
    'cats' => \bbn\appui\tasks::cat_correspondances()
  ],
  'categories' => $ctrl->inc->options->map(function($a){
    $a['is_parent'] = !empty($a['items']);
    if ( $a['is_parent'] ){
      $a['expanded'] = true;
    }
    return $a;
  }, $pm->categories(), 1),
  'priority_colors' => [
    '#F00',
    '#F40',
    '#F90',
    '#FC0',
    '#9B3',
    '#7A4',
    '#5A5',
    '#396',
    '#284',
    '#063'
  ]
];

if ( ($custom_data = $ctrl->get_plugin_model('index', $ctrl->data)) && is_array($custom_data) ){
	$ctrl->data = \bbn\x::merge_arrays($ctrl->data, $custom_data);
}
if ( $custom_js = $ctrl->get_plugin_view('index', 'js', $ctrl->data) ){
  $ctrl->data['js_data'] = $custom_js;
}


$ctrl->combo($ctrl->data['site_title'], true);

/*
echo "HELLO hey";
$items = $ctrl->inc->options->items($ctrl->inc->options->get_root());
\bbn\x::hdump(\bbn\str::is_uid($ctrl->inc->options->get_root()));
\bbn\x::hdump(\bbn\str::is_uid($ctrl->inc->options->get_default()));
\bbn\x::hdump(bin2hex($ctrl->inc->options->get_root()));
\bbn\x::hdump(bin2hex($ctrl->inc->options->get_default()));
\bbn\x::hdump(count($ctrl->inc->options->native_option($ctrl->inc->options->get_root())));
\bbn\x::hdump(count($items));
\bbn\x::hdump(\bbn\x::convert_uids($items));
\bbn\x::hdump(\bbn\x::convert_uids($ctrl->inc->options->full_options($items[0])));
*/
