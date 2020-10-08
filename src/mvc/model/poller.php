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

set_time_limit(0);
// User is identified
if ($id_user = $model->inc->user->get_id()) {

  $actsource = \bbn\file\dir::create_path($model->user_tmp_path('appui-cron').'poller/active');
  $datasource = \bbn\file\dir::create_path($model->user_tmp_path('appui-cron').'poller/queue');

  // Chrono
  $now = time();
  $timer = new \bbn\util\timer();
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
    $user_system = new \bbn\user\users($model->db);
    $chat_system = new \bbn\appui\chat($model->db, $model->inc->user);
  }
  if ($chat_enabled && !empty($model->data['message'])) {
    // Gets the corresponding ID chat or creates one
    if (
      (
        isset($model->data['message']['id_chat']) &&
        ($id_chat = $model->data['message']['id_chat'])
      ) ||
      (
        !empty($model->data['message']['users']) &&
        !empty($model->data['message']['id_temp']) &&
        ($id_chat = $chat_system->get_chat_by_users($model->data['message']['users']))
      )
    ) {
      $chat_system->talk($id_chat, $model->data['message']['text']);
      $res['chat']['id_chat'] = $id_chat;
      if ( !empty($model->data['message']['id_temp']) ){
        $res['chat']['id_temp'] = $model->data['message']['id_temp'];
      }
    }
  }
  if (
    $chat_enabled &&
    !empty($model->data['setLastActivity']) &&
    !empty($model->data['setLastActivity']['id_chat']) &&
    !empty($model->data['setLastActivity']['id_user'])
  ){
    $chat_system->set_last_activity($model->data['setLastActivity']['id_chat'], $model->data['setLastActivity']['id_user']);
    unset($model->data['setLastActivity']);
  }
  $observer = new \bbn\appui\observer($model->db);
  if ($files = \bbn\file\dir::get_files($actsource)) {
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
        \bbn\x::log("Disconnected", 'poller');
        die("Disconnected");
      }
    }
    elseif ($timer->has_started('disconnection')) {
      $timer->reset();
    }
    // PHP caches file data by default. clearstatcache() clears that cache
    clearstatcache();
    /* if ($chat_enabled && $hasChat) {
      $chats = $chat_system->get_chats();
      $chats_hash = md5(json_encode($chats));
      if ($timer->measure('activity') < 1) {
        $chat_users = $user_system->online_list();
        $chat_users_hash = md5(json_encode($chat_users));
        if ($chat_users_hash !== $model->data['usersHash']) {
          $res['chat']['users'] = $chat_users;
          $res['chat']['hash'] = $chat_users_hash;
        }
      }
      if ( $chats_hash !== $model->data['chatsHash']) {
        $res['chat']['chats'] = [
          'current' => [],
          'hash' => $chats_hash,
          'last' => $model->data['lastChat'] ?? null
        ];
        foreach ( $chats as $c ){
          $res['chat']['chats']['current'][$c] = [
            'info' => $chat_system->info($c),
            'admins' => $chat_system->get_admins($c)
          ];
          if ( empty($model->data['chatsHash']) ){
            $res['chat']['chats']['current'][$c]['participants'] = $chat_system->get_participants($c, false);
            if ( empty($model->data['message']) && ($m = $chat_system->get_prev_messages($c)) ){
              $res['chat']['chats']['current'][$c]['messages'] = $m;
              $max = $m[count($m)-1]['time'];
              if (\bbn\x::compare_floats($max, $res['chat']['chats']['last'], '>')) {
                $res['chat']['chats']['last'] = $max;
              }
            }
          }
        }
      }
      if (count($chats)) {
        foreach ($chats as $chat){
          if ( $msgs = $chat_system->get_next_messages($chat, $model->data['lastChat'] ?? null) ) {
            if (!isset($res['chat']['chats'])) {
              $res['chat']['chats'] = [
                'current' => [],
                'last' => $model->data['lastChat'] ?? 0
              ];
            }
            $res['chat']['chats']['current'][$chat]['messages'] = $msgs;
            $res['chat']['chats']['current'][$chat]['participants'] = $chat_system->get_participants($chat, false);
            $res['chat']['chats']['current'][$chat]['admins'] = $chat_system->get_admins($chat);
            $max = $msgs[count($msgs)-1]['time'];
            if (\bbn\x::compare_floats($max, $res['chat']['chats']['last'], '>')) {
              $res['chat']['chats']['last'] = $max;
            }
          }
        }
      }
      if ( isset($model->data['message']) ){
        unset($model->data['message']);
      }
    } */
    if ($chat_enabled && $hasChat) {
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
      if ( $chats = $chat_system->get_chats() ){
        foreach ( $chats as $c ){
          $ctmp['current'][$c] = [
            'info' => $chat_system->info($c),
            'admins' => $chat_system->get_admins($c),
            'participants' => $chat_system->get_participants($c, false)
          ];
        }
      }
      $chats_hash = md5(json_encode($ctmp));
      if (
        ($chats_hash !== $model->data['chatsHash']) ||
        !empty($model->data['message'])
      ){
        $ctmp['hash'] = $chats_hash;
        foreach ( $chats as $c ){
          if ( empty($model->data['chatsHash']) && empty($model->data['message']) ){
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
      if ( isset($model->data['message']) ){
        unset($model->data['message']);
      }
    }
    // get files in the poller dir
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