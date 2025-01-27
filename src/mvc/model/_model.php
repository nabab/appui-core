<?php
/** @var \bbn\Mvc\Model $model The model */
return $model->getSetFromCache(
  function () use ($model) {
    return [
      'version' => file_get_contents(BBN_DATA_PATH . 'version.txt') ?: '666',
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
      'language' => BBN_LANG,
      'root' => ''
    ];
  },
  [],
  '',
  10
);
