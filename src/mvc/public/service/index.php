<?php
use bbn\Appui;
//header('Content-type: application/javascript; charset=utf-8');
//echo 'console.log("This SW has been created...");'.PHP_EOL;
$ctrl->setMode('js');
$appui = new Appui();
$data = $appui->getPublicVars();
$ctrl->addData([
  'plugins' => $appui->getPlugins()
]);

$json = json_encode($ctrl->data, JSON_PRETTY_PRINT);
$js = $ctrl->getView(APPUI_CORE_ROOT.'/service/index', 'js');
echo 'let data = '.$json.';'.PHP_EOL.$js;

