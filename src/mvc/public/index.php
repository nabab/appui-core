<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 25/11/2017
 * Time: 06:24
 *
 * @var $ctrl \bbn\mvc\controller
 */

$shortcuts = $ctrl->get_model($ctrl->plugin_url('appui-menu').'/shortcuts/list');
$routes = $ctrl->get_routes();
$plugins = [];
foreach ( $routes as $r ){
  $plugins[$r['name']] = $r['url'];
}
$ctrl->data = $ctrl->get_model($ctrl->plugin_url('appui-core').'/_index');
$ctrl->add_data([
  'plugins' => $plugins,
  'shortcuts' => $shortcuts
]);
// The whole DOM
if (empty($ctrl->post)) {
  $ctrl->data['custom_css'] = $ctrl->get_plugin_view('index', 'css');
  $ctrl->combo($ctrl->data['site_title'], true);
}
// Only the data
else {
  $ctrl->add_js();
  $ctrl->data['js_data'] = $ctrl->custom_plugin_view('index', 'js', $ctrl->data, 'appui-core');
  $ctrl->obj->data = $ctrl->data;
}

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
