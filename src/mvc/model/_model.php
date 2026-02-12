<?php
/** @var bbn\Mvc\Model $model The model */
return $model->getSetFromCache(
  function () use ($model) {
    return [
      'version' => file_get_contents(constant('BBN_DATA_PATH') . 'version.txt') ?: '666',
      'site_url' => constant('BBN_URL'),
      'site_title' => constant('BBN_SITE_TITLE'),
      'app_name' => constant('BBN_APP_NAME'),
      'app_prefix' => defined('BBN_APP_PREFIX') ? constant('BBN_APP_PREFIX') : constant('BBN_APP_NAME'),
      'is_dev' => (bool)constant('BBN_IS_DEV'),
      'is_prod' => (bool)constant('BBN_IS_PROD'),
      'is_test' => (bool)constant('BBN_IS_TEST'),
      'shared_path' => constant('BBN_SHARED_PATH'),
      'static_path' => constant('BBN_STATIC_PATH'),
      'test' => constant('BBN_IS_DEV') ? 1 : 0,
      'year' => date('Y'),
      'language' => constant('BBN_LANG'),
      'root' => ''
    ];
  },
  [],
  '',
  600
);
