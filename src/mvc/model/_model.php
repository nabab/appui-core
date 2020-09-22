<?php
/** @var \bbn\mvc\model $model The model */
return $model->get_set_from_cache(function() use($model){
  $vfile = $model->data_path().'version.txt';
  if ( !is_file($vfile) ){
    file_put_contents($vfile, '1');
    $version = 1;
  }
  else{
    $version = intval(file_get_contents($vfile));
  }
  return [
    'version' => $version,
    'site_url' => BBN_URL,
    'site_title' => BBN_SITE_TITLE,
    'app_name' => BBN_APP_NAME,
    'app_prefix' => defined('BBN_APP_PREFIX') ? BBN_APP_PREFIX : BBN_APP_NAME,
    'is_dev' => (bool)BBN_IS_DEV,
    'is_prod' => (bool)BBN_IS_PROD,
    'is_test' => (bool)BBN_IS_TEST,
    'shared_path' => BBN_SHARED_PATH,
    'static_path' => BBN_STATIC_PATH,
    'test' => BBN_IS_DEV ? 1 : 0,
    'year' => date('Y'),
    'lang' => BBN_LANG,
    'root' => ''
  ];
}, [], '', 3600);
