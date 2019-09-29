<?php
/* @var \bbn\mvc\controller $ctrl */

$file = $ctrl->data_path() . 'version.txt';
$ctrl->obj->success = is_file($file) && !!file_put_contents($file, ((int)file_get_contents($file) + 1));
