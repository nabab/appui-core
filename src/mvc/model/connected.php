<?php

use bbn\Cache;
use bbn\User\Live;

$cache = Cache::getEngine();
$redis = $cache->getObj();
try {
  $res = Live::issueSocketTicket($redis, $model->inc->user);
  return $res;
}
catch (Exception $e) {
  return ['connected' => false];
}
