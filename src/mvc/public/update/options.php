<?php
/*
 * Describe what it does!
 *
 * @var $ctrl \bbn\mvc\controller 
 *
 */
if (empty($ctrl->post['type'])) {
  $ctrl->combo(_('Options update'), true);
}
else {
	$ctrl->action();
}
