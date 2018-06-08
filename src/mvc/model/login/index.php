<?php
/** @var \bbn\mvc\model $model */

return [
  'site_url' => BBN_URL,
  'site_title' => BBN_SITE_TITLE,
  'is_dev' => (bool)BBN_IS_DEV,
  'is_prod' => (bool)BBN_IS_PROD,
  'is_test' => (bool)BBN_IS_TEST,
  'shared_path' => BBN_SHARED_PATH,
  'static_path' => BBN_STATIC_PATH,
  'test' => (bool)BBN_IS_DEV,
  'year' => date('Y'),
  'theme' => BBN_DEFAULT_THEME ?: 'default',
  'salt' => $model->inc->user->get_salt()
];
