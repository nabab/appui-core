<?php
/*
 * Describe what it does!
 *
 * @var $ctrl \bbn\mvc\controller
 *
 */
if (isset($ctrl->post['handshake'])) {
  $ctrl->action();
}
else {
  $ctrl->combo(_("App-UI communication"), true);
}