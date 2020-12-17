<?php
/*
 * Describe what it does!
 *
 * @var $ctrl \bbn\mvc\controller 
 *
 */
if ($ctrl->inc->user->is_admin()) {
  $ctrl->action();
}