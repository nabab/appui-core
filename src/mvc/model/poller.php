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

use bbn\util\timer;
use bbn\file\dir;
use bbn\x;

set_time_limit(0);
// User is identified
if ($id_user = $model->inc->user->get_id()) {

  /**
   * @var string The path for the active files
   */
  $actsource = dir::create_path(\bbn\mvc::get_user_data_path($id_user, 'appui-core') . 'poller/active');
  /**
   * @var string The path for the queue
   */
  $datasource = dir::create_path(\bbn\mvc::get_user_data_path($id_user, 'appui-core') . 'poller/queue');
  /**
   * @var string The path of the times.json file
   */
  $times_file = \bbn\mvc::get_user_data_path($id_user, 'appui-core') . 'poller/times.json';
  /**
   * @var int A timestamp of the start of the execution.
   */
  $now = time();
  /**
   * @var \bbn\util\timer A timer object to keep track of the time
   */
  $timer = new timer();
  // For the timout
  $timer->start('timeout');
  /**
   * @var integer The poller timeout
   */
  $timeout = 30;
  /**
   * @var array The list of plugins that have a poller model
   */
  $plugins = $model->get_cached_model($model->plugin_url('appui-core').'/poller_plugins', 300);
  /**
   * @var array The list of functions from plugins to be performed in the loop
   */
  $plugins_pollers = [];
  /**
   * @var array The list of functions from plugins to be performed once
   */
  $plugins_pollers_noloop = [];
  foreach ( $plugins as $plugin ){
    if ( $m = $model->get_subplugin_model('poller', [], $plugin, 'appui-core') ){
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
  $res = [
    'data' => [],
    'start' => $now,
    'plugins' => []
  ];
  /**
   * @var bbn\appui\observer
   */

  // Removing the files in active directory as there should be only one
  if ($files = dir::get_files($actsource)) {
    foreach ($files as $f) {
      unlink($f);
    }
  }
  if (!isset($model->data['appui-core'])) {
    $model->data['appui-core'] = [];
  }
  $model->data['appui-core']['active_file'] = $actsource.'/active_'.$now;
  // This file goes with the process
  $pid = getmypid();
  /** @todo What's the interest if I delete them?? */
  file_put_contents($model->data['appui-core']['active_file'], (string)$pid);

  // Plugins functions to run once
  foreach ( $plugins_pollers_noloop as $pp ){
    if ( !connection_aborted()
      && is_callable($pp['function'])
      && ($plugin_res = $pp['function']($model->data[$pp['plugin']] ?? $model->data))
      && !empty($plugin_res['success'])
      && !empty($plugin_res['data'])
    ){
      if ( !isset($res['plugins'][$pp['plugin']]) ){
        $res['plugins'][$pp['plugin']] = [];
      }
      $res['plugins'][$pp['plugin']] = \bbn\x::merge_arrays($res['plugins'][$pp['plugin']], $plugin_res['data']);
    }
  }

  // Main loop
  while ($timer->measure('timeout') < $timeout){
    // Look if connection is aborted and die after 10 seconds if still disconnected.
    /** @todo To check the time used by connection_aborted function */
    if (connection_aborted()) {
      if (!$timer->has_started('disconnection')) {
        $timer->start('disconnection');
      }
      elseif ($timer->measure('disconnection') > 10) {
        x::log("Disconnected", 'poller');
        die("Disconnected");
      }
      sleep(1);
      continue;
    }
    elseif ($timer->has_started('disconnection')) {
      $timer->reset();
    }
    // PHP caches file data by default. clearstatcache() clears that cache
    clearstatcache();

    // Start|resume timers
    foreach ( $plugins_pollers as $pp ){
      if ( !$timer->has_started($pp['id']) ){
        $timer->start($pp['id'], (!empty($times[$pp['id']]) && ($times[$pp['id']]['current'] < $timeout)) ? (float)$times[$pp['id']]['start'] : null);
      }
    }
    // Check e run plugins functions
    foreach ( $plugins_pollers as $pp ){
      if ( !connection_aborted()
        && ($timer->measure($pp['id']) >= $pp['frequency'])
        && is_callable($pp['function'])
        && ($plugin_res = $pp['function']($model->data[$pp['plugin']] ?? $model->data))
        && !empty($plugin_res['success'])
      ){
        if (!empty($plugin_res['data'])) {
          if ( !isset($res['plugins'][$pp['plugin']]) ){
            $res['plugins'][$pp['plugin']] = [];
          }
          $res['plugins'][$pp['plugin']] = \bbn\x::merge_arrays($res['plugins'][$pp['plugin']], $plugin_res['data']);
        }
        $timer->stop($pp['id']);
        $timer->start($pp['id']);
      }
    }

    if (!empty($res['data']) || !empty($res['plugins'])) {
      $times_currents = $timer->currents();
      if ( !empty($times_currents) && dir::create_path(dirname($times_file)) ){
        file_put_contents($times_file, json_encode($times_currents, JSON_PRETTY_PRINT));
      }
      die(json_encode($res, JSON_PRETTY_PRINT));
    }
    // wait for 1 sec
    sleep(1);
  }
  //die(var_dump("File does not exist", $active_file, $res));
}
else{
  die(json_encode(['disconnected' => true]));
}
$times_currents = $timer->currents();
if ( !empty($times_currents) && dir::create_path(dirname($times_file)) ){
  file_put_contents($times_file, json_encode($times_currents, JSON_PRETTY_PRINT));
}
die("{}");