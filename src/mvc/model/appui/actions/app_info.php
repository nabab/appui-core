<?php
/*
 * Describe what it does!
 *
 **/

use bbn\x;
use bbn\str;

/** @var $model \bbn\mvc\model */
$api = new bbn\appui\api($model->inc->user, $model->db);
$test = str::genpwd();
$data = $api->request('app_info', [
  'hello' => true
]);
$res = ['success' => false];
if ($data && x::has_prop($data, 'test') && ($data['test'] === $test)) {
  $res['success'] = true;
}
if ($data) {
  $res = array_merge($data, $res);
}
return $res;