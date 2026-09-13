<?php
use bbn\X;
/** @var bbn\Mvc\Controller $ctrl */
if ($model = $ctrl->getModel($ctrl->post)) {
  $ctrl->obj = X::toObject($model);
}
else {
  //$ctrl->obj->script = 
  die('{}');
}
