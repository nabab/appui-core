<?php
use bbn\X;

if ($model = $ctrl->getModel($ctrl->post)) {
  $ctrl->obj = X::toObject($model);
}
else {
  //$ctrl->obj->script = 
  die('{}');
}
