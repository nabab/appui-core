<?php
/*
 * Describe what it does!
 *
 **/

/** @var $this \bbn\mvc\model*/
$res = [
  'aliases' => [],
  'plugins' => array_values($model->data['plugins'])
];
foreach ( $model->data['aliases'] as $k => $a ){
  $res['aliases'][] = [
    'url' => $k,
    'path' => $a
  ];
}
return $res;