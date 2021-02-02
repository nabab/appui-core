<?php
/*
 * Describe what it does!
 *
 **/

/** @var $this \bbn\Mvc\Model*/

if ($model->inc->user->isAdmin() && $model->hasData(['aliases', 'plugins'])) {
  $mandatory_packages = [
    "bbn/bbn" => "dev-master",
    "bbn/appui-core" => "dev-master",
    "bbn/appui-usergroup" => "dev-master"
  ];
  $plugins_packages = [
    "bbn/appui-option" => "dev-master",
    "bbn/appui-billing" => "dev-master",
    "bbn/appui-cdn" => "dev-master",
    "bbn/appui-chat" => "dev-master",
    "bbn/appui-clipboard" => "dev-master",
    "bbn/appui-component" => "dev-master",
    "bbn/appui-config" => "dev-master",
    "bbn/appui-crm" => "dev-master",
    "bbn/appui-cron" => "dev-master",
    "bbn/appui-dashboard" => "dev-master",
    "bbn/appui-database" => "dev-master",
    "bbn/appui-email" => "dev-master",
    "bbn/appui-entity" => "dev-master",
    "bbn/appui-explorer" => "dev-master",
    "bbn/appui-ext-tools" => "dev-master",
    "bbn/appui-finder" => "dev-master",
    "bbn/appui-gdpr" => "dev-master",
    "bbn/appui-history" => "dev-master",
		"bbn/appui-hr" => "dev-master",
    "bbn/appui-i18n" => "dev-master",
    "bbn/appui-ide" => "dev-master",
    "bbn/appui-mailing" => "dev-master",
    "bbn/appui-menu" => "dev-master",
    "bbn/appui-monitor" => "dev-master",
    "bbn/appui-note" => "dev-master",
    "bbn/appui-notification" => "dev-master",
    "bbn/appui-project" => "dev-master",
    "bbn/appui-server" => "dev-master",
    "bbn/appui-social" => "dev-master",
    "bbn/appui-spreadsheet" => "dev-master",
    "bbn/appui-style" => "dev-master",
    "bbn/appui-task" => "dev-master",
    "bbn/appui-write" => "dev-master",
  ];
  
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
return ['foo' => 'bar'];