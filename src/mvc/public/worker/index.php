<?php
use bbn\X;
//header('Content-type: application/javascript; charset=utf-8');
//echo 'console.log("This SW has been created...");'.PHP_EOL;
/** @var bbn\Mvc\Controller $ctrl */
X::log('Starting the service shared...', 'sharedWorker');
$ctrl->setMode('js');
$routes = $ctrl->getRoutes();
$plugins = [];
foreach ($routes as $r) {
  $plugins[$r['name']] = $r['url'];
}

$vfile = $ctrl->dataPath() . '/version.txt';
$version = intval(file_get_contents($vfile)) ?: 1;
$ctrl->addData([
  'version' => $version,
  'shared_path' => constant('BBN_SHARED_PATH'),
  'static_path' => constant('BBN_STATIC_PATH'),
  'site_url' => $ctrl->getRootUrl(),
  'plugins' => $plugins
]);
//$script = $ctrl->getView($ctrl->pluginUrl('appui-core') . 'index', 'js');
$json = json_encode($ctrl->data, JSON_PRETTY_PRINT);
$js = $ctrl->getView($ctrl->pluginUrl('appui-core') . '/worker/index', 'js');
echo 'let data = ' . $json . ';' . PHP_EOL . $js;

