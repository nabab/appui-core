<?php
/*
 * Describe what it does!
 *
 **/

use bbn\X;
/** @var $model \bbn\mvc\model */
$fs = new \bbn\File\System();
$file = $model->libPath().'bbn/bbn/options.json';
$file2 = $model->libPath().'bbn/bbn/permissions.json';
$file3 = $model->libPath().'bbn/bbn/plugins.json';
$appui = X::toArray($fs->decodeContents($file));
$permissions = X::toArray($fs->decodeContents($file2));
$plugins = X::toArray($fs->decodeContents($file3));
array_unshift($appui['items'], $permissions);
$permissions['id_alias'] = ['permissions', 'appui'];
$permissions['items'][0]['id_alias'] = ['access', 'permissions', 'appui'];
$permissions['items'][1]['id_alias'] = ['plugins', 'permissions', 'appui'];
$permissions['items'][2]['id_alias'] = ['options', 'permissions', 'appui'];
foreach ($appui['items'] as $i => &$it) {
  if ($i) {
    if (!isset($it['items'])) {
      $it['items'] = [];
    }
    $it['items'][] = $plugins;
    $it['items'][] = $permissions;
  }
}
unset($it);


$res = [];
$o =& $model->inc->options;
$id_appui = $o->fromCode('appui');
$path = [$id_appui];
$operations = [
  'insert' => [],
  'update' => []
];
$is_same = function ($o1, $o2, $is_option) use (&$compare, &$operations) {
  $diff = [];
  foreach ($o1 as $key => $val) {
    if ($is_option && ($key === 'items')) {
      continue;
    }

    $tmp = [
      'text' => $key,
      'exists' => X::hasProp($o2, $key),
      'update' => [],
      'data' => [
        'code' => $key,
      ]
    ];

    if ($tmp['exists']) {
      if (X::isArray($val, $o2[$key])) {
        $tmp['alt'] = $compare($val, $o2[$key]);
      }
      else if ($val != $o2[$key]) {
        $tmp['error'] = 'different';
        $v1 = (string)$val;
        $v2 = (string)$o2[$key];
        $tmp['update'][$key] = $val;
      }
    }
    else {
      $tmp['error'] = 'none';
      $tmp['update'][$key] = $val;
    }
    $diff[] = $tmp;
  }

  return $diff;
};
// $o['id_alias']
// $o['cfg']['default']
// $o['cfg']['id_root_alias']

$mapper = function($arr, $path = [], $second_go = false) use (&$res, &$o, &$mapper) {
  $r = [];
  foreach ($arr as $a) {
    $cur_path = $path;
    array_unshift($cur_path, $a['code']);
    $x = json_encode($cur_path);
    if ($second_go) {
      if (!empty($a['id_alias'])) {
        if (is_array($a['id_alias'])) {
          if ($a['id_alias'] = $o->fromCode(...$a['id_alias'])) {
            $x .= ' ALIAS FOUND - ';
          }
          else {
	          $x .= ' ALIAS NOT FOUND !!! - ';
            unset($a['id_alias']);
          }
        }
        else {
          $x .= ' ALIAS IS NOT ARRAY !!! - ';
          unset($a['id_alias']);
        }
      }
      if (!empty($a['cfg']) && !empty($a['cfg']['default'])) {
        if (is_array($a['cfg']['default'])) {
          if ($a['cfg']['default'] = $o->fromCode(...$a['cfg']['default'])) {
            $x .= ' DEFAULT FOUND - ';
          }
          else {
	          $x .= ' DEFAULT NOT FOUND !!! - ';
            unset($a['cfg']['default']);
          }
        }
        else {
          unset($a['cfg']['default']);
        }
      }
      if (!empty($a['cfg']) && !empty($a['cfg']['id_root_alias'])) {
        if (is_array($a['cfg']['id_root_alias'])) {
          if ($a['cfg']['id_root_alias'] = $o->fromCode(...$a['cfg']['id_root_alias'])) {
            $x .= ' ROOT ALIAS FOUND - ';
          }
          else {
	          $x .= ' ROOT ALIAS NOT FOUND !!! - ';
            unset($a['cfg']['id_root_alias']);
          }
        }
        else {
          unset($a['cfg']['id_root_alias']);
        }
      }
    }
    else {
      if (isset($a['id_alias'])) {
        unset($a['id_alias']);
      }
      if (isset($a['cfg']['default'])) {
        unset($a['cfg']['default']);
      }
      if (isset($a['cfg']['id_root_alias'])) {
        unset($a['cfg']['id_root_alias']);
      }
    }

    if ($id = $o->fromCode(...$cur_path)) {
      $x .= 'OPTION  FOUND';
      if ($second_go) {
        if (!empty($a['cfg'])) {
          $o->setCfg($id, $a['cfg']);
          unset($a['cfg']);
        }
        if (!empty($a['id_alias'])) {
          $o->set($id, $a);
        }
      }
      else {
        if (isset($a['id_alias'])) {
          unset($a['id_alias']);
        }
        if (isset($a['cfg'])) {
          unset($a['cfg']);
        }
        $o->set($id, $a);
      }
    }
    elseif ($a['id_parent'] = $o->fromCode(array_slice($cur_path, 1))) {
      $o->add($a);
      $x .= ' ID_PARENT FOUND ';
    }
    else {
      $x .= ' OPTION NOT FOUND!!!!!!!!!!!!!!!!!!!!!!!!!';
    }
    if (!empty($a['items'])) {
      $mapper($a['items'], $cur_path, $second_go);
    }
    $res[] = $x;
  }
};
$mapper([$appui]);
$res[] = '---------------------------------------------------------------';
$res[] = '---------------------------------------------------------------';
$res[] = '---------------------------------------------------------------';
$mapper([$appui], [], true);

die(X::dump($res));
return ['options' => $res];
