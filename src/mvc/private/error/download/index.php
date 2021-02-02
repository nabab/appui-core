<?php
/*
 * Describe what it does!
 *
 **/

/** @var $ctrl \bbn\Mvc\Controller */
echo $ctrl
  ->addData(['static_path' => BBN_STATIC_PATH])
  ->getView().
  $ctrl->getJs().
  PHP_EOL.
  '<style>'.
    $ctrl->getLess().
  '</style>';