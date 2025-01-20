<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 25/11/2017
 * Time: 06:24
 */

use bbn\X;

/** @var bbn\Mvc\Controller $ctrl */
$routes = $ctrl->getRoutes();
$plugins = [];
$slots = [
  'before' => [],
  'headleft' => [],
  'head' => [],
  'headright' => [],
  'central' => [],
  'status' => [],
  'after' => []
];

foreach ($routes as $r) {
  $plugins[$r['name']] = $r['url'];

  if ($appuiElements = $ctrl->getSubpluginModelGroup('app-ui', $r['name'], 'appui-core')) {
    foreach ($appuiElements as $obj) {
      foreach ($obj as $slot => $data) {
        if (isset($slots[$slot])) {
          array_push($slots[$slot], ...(X::isAssoc($data) ? [$data] : $data));
        }
      }
    }
    //X::ddump("YYY", $slots);
  }
}

foreach ($slots as &$s) {
  foreach ($s as &$m) {
    if (!isset($m['priority'])) {
      $m['priority'] = 5;
    }
  }

  unset($m);
  X::sortBy($s, 'priority');
}
unset($s);

$ctrl->data = $ctrl->getModel($ctrl->pluginUrl('appui-core').'/_index');
$ctrl->addData([
  'plugins' => $plugins,
  'slots' => $slots,
]);
// The whole DOM
if (empty($ctrl->post)) {
  $ctrl->data['custom_css'] = $ctrl->customPluginView('index', 'css', [], 'appui-core') ?: $ctrl->getLess();
  $ctrl->data['token'] = $ctrl->inc->user->addToken();
  $ctrl->combo($ctrl->data['site_title'], true);
}
// Only the data
else {
  $ctrl->addJs();
  $ctrl->data['js_data'] = $ctrl->customPluginView('index', 'js', $ctrl->data, 'appui-core');
  $ctrl->obj->data = $ctrl->data;
}
