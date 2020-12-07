<?php
/*
 * Describe what it does!
 *
 **/
use bbn\x;
use bbn\str;

/** @var $model \bbn\mvc\model*/
if ($model->has_data('handshake')) {
  $api = new bbn\appui\api($model->inc->user, $model->db);
  $test = str::genpwd();
  $data = $api->emit([
    'handshake' => true,
    'test' => $test
  ]);
  $res = ['success' => false];
  if ($data && x::has_prop($data, 'test') && ($data['test'] === $test)) {
    $res['success'] = true;
  }
  if ($data) {
    $res = array_merge($data, $res);
  }
  return $res;
}
else {
  return [
    'app_id' => BBN_APP_ID,
    'app_name' => BBN_APP_NAME,
    'root' => APPUI_CORE_ROOT
  ];
}