<?php
use bbn\X;

if ($model = $ctrl->getModel()) {
  $ctrl->obj = X::toObject($model);
}
else {
  die('{}');
}
