<?php
/** @var bbn\Mvc\Controller $ctrl */
if (isset($ctrl->post['handshake'])) {
  $ctrl->action();
}
else {
  $ctrl->combo(_("App-UI communication"), true);
}