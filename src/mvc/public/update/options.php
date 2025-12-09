<?php
/** @var bbn\Mvc\Controller $ctrl */
if (empty($ctrl->post['type'])) {
  $ctrl->combo(_('Options update'), true);
}
else {
	$ctrl->action();
}
