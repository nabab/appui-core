<?php
/*
 * Describe what it does!
 *
 * @var $ctrl \bbn\mvc\controller 
 *
 */
if ( count($ctrl->arguments) && !in_array('..', $ctrl->arguments, true)) {
  $ctrl->add_to_obj(APPUI_CORE_ROOT.'error/'.implode('/', $ctrl->arguments).'/index', $ctrl->data, true);
}