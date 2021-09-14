<?php
use bbn\X;

if ($model = $ctrl->getModel($ctrl->post)) {
  $ctrl->obj = X::toObject($model);
}
else {
  //$ctrl->obj->script = 
  sleep(3);
  die('{}');
}
