<?php
/** @var \bbn\Mvc\Model $model */
return [
  'site_url' => BBN_URL,
  'site_title' => BBN_SITE_TITLE,
  'is_dev' => (bool)BBN_IS_DEV,
  'is_prod' => (bool)BBN_IS_PROD,
  'is_test' => (bool)BBN_IS_TEST,
  'shared_path' => BBN_SHARED_PATH,
  'static_path' => BBN_STATIC_PATH,
  'test' => BBN_IS_DEV ? 1 : 0,
  'year' => date('Y'),
  'lang' => BBN_LANG,
  'logo' => false,
  'theme' => defined('BBN_DEFAULT_THEME') ? BBN_DEFAULT_THEME : 'default'
];
