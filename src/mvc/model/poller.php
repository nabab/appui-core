<?php
/**
 * Server-side file.
 * This file is an infinitive loop. Seriously.
 * It gets the file data.txt's last-changed timestamp, checks if this is larger than the timestamp of the
 * AJAX-submitted timestamp (time of last ajax request), and if so, it sends back a JSON with the data from
 * data.txt (and a timestamp). If not, it waits for one seconds and then start the next while step.
 *
 * Note: This returns a JSON, containing the content of data.txt and the timestamp of the last file change.
 * This timestamp is used by the client's JavaScript for the next request, so THIS server-side script here only
 * serves new content after the last file change. Sounds weird, but try it out, you'll get into it really fast!
 */

// Import necessary utility and MVC classes
use bbn\Util\Timer;
use bbn\File\Dir;
use bbn\X;
use bbn\Mvc;

// Prevent the script from timing out due to execution time limits
set_time_limit(0);

/** @var bbn\Mvc\Model $model */
// Identify the current user session
if ($id_user = $model->inc->user->getId()) {

  // Define path for active process files
  $actsource = Dir::createPath(Mvc::getUserDataPath($id_user, 'appui-core') . 'poller/active');
  
  // Define path for the task queue
  $datasource = Dir::createPath(Mvc::getUserDataPath($id_user, 'appui-core') . 'poller/queue');
  
  // Define path for the file storing plugin execution timestamps
  $times_file = Mvc::getUserDataPath($id_user, 'appui-core') . 'poller/times.json';
  
  // Capture current timestamp for this execution run
  $now = time();
  
  /** @var Timer A timer object to keep track of the time */
  $timer = new Timer();
  
  // Start a timer to monitor total execution duration
  $timer->start('timeout');
  
  // Maximum allowed runtime in seconds before stopping the loop
  $timeout = 30;
  
  /** @var array The list of plugins that have a poller model */
  $plugins = $model->getCachedModel($model->pluginUrl('appui-core').'/poller_plugins', 300);
  
  // List for plugins intended to run repeatedly in the loop
  $plugins_pollers = [];
  
  // List for plugins intended to run only once at startup
  $plugins_pollers_noloop = [];

  // Categorize plugins based on whether they have a defined frequency
  foreach ($plugins as $plugin) {
    if ($m = $model->getSubpluginModel('poller', [], $plugin, 'appui-core')) {
      foreach ($m as $p) {
        $p['plugin'] = $plugin;
        // If no frequency is set, it's a "run once" plugin
        if (empty($p['frequency'])) {
          $plugins_pollers_noloop[] = $p;
        } else {
          $plugins_pollers[] = $p;
        }
      }
    }
  }

  /** @var array The current times list loaded from disk */
  $times = [];
  // Load existing execution timestamps if the file exists
  if (is_file($times_file)) {
    $times = json_decode(file_get_contents($times_file), true);
  }

  /** @var array The result that will be output as JSON. */
  $res          = [];
  // Template for the response structure
  $res_template = [
    'data' => [],
    'start' => $now,
    'plugins' => []
  ];

  // Clean up any existing active process files to ensure a fresh state
  if ($files = Dir::getFiles($actsource)) {
    foreach ($files as $f) {
      if (is_file($f)) {
        unlink($f);
      }
    }
  }

  // Create a unique active file for this specific process instance using the current timestamp
  $active_file = $actsource.'/active_'.$now;
  
  // Get the Process ID of the current script execution
  $pid = getmypid();
  
  /** @todo What's the interest if I delete them?? */
  // Write the PID to the active file so other processes know this one is running
  file_put_contents($active_file, (string)$pid);

  // Retrieve the list of clients that have data available
  $clients = $model->hasData('clients', true) ? $model->data['clients'] : [];

  // Execute "run-once" plugins for every client before entering the main loop
  foreach ($plugins_pollers_noloop as $pp) {
    foreach ($clients as $id => $data) {
      // Ensure the client has a container for appui-core data
      if (!isset($data['appui-core'])) {
        $clients[$id]['appui-core'] = [];
      }

      // Attach the active file path to the client context
      $clients[$id]['appui-core']['active_file'] = $active_file;
      
      // Prepare data package for the plugin function
      $d = [
        'client' => $id,
        'clients' => array_map(
          function ($c) use ($pp) {
            return $c[$pp['plugin']] ?? [];
          }, 
          $clients
        ),
        'data' => $clients[$id][$pp['plugin']] ?? []
      ];

      // Run the plugin function if connection is active and function returns success with data
      if (!connection_aborted()
          && is_callable($pp['function'])
          && ($plugin_res = $pp['function']($d))
          && !empty($plugin_res['success'])
          && !empty($plugin_res['data'])
      ) {
        // Initialize response structure for this client if not already done
        if (!isset($res[$id])) {
          $res[$id] = $res_template;
        }

        // Ensure the plugin key exists in the response
        if (!isset($res[$id]['plugins'][$pp['plugin']])) {
          $res[$id]['plugins'][$pp['plugin']] = [];
        }

        // Merge new data into the existing results for this client/plugin
        $res[$id]['plugins'][$pp['plugin']] = X::mergeArrays($res[$id]['plugins'][$pp['plugin']], $plugin_res['data']);
      }
    }
  }

  // Main polling loop: continues until timeout is reached or connection is lost
  while ($timer->measure('timeout') < $timeout) {
    
    // Check if the client has disconnected to prevent unnecessary processing
    if (connection_aborted()) {
      // If this is a new disconnection, start a timer to allow for brief network hiccups
      if (!$timer->hasStarted('disconnection')) {
        $timer->start('disconnection');
      } elseif ($timer->measure('disconnection') > 10) {
        // If disconnected for more than 10 seconds, log and terminate
        X::log("Disconnected", 'poller');
        die("Disconnected");
      }

      // Exit immediately if the connection is gone
      die('{}');
    } elseif ($timer->hasStarted('disconnection')) {
      // If we were disconnected but now connected, reset the disconnection timer
      $timer->reset();
    }

    // Clear PHP's internal file status cache to ensure we read fresh file timestamps
    clearstatcache();

    // Track which plugins are starting their execution cycle in this loop iteration
    $started_now = [];
    foreach ($plugins_pollers as $pp) {
      if (!$timer->hasStarted($pp['id'])) {
        $started_now[] = $pp['id'];
        // Resume timer from the last recorded time if it was previously running
        $timer->start(
          $pp['id'], 
          (!empty($times[$pp['id']]) && ($times[$pp['id']]['current'] < $timeout)) ? (float)$times[$pp['id']]['start'] : null
        );
      }
    }

    // Iterate through all periodic plugins to check if it's time to run them again
    foreach ($plugins_pollers as $pp) {
      $restart_timer = false;
      foreach ($clients as $id => $data) {
        // Prepare the data context for the plugin execution
        $d = [
          'client' => $id,
          'clients' => array_map(
            function ($c) use ($pp) {
              return $c[$pp['plugin']] ?? [];
            }, 
            $clients
          ),
          'data' => $data[$pp['plugin']] ?? []
        ];

        // Check if the plugin's frequency interval has passed or if it was just started
        if (!connection_aborted()
            && (($timer->measure($pp['id']) >= $pp['frequency']) || in_array($pp['id'], $started_now, true))
            && is_callable($pp['function'])
            && ($plugin_res = $pp['function']($d))
            && !empty($plugin_res['success'])
        ) {
          // If the plugin returned new data, add it to the response set
          if (!empty($plugin_res['data'])) {
            if (!isset($res[$id])) {
              $res[$id] = $res_template;
            }

            if (!isset($res[$id]['plugins'][$pp['plugin']])) {
              $res[$id]['plugins'][$pp['plugin']] = [];
            }

            $res[$id]['plugins'][$pp['plugin']] = X::mergeArrays($res[$id]['plugins'][$pp['plugin']], $plugin_res['data']);
          }

          // Mark that this plugin's timer needs to be reset after the loop
          $restart_timer = true;
        }
      }

      // If any client triggered a plugin execution, restart its internal timer
      if ($restart_timer) {
        $timer->stop($pp['id']);
        $timer->start($pp['id']);
      }
    }

    // If there is any new data collected in this loop iteration, save state and return it
    if (!empty($res)) {
      $times_currents = $timer->currents();
      // Save the current timer states to disk so they can be resumed later
      if (!empty($times_currents) && Dir::createPath(dirname($times_file))) {
        file_put_contents($times_file, json_encode($times_currents, JSON_PRETTY_PRINT));
      }

      return $res;
    }

    // No new data found; wait 1 second before the next polling cycle to save CPU
    sleep(1);
  }
} elseif (!empty($model->data['clients'])) {
  // If user is identified but no clients are active, return a disconnected status for all clients
  return array_map(
    function () {
      return ['disconnected' => true];
    }, 
    $model->data['clients']
  );
}

// Default empty response
return [];
