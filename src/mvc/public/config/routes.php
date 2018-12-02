<?php
/*
 * Describe what it does!
 *
 **/

/** @var $this \bbn\mvc\controller */
$ctrl
  ->add_data(['aliases' => $ctrl->get_aliases(), 'plugins' => $ctrl->get_routes()])
  ->combo(_('Routes'), true);