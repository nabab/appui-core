<?php

use bbn\X;
use bbn\Str;

/** @var bbn\Mvc\Model $model */
if ($model->hasData('handshake')) {
  $api = new bbn\Appui\Api($model->inc->user, $model->db);
  $test = Str::genpwd();
  $data = $api->request('emit', [
    'handshake' => true,
    'test' => $test
  ]);
  $res = ['success' => false];
  if ($data && X::hasProp($data, 'test') && ($data['test'] === $test)) {
    $res['success'] = true;
  }
  if ($data) {
    $res = array_merge($data, $res);
  }
  return $res;
}