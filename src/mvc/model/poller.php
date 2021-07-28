<?php
/**
 * Server-side file.
 * This file is an infinitive loop. Seriously.
 * It gets the file data.txt's last-changed timestamp, checks if this is larger than the timestamp of the
 * AJAX-submitted timestamp (time of last ajax request), and if so, it sends back a JSON with the data from
 * data.txt (and a timestamp). If not, it waits for one seconds and then start the next while step.
 *
 * Note: This returns a JSON, containing the content of data.txt and the timestamp of the last data.txt change.
 * This timestamp is used by the client's JavaScript for the next request, so THIS server-side script here only
 * serves new content after the last file change. Sounds weird, but try it out, you'll get into it really fast!
 */
// set php runtime to unlimited

use bbn\Util\Timer;
use bbn\File\Dir;
use bbn\X;

set_time_limit(0);
// User is identified
if ($id_user = $model->inc->user->getId()) {

  /**
   * @var string The path for the active files
   */
  $actsource = Dir::createPath(\bbn\Mvc::getUserDataPath($id_user, 'appui-core') . 'poller/active');
  /**
   * @var string The path for the queue
   */
  $datasource = Dir::createPath(\bbn\Mvc::getUserDataPath($id_user, 'appui-core') . 'poller/queue');
  /**
   * @var string The path of the times.json file
   */
  $times_file = \bbn\Mvc::getUserDataPath($id_user, 'appui-core') . 'poller/times.json';
  /**
   * @var int A timestamp of the start of the execution.
   */
  $now = time();
  /**
   * @var \bbn\Util\Timer A timer object to keep track of the time
   */
  $timer = new Timer();
  // For the timout
  $timer->start('timeout');
  /**
   * @var integer The poller timeout
   */
  $timeout = 30;
  /**
   * @var array The list of plugins that have a poller model
   */
  $plugins = $model->getCachedModel($model->pluginUrl('appui-core').'/poller_plugins', 300);
  /**
   * @var array The list of functions from plugins to be performed in the loop
   */
  $plugins_pollers = [];
  /**
   * @var array The list of functions from plugins to be performed once
   */
  $plugins_pollers_noloop = [];
  foreach ($plugins as $plugin){
    if ($m = $model->getSubpluginModel('poller', [], $plugin, 'appui-core')) {
      foreach ($m as $p) {
        $p['plugin'] = $plugin;
        if (empty($p['frequency'])) {
          $plugins_pollers_noloop[] = $p;
        }
        else {
          $plugins_pollers[] = $p;
        }
      }
    }
  }

  /**
   * @var array The current times list
   */
  $times = [];
  if (is_file($times_file)) {
    $times = json_decode(file_get_contents($times_file), true);
  }

  /**
   * @var array The result that will be output as JSON.
   */
  $res          = [];
  $res_template = [
    'data' => [],
    'start' => $now,
    'plugins' => []
  ];
  // Removing the files in active directory as there should be only one
  if ($files = Dir::getFiles($actsource)) {
    foreach ($files as $f) {
      unlink($f);
    }
  }

  $active_file = $actsource.'/active_'.$now;
  // This file goes with the process
  $pid = getmypid();
  /** @todo What's the interest if I delete them?? */
  file_put_contents($active_file, (string)$pid);
  // Clients list
  $clients = $model->hasData('clients', true) ? $model->data['clients'] : [];
  // Plugins functions to run once
  foreach ($plugins_pollers_noloop as $pp){
    foreach ($clients as $id => $data) {
      if (!isset($data['appui-core'])) {
        $clients[$id]['appui-core'] = [];
      }

      $clients[$id]['appui-core']['active_file'] = $active_file;
      $d                                         = [
        'client' => $id,
        'clients' => array_map(
          function ($c) use ($pp) {
            return $c[$pp['plugin']] ?? [];
          }, $clients
        ),
        'data' => $clients[$id][$pp['plugin']] ?? []
      ];
      if (!connection_aborted()
          && is_callable($pp['function'])
          && ($plugin_res = $pp['function']($d))
          && !empty($plugin_res['success'])
          && !empty($plugin_res['data'])
      ) {
        if (!isset($res[$id])) {
          $res[$id] = $res_template;
        }

        if (!isset($res[$id]['plugins'][$pp['plugin']])) {
          $res[$id]['plugins'][$pp['plugin']] = [];
        }

        $res[$id]['plugins'][$pp['plugin']] = \bbn\X::mergeArrays($res[$id]['plugins'][$pp['plugin']], $plugin_res['data']);
      }
    }
  }

  // Main loop
  while ($timer->measure('timeout') < $timeout){
    // Look if connection is aborted and die after 10 seconds if still disconnected.
    /** @todo To check the time used by connection_aborted function */
    if (connection_aborted()) {
      if (!$timer->hasStarted('disconnection')) {
        $timer->start('disconnection');
      }
      elseif ($timer->measure('disconnection') > 10) {
        X::log("Disconnected", 'poller');
        die("Disconnected");
      }

      sleep(1);
      continue;
    }
    elseif ($timer->hasStarted('disconnection')) {
      $timer->reset();
    }

    // PHP caches file data by default. clearstatcache() clears that cache
    clearstatcache();

    // Start|resume timers
    $started_now = [];
    foreach ($plugins_pollers as $pp){
      if (!$timer->hasStarted($pp['id'])) {
        $started_now[] = $pp['id'];
        $timer->start($pp['id'], (!empty($times[$pp['id']]) && ($times[$pp['id']]['current'] < $timeout)) ? (float)$times[$pp['id']]['start'] : null);
      }
    }

    // Check and run plugins functions
    foreach ($plugins_pollers as $pp){
      $restart_timer = false;
      foreach ($clients as $id => $data) {
        $d = [
          'client' => $id,
          'clients' => array_map(
            function ($c) use ($pp) {
              return $c[$pp['plugin']] ?? [];
            }, $clients
          ),
          'data' => $data[$pp['plugin']] ?? []
        ];
        if (!connection_aborted()
            && (($timer->measure($pp['id']) >= $pp['frequency'])
            || in_array($pp['id'], $started_now, true))
            && is_callable($pp['function'])
            && ($plugin_res = $pp['function']($d))
            && !empty($plugin_res['success'])
        ) {
          if (!empty($plugin_res['data'])) {
            if (!isset($res[$id])) {
              $res[$id] = $res_template;
            }

            if (!isset($res[$id]['plugins'][$pp['plugin']])) {
              $res[$id]['plugins'][$pp['plugin']] = [];
            }

            $res[$id]['plugins'][$pp['plugin']] = \bbn\X::mergeArrays($res[$id]['plugins'][$pp['plugin']], $plugin_res['data']);
          }

          $restart_timer = true;
        }
      }

      if ($restart_timer) {
        $timer->stop($pp['id']);
        $timer->start($pp['id']);
      }
    }

    if (!empty($res)) {
      $times_currents = $timer->currents();
      if (!empty($times_currents) && Dir::createPath(dirname($times_file))) {
        file_put_contents($times_file, json_encode($times_currents, JSON_PRETTY_PRINT));
      }

      return $res;
    }

    // wait for 1 sec
  }
}
elseif (!empty($model->data['clients'])) {
  return array_map(
    function () {
      return ['disconnected' => true];
    }, $model->data['clients']
  );
}

return [];
