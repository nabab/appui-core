<?php

use bbn\Cache;
use bbn\User\Live;

/** @var bbn\Mvc\Model $model */
$cache = Cache::getEngine();
$redis = $cache->getObj();
try {
  $res = Live::issueSocketTicket($redis, $model->inc->user);
  return $res;
}
catch (Exception $e) {
  return ['connected' => false];
}
