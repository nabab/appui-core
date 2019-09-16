<?php
//header('Content-type: application/javascript; charset=utf-8');
//echo 'console.log("This SW has been created...");'.PHP_EOL;
$ctrl->set_mode('js');
$routes = $ctrl->get_routes();
$plugins = [];
foreach ( $routes as $r ){
  $plugins[$r['name']] = $r['url'];
}
$shortcuts = $ctrl->get_model($ctrl->plugin_url('appui-menu').'/shortcuts/list');
$ctrl->data = $ctrl->get_model(APPUI_CORE_ROOT.'/_index');
$ctrl->add_data([
  'plugins' => $plugins,
  'shortcuts' => $shortcuts
]);
if ( $custom_js = $ctrl->get_plugin_view('index', 'js', $ctrl->data) ){
  $ctrl->data['js_data'] = $custom_js;
}
echo 'let data = '.json_encode(array_merge($ctrl->data, ['script' => $ctrl->get_view(APPUI_CORE_ROOT.'/index', 'js')])).';'.PHP_EOL;
echo $ctrl->get_view(APPUI_CORE_ROOT.'/service/index', 'js');