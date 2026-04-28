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
  $data = [
    'site_url' => constant('BBN_URL'),
    'site_title' => constant('BBN_SITE_TITLE'),
    'is_dev' => (bool)constant('BBN_IS_DEV'),
    'is_prod' => (bool)constant('BBN_IS_PROD'),
    'is_test' => (bool)constant('BBN_IS_TEST'),
    'shared_path' => constant('BBN_SHARED_PATH'),
    'static_path' => constant('BBN_STATIC_PATH'),
    'test' => (bool)constant('BBN_IS_DEV'),
    'year' => date('Y'),
    'theme' => defined('BBN_THEME') ? constant('BBN_THEME') : 'black',
    'language' => constant('BBN_LANG'),
    'formData' => [
      'appui_salt' => $ctrl->inc->user->getSalt(),
      'user' => '',
      'pass' => ''
    ],
    'lost_pass' => true,
    'core_root' => constant('APPUI_CORE_ROOT'),
    'logo_big' => 'https://ressources.app-ui.com/logo_big.png',
    'logo' => false
  ];
  if ($custom_data = $ctrl->getPluginModel('login/index', $data)) {
    $data = X::mergeArrays($data, $custom_data);
  }
  echo $ctrl->addData($data)
    ->clientCache()
    ->getView();
}
else {
  $data = $ctrl->getModel($ctrl->pluginUrl('appui-core').'/_index', $ctrl->post);
  if ($ctrl->inc->user->check()) {
    $cacheName = 'appui-core-index';
    $vfile = $ctrl->dataPath() . 'version.txt';
    if (!is_file($vfile)) {
      file_put_contents($vfile, '1');
      $version = 1;
    }
    else {
      $version = intval(file_get_contents($vfile));
    }

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
      $data['version'] = $version;
      $data['script_src'] = [
        constant('BBN_SHARED_PATH') . 'lib/bbn-cp/v2/dist/bbn-cp-all.js?' . http_build_query([
          'lang' => $data['lang'] ?? BBN_LANG,
          'test' => !BBN_IS_PROD,
          'v' => $data['version']
        ]),
        constant('BBN_SHARED_PATH') . 'lib/main/apstEntity.js?' . http_build_query([
          'lang' => $data['lang'] ?? BBN_LANG,
          'test' => !BBN_IS_PROD,
          'v' => $data['version']
        ]),
      ];
      $data['custom_css'] = $ctrl->customPluginView('index', 'css', [], 'appui-core') ?: $ctrl->getLess();
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

