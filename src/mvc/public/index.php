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
];
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