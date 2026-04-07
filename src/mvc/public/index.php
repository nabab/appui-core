<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 25/11/2017
 * Time: 06:24
 */

use bbn\X;

/** @var bbn\Mvc\Controller $ctrl */


if ($ctrl->inc->user->check()) {
  $t = $ctrl->getTimer();
  $t->start('appui-core-index');
  $cacheName = 'appui-core-index';
  $vfile = $ctrl->dataPath() . 'version.txt';
  if (!is_file($vfile)) {
    file_put_contents($vfile, '1');
    $version = 1;
  }
  else {
    $version = intval(file_get_contents($vfile));
  }
  $t->stop('appui-core-index');

  if (!($data = $ctrl->inc->user->getCache($cacheName)) || ($data['version'] !== $version)) {
    $t->start('user-cache');
    $t->start('routes');
    $routes = $ctrl->getRoutes();
    $t->stop('routes');
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

    $t->start('slots');
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
    $t->stop('slots');

    $t->start('_index');
    $data = $ctrl->getModel($ctrl->pluginUrl('appui-core').'/_index');
    $t->stop('_index');
    $data['plugins'] = $plugins;
    $data['slots'] = $slots;
    $data['version'] = $version;
    $data['script_src'] = constant('BBN_SHARED_PATH') . 'lib/bbn-cp/v2/dist/bbn-cp-components.js?' . http_build_query([
      'lang' => $data['lang'] ?? BBN_LANG,
      'test' => !BBN_IS_PROD,
      'v' => $data['version']
    ]);
    $t->start('css');
    $data['custom_css'] = $ctrl->customPluginView('index', 'css', [], 'appui-core') ?: $ctrl->getLess();
    $t->stop('css');
    $ctrl->inc->user->setCache($cacheName, $data, 86400);
    $t->stop('user-cache');
  }
  X::log($data, 'index-data');


  $ctrl->addData($data);
  // The whole DOM
  if (empty($ctrl->post)) {
    $t->start('combo');
    $ctrl->data['token'] = $ctrl->inc->user->addToken();
    $ctrl->combo($ctrl->data['site_title'], true);
    $t->stop('combo');
  }
  // Only the data
  else {
    $t->start('data');
    $ctrl->addJs();
    $ctrl->data['js_data'] = $ctrl->customPluginView('index', 'js', $ctrl->data, 'appui-core');
    $ctrl->obj->data = $ctrl->data;
    $t->stop('data');
  }
  X::log($t->results(), 'timers-index');
}
