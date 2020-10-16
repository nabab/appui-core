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

  $actsource = dir::create_path($model->user_tmp_path($id_user).'poller/active');
  $datasource = dir::create_path($model->user_tmp_path($id_user).'poller/queue');

  /**
   * @var int A timestamp of the start of the execution.
   */
  $now = time();
  /**
   * @var timer A timer object to keep track of the time
   */
  $timer = new timer();
  // For the timour
  $timer->start('timeout');
  // To measure the active time
  $timer->start('activity');
  $timeout = 30;

  /**
   * @var array The list of plugins that have a poller model
   */
  $plugins = $model->get_cached_model($model->plugin_url('appui-core').'/poller_plugins', 300);
  /**
   * @var array The list of functions from plugins
   */
  $plugins_pollers = [];
  foreach ( $plugins as $plugin ){
    if ( $m = $model->get_subplugin_model('poller', [], $plugin, 'appui-core') ){
      array_push($plugins_pollers, ...array_map(function($p) use($plugin){
        $p['plugin'] = $plugin;
        return $p;
      }, $m));
    }
  }
  $times_file = \bbn\mvc::get_user_data_path($id_user, 'appui-core') . 'poller_times.json';
  $times = [];
  if ( is_file($times_file) ){
    $times = json_decode(file_get_contents($times_file), true);
  }
  /**
   * @var bool True if the chat plugin is configured.
   */
  $chat_enabled = $model->has_plugin('appui-chat');
  /**
   * @var bool True if chat data is being sent.
   */
  $hasChat = !empty($model->data['chat']);

  /**
   * @var array The result that will be output as JSON.
   */
  $res = [
    'data' => [],
    'start' => $now,
    'chat' => [],
    'plugins' => []
  ];
  /**
   * @var bbn\appui\observer
   */
  $observer = new \bbn\appui\observer($model->db);
  // Removing the files in active directory as there should be only one
  if ($files = dir::get_files($actsource)) {
    foreach ($files as $f){
      unlink($f);
    }
  }
  $active_file = $actsource.'/active_'.$now;
  // This file goes with the process
  $pid = getmypid();
  /** @todo What's the interest if I delete them?? */
  file_put_contents($active_file, (string)$pid);


  $observers = [];
  // If observers are sent we check which ones are not used and delete them
  if (isset($model->data['observers'])) {
    $observers = $model->data['observers'];
    foreach ($observer->get_list($id_user) as $ob){
      $found = false;
      if (!x::get_row($model->data['observers'], ['id' => $ob['id']])) {
        $observer->user_delete($ob['id']);
      }
    }
  }
  // main loop
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
    

    foreach ( $plugins_pollers as $pp ){
      if ( !$timer->has_started($pp['id']) ){
        $timer->start($pp['id'], (!empty($times[$pp['id']]) && ($times[$pp['id']]['current'] < $timeout)) ? (float)$times[$pp['id']]['start'] : null);
      }
      if ( !connection_aborted()
        && ($timer->measure($pp['id']) >= $pp['frequency'])
        && is_callable($pp['function'])
        && ($plugin_res = $pp['function']($model->data[$pp['plugin']] ?? $model->data))
      ){
        if ( !isset($res['plugins'][$pp['plugin']]) ){
          $res['plugins'][$pp['plugin']] = [];
        }
        $res['plugins'][$pp['plugin']] = \bbn\x::merge_arrays($res['plugins'][$pp['plugin']], $plugin_res);
        $timer->stop($pp['id']);
        $timer->start($pp['id']);
      }
    }

    /** @todo This part should be done in the central poller */
    /* if ($chat_enabled && $hasChat ) {
      // Creating adequate objects: chat & users
      $user_system = new \bbn\user\users($model->db);
      $chat_system = new \bbn\appui\chat($model->db, $model->inc->user);
      if ($timer->measure('activity') < 1) {
        $chat_users = $user_system->online_list();
        $chat_users_hash = md5(json_encode($chat_users));
        if ($chat_users_hash !== $model->data['usersHash']) {
          $res['chat']['users'] = $chat_users;
          $res['chat']['hash'] = $chat_users_hash;
        }
      }
      $ctmp = [
        'current' => [],
        'last' => $model->data['lastChat'] ?? 0
      ];
      if ($chats = $chat_system->get_chats()) {
        foreach ($chats as $c) {
          $ctmp['current'][$c] = [
            'info' => $chat_system->info($c),
            'admins' => $chat_system->get_admins($c),
            'participants' => $chat_system->get_participants($c, false)
          ];
        }
      }
      $chats_hash = md5(json_encode($ctmp));
      if ( ($chats_hash !== $model->data['chatsHash']) ){
        $ctmp['hash'] = $chats_hash;
        foreach ( $chats as $c ){
          if ( empty($model->data['chatsHash']) ){
            if ( $m = $chat_system->get_prev_messages($c) ){
              $ctmp['current'][$c]['messages'] = $m;
              $max = $m[count($m)-1]['time'];
              if (\bbn\x::compare_floats($max, $ctmp['last'], '>')) {
                $ctmp['last'] = $max;
              }
            }
          }
          else if ( $m = $chat_system->get_next_messages($c, $model->data['lastChat'] ?? null) ){
            $ctmp['current'][$c]['messages'] = $m;
            $max = $m[count($m)-1]['time'];
            if ( \bbn\x::compare_floats($max, $ctmp['last'], '>')) {
              $ctmp['last'] = $max;
            }
          }
        }
        $res['chat']['chats'] = $ctmp;
      }
    } */
    // Get files in the poller dir
    $files = \bbn\file\dir::get_files($datasource);
    if ($files && count($files)) {
      $result = [];
      $returned_obs = [];
      foreach ($files as $f){
        if ($ar = json_decode(file_get_contents($f), true)) {
          if (isset($ar['observers'])) {
            \bbn\x::log($ar['observers']);
            foreach ($ar['observers'] as $o){
              $value = \bbn\x::get_field($observers, ['id' => $o['id']], 'value');
              if (!$value || ($value !== $o['result'])) {
                $returned_obs[] = $o;
              }
            }
            if (count($returned_obs)) {
              $result[] = ['observers' => $returned_obs];
            }
          }
          else{
            $result[] = $ar;
          }
        }
        unlink($f);
      }
      // put data.txt's content and timestamp of last data.txt change into array
      // Leaves the page as it should be called back
      if (count($result)) {
        unlink($active_file);
        $res = ['data' => $result];
      }
    }
    // wait for 1 sec
    if ($timer->measure('activity') > 10) {
      $timer->stop('activity');
      $timer->start('activity');
      $model->inc->user->update_activity();
    }
    if (!empty($res['chat']) || !empty($res['data']) || !empty($res['plugins'])) {
      $times_currents = $timer->currents();
      if ( !empty($times_currents) && \bbn\file\dir::create_path(dirname($times_file)) ){
        file_put_contents($times_file, json_encode($times_currents, JSON_PRETTY_PRINT));
      }
      die(json_encode($res, JSON_PRETTY_PRINT));
    }
    sleep(1);
  }
  //die(var_dump("File does not exist", $active_file, $res));
}
else{
  die(json_encode(['disconnected' => true]));
}
die("{}");