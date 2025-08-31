<?php
/*
 * Describe what it does!
 *
 * @var bbn\Mvc\Controller $ctrl 
 *
 */
if ($ctrl->inc->user->isAdmin()) {
  $ctrl->action();
}