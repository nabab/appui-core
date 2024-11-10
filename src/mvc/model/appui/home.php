<?php
/*
 * Describe what it does!
 *
 **/

/** @var bbn\Mvc\Model $model */

$api = new bbn\Appui\Api($model->inc->user, $model->db);
return [
  'has_cert' => file_exists($model->appPath().'cfg/cert_rsa.pub'),
  'has_key' => $api->hasKey(),
  'app_id' => BBN_APP_ID,
  'app_name' => BBN_APP_NAME,
  'root' => APPUI_CORE_ROOT
];