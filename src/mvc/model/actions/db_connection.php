<?php
/* @var \bbn\mvc\model $model */
if ( \bbn\x::has_props($model->data, ['host', 'user', 'pass'], true) ){
  $db = new \bbn\db([
    'engine' => 'mysql',
    'host' => $model->data['host'],
    'user' => $model->data['user'],
    'pass' => $model->data['pass']
  ]);
  return ['success' => true];
}
return ['success' => false];