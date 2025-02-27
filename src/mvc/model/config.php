<?php
/*
 * Describe what it does!
 *
 **/

use bbn\X;

/** @var bbn\Mvc\Model $model */

if ($model->inc->user->isAdmin() && $model->hasData(['aliases', 'plugins'])) {
  $plugins_packages   = [];
  $mandatory_packages = [
    "bbn/bbn" => "dev-master",
    "bbn/appui-core" => "dev-master",
    "bbn/appui-usergroup" => "dev-master"
  ];
  $packages           = $model->getModel($model->pluginUrl('appui-core') . '/data/plugins/packages');
  foreach ($packages as $p) {
    $plugins_packages[$p['value']] = $p['version'];
  }

  $json = file_get_contents($model->libPath().'bbn/appui-core/src/cfg/composers.json');
  $composers = json_decode($json, true);
  $oplugins = $composers['plugins'];
  unset($composers['plugins']);
  array_walk(
    $oplugins,
    function (&$a, $name) use ($composers) {
      $a = array_merge(
        $composers,
        $a,
        [
          'sname' => $name,
          'homepage' => "https://github.com/nabab/".$name
        ]
      );
    }
  );
  $appui = new bbn\Appui();
  $envs = $appui->getEnvironment(true);
  $settings = $appui->getSettings();

  $json = file_get_contents($model->libPath().'bbn/appui-core/src/cfg/schema.json');
  $schema = json_decode($json, true);

  $json = file_get_contents(dirname(BBN_LIB_PATH).'/composer.json');
  $composer = json_decode($json, true);
  $packages = [];
  foreach ($composer['require'] as $k => $v) {
    if (!isset($mandatory_packages[$k]) && !isset($plugins_packages[$k])) {
      $packages[] = [
        'name' => $k,
        'version' => $v
      ];
    }
  }
  $dpackages = [];
  foreach ($composer['require-dev'] as $k => $v) {
    $dpackages[] = [
      'name' => $k,
      'version' => $v
    ];
  }
  $current = null;
  foreach ($envs as $i => $e) {
    if (($e['hostname'] === BBN_HOSTNAME) && ($e['app_path'] === BBN_APP_PATH)) {
      $current = $i;
      break;
    }
  }
  $aliases = [];
  $plugins = array_values($model->data['plugins']);
  foreach ( $model->data['aliases'] as $k => $a ){
    $aliases[] = [
      'url' => $k,
      'path' => $a
    ];
  }
  return [
    'app_path' => BBN_APP_PATH,
    'hostname' => BBN_HOSTNAME,
    'aliases' => $model->data['aliases'],
    'routes' => $model->data['routes'],
    'environments' => $envs,
    'current' => $current,
    'settings' => $settings,
    'composer' => $composer,
    'aliases' => $aliases,
    'oplugins' => array_values($oplugins),
    'plugins' => $plugins,
    'schema' => $schema,
    'packages' => $packages,
    'dpackages' => $dpackages
  ];
}
