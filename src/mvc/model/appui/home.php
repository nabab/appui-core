<?php
/*
 * Describe what it does!
 *
 **/

/** @var $model \bbn\mvc\model*/

$api = new bbn\appui\api($model->inc->user, $model->db);
return [
  'has_cert' => file_exists($model->app_path().'cfg/cert_rsa.pub'),
  'has_key' => $api->has_key(),
  'app_id' => BBN_APP_ID,
  'app_name' => BBN_APP_NAME,
  'root' => APPUI_CORE_ROOT
];