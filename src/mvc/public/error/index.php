<?php
/*
 * Describe what it does!
 *
 * @var $ctrl \bbn\Mvc\Controller 
 *
 */
if ( count($ctrl->arguments) && !in_array('..', $ctrl->arguments, true)) {
  $ctrl->addToObj(APPUI_CORE_ROOT.'error/'.implode('/', $ctrl->arguments).'/index', $ctrl->data, true);
}