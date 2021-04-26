<?php
/**
 * What is my purpose?
 *
 **/
use bbn\X;
/** @var $model \bbn\Mvc\Model*/

if ($model->hasData('id')) {
  $fs = new bbn\file\system();
  return [
  ];
}
else {
  $sources = $ctrl->getPlugins();
  die(X::dump($sources));
}
