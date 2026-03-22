<?php

use bbn\Mvc;
/** @var bbn\Mvc\Model $model The current model */

return [
  'status' => [
    'priority' => 0,
    'content' => Mvc::getInstance()->subpluginView('app-ui/button', 'html', [
      'ip' => $_SERVER['SERVER_ADDR'] ?? '127.0.0.1',
      'hostname' => BBN_HOSTNAME,
      'appname' => BBN_APP_NAME,
      'env' => BBN_ENV,
      'client' => $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1',
    ], 'appui-core', 'appui-core'),
    'script' => Mvc::getInstance()->subpluginView('app-ui/button', 'js', [], 'appui-core', 'appui-core'),
  ]
];


