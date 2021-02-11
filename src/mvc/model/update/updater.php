<?php
/*
 * Describe what it does!
 *
 **/

use bbn\X;

/** @var $model \bbn\mvc\model */
$res = [];
$o = $model->inc->options;
$data = $model->getCachedModel('./default_options', 3601);
$opt = $data['options'];
$id_appui = $o->fromCode('appui');
$path = [$id_appui];
$compare = function ($o1, $o2, $is_option) use (&$compare) {
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
$items = X::map(
  function ($a) use (&$o, &$path, &$compare) {
    $tmp = [
      'text' => $a['code'] ?: '???',
      'data' => $a
    ];
    if (isset($a['code'])) {
      if (!empty($a['items'])) {
        $tmp['items'] = $a['items'];
        $tmp['alt'] = $a['items'];
        unset($tmp['data']['items']);
      }
      $len = count($path);
      array_unshift($path, $a['code']);
      if ($tmp['id'] = $o->fromCode(...$path)) {
        $obj = $o->option($tmp['id']);
        if ($cfg = $o->getCfg($tmp['id'])) {
          $obj['cfg'] = $cfg;
        }

        if ($items = $compare($a, $obj, true)) {
          $tmp['alt'] = $items;
        }
      }
      else {
        $tmp['error'] = "no_option";
      }
      array_shift($path);
    }
    else {
      $tmp['error'] = 'no_code';
    }

    //$a['result'] = $tmp;
    return $tmp;
  },
  $opt['items'],
  'items'
);

return ['options' => $items];
