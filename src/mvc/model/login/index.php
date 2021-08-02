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
  'test' => (bool)BBN_IS_DEV,
  'year' => date('Y'),
  'theme' => defined('BBN_THEME') ? BBN_THEME : 'black',
  'lang' => BBN_LANG,
  'formData' => [
    'appui_salt' => $model->inc->user->getSalt(),
    'user' => '',
    'pass' => ''
  ],
  'lost_pass' => true,
  'core_root' => APPUI_CORE_ROOT,
  'logo' => false
];
