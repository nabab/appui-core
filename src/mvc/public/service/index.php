<?php
//header('Content-type: application/javascript; charset=utf-8');
//echo 'console.log("This SW has been created...");'.PHP_EOL;
$ctrl->setMode('js');
$routes = $ctrl->getRoutes();
$plugins = [];
foreach ( $routes as $r ){
  $plugins[$r['name']] = $r['url'];
}
$shortcuts = $ctrl->getModel($ctrl->pluginUrl('appui-menu').'/shortcuts/list');
$ctrl->data = $ctrl->getModel(APPUI_CORE_ROOT.'/_index');
$ctrl->addData([
  'plugins' => $plugins,
  'shortcuts' => $shortcuts
]);
if ( $custom_js = $ctrl->getPluginView('index', 'js', $ctrl->data) ){
  $ctrl->data['js_data'] = $custom_js;
}
echo 'let data = '.json_encode(array_merge($ctrl->data, ['script' => $ctrl->getView(APPUI_CORE_ROOT.'/index', 'js')])).';'.PHP_EOL;
//echo 'let data = '.json_encode(['plugins' => $plugins, 'version' => $ctrl->data['version']]).';';
echo $ctrl->getView(APPUI_CORE_ROOT.'/service/index', 'js');