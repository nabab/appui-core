<?php
use bbn\X;

if ($model = $ctrl->getModel()) {
  $ctrl->obj = X::toObject($model);
}
else {
  sleep(10);
  die('{}');
}
