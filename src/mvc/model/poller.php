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
use bbn;
use bbn\x;

set_time_limit(0);
// User is identified
if ($id_user = $model->inc->user->get_id()) {

  $actsource = bbn\file\dir::create_path($model->user_tmp_path('appui-cron').'poller/active');
  $datasource = bbn\file\dir::create_path($model->user_tmp_path('appui-cron').'poller/queue');

  // Chrono
  $now = time();
  $timer = new bbn\util\timer();
  $timer->start('timeout');
  $timer->start('activity');
  $chat_enabled = $model->has_plugin('appui-chat');
  $hasChat = !empty($model->data['chat']);
  $res = [
    'data' => [],
    'start' => $now,
    'chat' => []
  ];
  if ($chat_enabled && $hasChat) {
    $user_system = new bbn\user\users($model->db);
    $chat_system = new bbn\appui\chat($model->db, $model->inc->user);
  }
  if ($chat_enabled && !empty($model->data['message'])) {
    // Gets the corresponding ID chat or creates one
    if ((isset($model->data['message']['id_chat']) && ($id_chat = $model->data['message']['id_chat'])) 
        || (!empty($model->data['message']['users']) && ($id_chat = $chat_system->get_chat_by_users($model->data['message']['users'])))
    ) {
      $chat_system->talk($id_chat, $model->data['message']['text']);
      $res['chat']['id_chat'] = $id_chat;
    }
    unset($model->data['message']);
  }
  $observer = new bbn\appui\observer($model->db);
  if ($files = bbn\file\dir::get_files($actsource)) {
    foreach ($files as $f){
      unlink($f);
    }
  }
  $active_file = $actsource.'/active_'.$now;
  // This file goes with the process
  file_put_contents($active_file, '1');


  $observers = [];
  // If observers are sent we check which ones are not used and delete them
  if (isset($model->data['observers'])) {
    $observers = $model->data['observers'];
    foreach ($observer->get_list($id_user) as $ob){
      $found = false;
      foreach ($model->data['observers'] as $sent){
        if ($sent['id'] === $ob['id']) {
          $found = true;
          break;
        }
      }
      if (!$found) {
        $observer->user_delete($ob['id']);
      }
    }
  }
  // main loop
  while ($timer->measure('timeout') < 30){
    if (connection_aborted()) {
      if (!$timer->has_started('disconnection')) {
        $timer->start('disconnection');
      }
      elseif ($timer->measure('disconnection') > 10) {
        x::log("Disconnected", 'poller');
        die("Disconnected");
      }
    }
    elseif ($timer->has_started('disconnection')) {
      $timer->reset();
    }
    // PHP caches file data by default. clearstatcache() clears that cache
    clearstatcache();
    if ($chat_enabled && $hasChat) {
      $last = 0;
      $chats = $chat_system->get_chats();
      if ($timer->measure('activity') < 1) {
        $chat_users = $user_system->online_list();
        $chat_hash = md5(json_encode($chat_users));
        if ($chat_hash !== $model->data['usersHash']) {
          $res['chat']['users'] = $chat_users;
          $res['chat']['hash'] = $chat_hash;
        }
      }
      if (count($chats)) {
        foreach ($chats as $chat){
          if (($msgs = $chat_system->get_messages($chat, $model->data['lastChat'] ?? null)) 
              && count($msgs['messages'])
          ) {
            if (!isset($res['chat']['chats'])) {
              $res['chat']['chats'] = [];
              $res['chat']['last'] = 0;
            }
            $res['chat']['chats'][$chat] = $msgs;
            $res['chat']['chats'][$chat]['participants'] = $chat_system->get_participants($chat);
            $max = $msgs['last'];
            if (x::compare_floats($max, $res['chat']['last'], '>')) {
              $res['chat']['last'] = $max;
            }
          }
        }
        if (!empty($res['chat']['last'])) {
          //$res['chat']['last'] = ceil($res['chat']['last'] * 10000) / 10000;
        }
      }
    }
    // get files in the poller dir
    $files = bbn\file\dir::get_files($datasource);

    if ($files && count($files)) {
      $result = [];
      $returned_obs = [];
      foreach ($files as $f){
        if ($ar = json_decode(file_get_contents($f), true)) {
          if (isset($ar['observers'])) {
            x::log($ar['observers']);
            foreach ($ar['observers'] as $o){
              $value = x::get_field($observers, ['id' => $o['id']], 'value');
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
        break;
      }
    }
    // wait for 1 sec
    if ($timer->measure('activity') > 10) {
      $timer->stop('activity');
      $timer->start('activity');
      $model->inc->user->update_activity();
    }
    if (!empty($res['chat']) || !empty($res['data'])) {
      die(json_encode($res));
    }
    sleep(1);
  }
  //die(var_dump("File does not exist", $active_file, $res));
}
else{
  die(json_encode(['disconnected' => true]));
}
die("{}");