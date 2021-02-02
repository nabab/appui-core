<?php
/*
 * Describe what it does!
 *
 * @var $ctrl \bbn\Mvc\Controller 
 *
 */
if ($ctrl->inc->user->isAdmin()) {
  $ctrl->action();
}