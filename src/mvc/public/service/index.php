<?php
use bbn\X;
//header('Content-type: application/javascript; charset=utf-8');
//echo 'console.log("This SW has been created...");'.PHP_EOL;
X::log('Starting the service worker...', 'sw');
$ctrl->setMode('js');
$routes = $ctrl->getRoutes();
$plugins = [];
foreach ($routes as $r) {
  $plugins[$r['name']] = $r['url'];
}

$vfile = $ctrl->dataPath() . '/version.txt';
if (!is_file($vfile)) {
  file_put_contents($vfile, '1');
  $version = 1;
}
else {
  $version = intval(file_get_contents($vfile));
}
$ctrl->addData([
  'version' => $version,
  'shared_path' => constant('BBN_SHARED_PATH'),
  'static_path' => constant('BBN_STATIC_PATH'),
  'site_url' => BBN_URL,
  'plugins' => $plugins
]);
if (!empty($ctrl->post['connect'])) {
  X::log('is sent post connect', 'sw');
  X::log($ctrl->post, 'sw');
  $ctrl->setMode('json');
  $ctrl->obj = $ctrl->data;
}
else {
  //$script = $ctrl->getView($ctrl->pluginUrl('appui-core') . 'index', 'js');
  $json = json_encode($ctrl->data, JSON_PRETTY_PRINT);
  X::log('is not sent post connect', 'sw');
  if (!empty($ctrl->post)) {
    X::log($ctrl->post, 'sw');
  }

  $js = $ctrl->getView($ctrl->pluginUrl('appui-core') . '/service/index', 'js');
  echo 'let data = '.$json.';'.PHP_EOL.$js;
}

