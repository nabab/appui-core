<?php
/* @var \bbn\Mvc\Model $model */
if ( \bbn\X::hasProps($model->data, ['host', 'user', 'pass'], true) ){
  $db = new \bbn\Db([
    'engine' => 'mysql',
    'host' => $model->data['host'],
    'user' => $model->data['user'],
    'pass' => $model->data['pass']
  ]);
  return ['success' => true];
}
return ['success' => false];