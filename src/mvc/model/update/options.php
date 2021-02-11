<?php
/*
 * Describe what it does!
 *
 **/

use bbn\X;

/** @var $model \bbn\mvc\model */
$res = [];
$fs = new bbn\File\System();
$o = $model->inc->options;
$ar = [
  [
    'text' => _("Database"),
    'value' => 'database',
  ], [
    'text' => _("Menu"),
    'value' => 'menu',
  ], [
    'text' => _("Options"),
    'value' => 'options',
  ], [
    'text' => _("Permissions"),
    'value' => 'permissions',
  ], [
    'text' => _("Settings"),
    'value' => 'settings',
  ]
];
$rf = [];
$ro = [];

if ($model->hasData('type')) {
  $routes = $model->getRoutes();
  $idx = X::find($routes, ['name' => 'appui']);
  if ($idx >= 0) {
    $core = array_splice($routes, $idx, 1);
  }
  foreach ($routes as $url => $r) {
    if (substr($r['name'], 0, 6) === 'appui-') {
      $file = $r['path'].'src/cfg/'.$model->data['type'].'.json';
      if ($is_file = $fs->isFile($file)) {
        $json = $is_file ? $fs->getContents($file) : '[]';
        $arr = json_decode($json ?: '{}');
        $plugin = substr($r['name'], 6);
        $proot = $o->fromCode($plugin, 'appui');
        $tmp = count($arr) ? $arr : [];
        $tmp2 = [
          'text' => $plugin,
          'code' => $plugin,
          'items' => []
        ];
        switch ($model->data['type']) {
          case 'options':
            $tmp2 = $o->fullTree($proot);
            break;
          case 'permissions':
            $tree = $o->fullTree('access', 'permissions', $proot);
            $tmp2['items'] = empty($tree['items']) ? [] : $tree['items'];
            break;
          case 'menu':
            break;
          case 'settings':
            break;
          case 'database':
            break;
        }
        $rf[] = $tmp;
        $ro[] = $tmp2;
      }
    }
  }
}
return ['types' => $ar, 'rf' => $rf, 'ro' => $ro];