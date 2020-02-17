<?php
if ($res = $ctrl->inc->perm->update_all()) {
  $installer->report("{$res[res][total]} options created");
}
