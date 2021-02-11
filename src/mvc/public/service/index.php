<?php
//header('Content-type: application/javascript; charset=utf-8');
//echo 'console.log("This SW has been created...");'.PHP_EOL;
$ctrl->setMode('js');
$routes = $ctrl->getRoutes();
$plugins = [];
foreach ( $routes as $r ){
  $plugins[$r['name']] = $r['url'];
}
$data = $ctrl->getModel(APPUI_CORE_ROOT.'/_index');
$ctrl->addData([
  'version' => $data['version'],
  'shared_path' => BBN_SHARED_PATH,
  'static_path' => BBN_STATIC_PATH,
  'cdn_lib' => $data['cdn_lib'],
  'site_url' => BBN_URL,
  'script_src' => $data['script_src'],
  'plugins' => $plugins
]);
echo 'let data = '.json_encode(array_merge($ctrl->data, ['script' => $ctrl->getView(APPUI_CORE_ROOT.'/index', 'js')])).';'.PHP_EOL;
echo $ctrl->getView(APPUI_CORE_ROOT.'/service/index', 'js');