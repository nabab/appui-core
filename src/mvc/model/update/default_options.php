<?php
/*
 * Describe what it does!
 *
 **/

/** @var $model \bbn\mvc\model*/
$res = [];
$fs = new bbn\File\System();
$routes = $model->getPlugins();
$core = $routes['appui-core'];
unset($routes['appui-core']);

foreach ($routes as $r) {
  if (substr($r['name'], 0, 6) === 'appui-') {
    $file = $r['path'].'src/cfg/options.json';
    if ($is_file = $fs->isFile($file)) {
      $json = $is_file ? $fs->getContents($file) : '[]';
      $arr = json_decode($json ?: '{}', true);
      $plugin = substr($r['name'], 6);
      if (count($arr)) {
        $res[] = $arr;
      }
    }
  }
}
$items = $core;
$items['items'] = $res;
return ['options' => $items];

