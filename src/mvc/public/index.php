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
$is_dev = $ctrl->inc->user->is_dev();
$routes = $ctrl->get_routes();
$plugins = [];
foreach ( $routes as $r ){
  $plugins[$r['name']] = $r['url'];
}
$pm = new \bbn\appui\tasks($ctrl->db);
$ctrl->data = [
  'plugins' => $plugins,
  'site_url' => BBN_URL,
  'is_dev' => (bool)BBN_IS_DEV,
  'is_prod' => (bool)BBN_IS_PROD,
  'is_test' => (bool)BBN_IS_TEST,
  'shared_path' => BBN_SHARED_PATH,
  'static_path' => BBN_STATIC_PATH,
  'test' => BBN_IS_DEV ? 1 : 0,
  'year' => date('Y'),
  'user_id' => $ctrl->inc->user->get_id(),
  'group_id' => $ctrl->inc->user->get_group(),
  'root' => APPUI_CORE_ROOT,
  'current_menu' => $menu->get_option_id('default', 'menus'),
  'menus' => $is_dev ? $menu->get_options_menus() : [],
  'shortcuts' => $ctrl->get_model($ctrl->plugin_url('appui-menu').'/shortcuts/list'),
  'task_roles' => \bbn\appui\tasks::get_options_ids('roles'),
  'task_states' => \bbn\appui\tasks::get_options_ids('states'),
  'task_options' => \bbn\appui\tasks::get_tasks_options(),
  'task_categories' => \bbn\appui\tasks::cat_correspondances(),
  'tasks' => [
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
  ],
  'options' => $ctrl->inc->options->js_categories(),
  'token' => BBN_USER_TOKEN,
  'ide_theme' => $ctrl->inc->session->get('ide_theme') ?: false,
];
$ctrl->data['options']['bbn_tasks'] = \bbn\appui\tasks::get_options();
$ctrl->data['options']['media_types'] = $ctrl->inc->options->code_options('media', 'notes', 'appui');
$ctrl->data['options']['categories'] = $ctrl->inc->options->full_options();
if ( ($custom_data = $ctrl->get_plugin_model('index', $ctrl->data)) && is_array($custom_data) ){
	$ctrl->data = \bbn\x::merge_arrays($ctrl->data, $custom_data);
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