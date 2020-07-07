<?php
/*
 * Describe what it does!
 *
 **/

/** @var $ctrl \bbn\mvc\controller */
echo $ctrl
  ->add_data(['static_path' => BBN_STATIC_PATH])
  ->get_view().
  $ctrl->get_js().
  PHP_EOL.
  '<style>'.
    $ctrl->get_less().
  '</style>';