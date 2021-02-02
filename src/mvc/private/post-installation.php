<?php
if ($res = $ctrl->inc->perm->updateAll()) {
  $installer->report("{$res[res][total]} options created");
}
