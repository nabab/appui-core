<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 25/11/2017
 * Time: 06:24
 */

use bbn\X;
use bbn\File\Dir;

/** @var bbn\Mvc\Controller $ctrl */


if (empty($ctrl->post)) {
  echo $ctrl->addData($ctrl->getModel())
    ->clientCache()
    ->getView();
}
else {
  $data = $ctrl->getModel($ctrl->post);
  if ($ctrl->inc->user->check()) {
    $cacheName = 'appui-core-index';
    if (true) {
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
            foreach ($obj as $slot => $s) {
              if (isset($slots[$slot])) {
                array_push($slots[$slot], ...(X::isAssoc($s) ? [$s] : $s));
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

      $data['plugins'] = $plugins;
      $data['slots'] = $slots;
      $data['script_src'] = [
        constant('BBN_SHARED_PATH') . 'lib/bbn-js/v2/dist/bbn.js?' . http_build_query([
          'lang' => $data['lang'] ?? BBN_LANG,
          'test' => !BBN_IS_PROD,
          'v' => $data['version']
        ]),
        constant('BBN_SHARED_PATH') . 'lib/bbn-cp/v2/dist/bbn-cp-all.js?' . http_build_query([
          'lang' => $data['lang'] ?? BBN_LANG,
          'test' => !BBN_IS_PROD,
          'v' => $data['version']
        ]),
        constant('BBN_SHARED_PATH') . 'lib/main/index.js?' . http_build_query([
          'lang' => $data['lang'] ?? BBN_LANG,
          'test' => !BBN_IS_PROD,
          'v' => $data['version']
        ]),
      ];
      $ctrl->inc->user->setCache($cacheName, $data, 86400);
    }


    $ctrl->addData($data);
    // The whole DOM
    $ctrl->data['script'] = $ctrl->getView($ctrl->pluginUrl('appui-core') . '/index', 'js', $data);
    $ctrl->data['js_data'] = $ctrl->customPluginView('index', 'js', $ctrl->data, 'appui-core');
    $ctrl->obj->data = $ctrl->data;
  }
  else  {
    $data['script_src'] = [
      constant('BBN_SHARED_PATH') . 'lib/bbn-cp/v2/dist/bbn-cp-all.js?' . http_build_query([
        'lang' => $data['lang'] ?? BBN_LANG,
        'test' => !BBN_IS_PROD,
        'v' => $data['version']
      ]),
    ];
    $ctrl->addData($data);
    $ctrl->data['script'] = $ctrl->getView($ctrl->pluginUrl('appui-core') . '/index', 'js', $data);
    $ctrl->obj->data = $ctrl->data;
  }
}

