<?php

if (empty($ctrl->post['id'])) {
  $ctrl->combo(_("Component picker"), true);
}
else {
  $ctrl->action();
}

