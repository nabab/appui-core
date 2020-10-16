<?php
/* @var \bbn\mvc\controller $ctrl */

$file = $ctrl->data_path() . 'version.txt';
$version = is_file($file) ? (int)file_get_contents($file) : 0;
if ($version >= 10000) {
  $version = 0;
}
$ctrl->obj->success = !!file_put_contents($file, (string)($version + 1));
