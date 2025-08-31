<?php
/* @var bbn\Mvc\Controller $ctrl */

$file = $ctrl->dataPath() . 'version.txt';
$version = is_file($file) ? (int)file_get_contents($file) : 0;
if ($version >= 10000) {
  $version = 0;
}
$ctrl->obj->success = !!file_put_contents($file, (string)($version + 1));
