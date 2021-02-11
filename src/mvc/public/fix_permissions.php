<?php
/*
 * Describe what it does!
 *
 **/

use bbn\X;

/** @var $ctrl \bbn\Mvc\Controller */
if (!empty($ctrl->post['go'])) {
  $plugins = $ctrl->getPlugins();
  $fs = new bbn\File\System();
  $appui = $ctrl->inc->options->fromCode('appui');
  $proot = $ctrl->inc->options->fromCode('page', 'permissions', $appui);
  $id_plugins_alias = $ctrl->inc->options->fromCode('plugins', 'permissions', $appui);
  if ($proot && false) {
    $ctrl->inc->options->merge($proot, ['code' => 'access']);
  }
  else {
    $o =& $ctrl->inc->options;
    $proot = $o->fromCode('access', 'permissions', $appui);
    // Each plugin
    foreach ($plugins as $name => $plugin) {
      echo '<h2 style="color: red">'.$name.'</h2>';
      // If it starts with appui-
      if (strpos($name, 'appui-') === 0) {
        // The name is without the prefix
        $shortname = substr($name, 6);
        $id_plugin = $o->fromCode($shortname, $appui);
        // If the ID doesn't exist
        if (!$id_plugin) {
          if ($id_plugin = $o->fromCode($shortname.'s', $appui)) {
            $o->merge($id_plugin, ['code' => $shortname]);
          }
        }

        if (!$id_plugin) {
          // create this option
          $id_plugin = $o->add([
            'id_parent' => $appui,
            'code' => $shortname,
            'text' => $shortname
          ]);
          X::dump("Create plugin option $id_plugin");
        }
  
        // id_plugin must exist as we are going to work in it
        if ($id_plugin) {
          // Look for permissions in plugin
          $perm_id = $o->fromCode('permissions', $id_plugin);
          if (!$perm_id) {
            // Create the permissions in plugin, and also access, Options, and plugins under it
            $perm_id = $o->add([
              'id_parent' => $id_plugin,
              'code' => 'permissions',
              'text' => 'Permissions'
            ]);
            // Other options under permissions
            $o->add([
              'id_parent' => $perm_id,
              'code' => 'options',
              'text' => 'Options'
            ]);
            $o->add([
              'id_parent' => $perm_id,
              'code' => 'plugins',
              'text' => 'Plugins'
            ]);
            X::dump("Create permissions $perm_id + options and plugins under it");
          }
  
          // Mandatory
          if ($perm_id) {
            $id_pperm = $ctrl->inc->options->fromCode($plugin['url'].'/', $proot);
            if (!$id_pperm) {
              $id_pperm = $ctrl->inc->options->fromCode($plugin['url'].'s/', $proot);
            }

            if ($id_pperm) {
              $o->merge($id_pperm, [
                'id_parent' => $perm_id,
                'code' => 'access',
                'text' => 'Access',
                'id_alias' => $id_plugins_alias
              ]);
              X::dump("existing permission TO MOVE TO plugin AS access: $id_pperm");
            }
            elseif (!($access = $o->fromCode('access', $perm_id))) {
              $access = $o->add([
                'id_parent' => $perm_id,
                'code' => 'access',
                'text' => 'Access',
                'id_alias' => $id_plugins_alias
              ]);
              X::dump("Create access $access in plugin");
            }

            if ($access && $ctrl->inc->options->merge($access, [['id_alias' => $id_plugins_alias]])) {
              X::dump("Created alias on access in plugin");
            }
          }
          else {
            throw new \Exception("Impossible to find or create the permissions option");
          }
        }
      }
    }
  }
}
