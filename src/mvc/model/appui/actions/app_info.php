<?php

use bbn\X;
use bbn\Str;

/** @var bbn\Mvc\Model $model */
$api = new bbn\Appui\Api($model->inc->user, $model->db);
$test = Str::genpwd();
$data = $api->request('app_info', [
  'hello' => true
]);
$res = ['success' => false];
if ($data && X::hasProp($data, 'test') && ($data['test'] === $test)) {
  $res['success'] = true;
}
if ($data) {
  $res = array_merge($data, $res);
}
return $res;