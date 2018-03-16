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
// where does the data come from ? In real world this would be a SQL query or something
$now = time();

if ( defined('BBN_USER_TOKEN_PATH') ){
  $id_user = $model->inc->user->get_id();
  $actsource = \bbn\file\dir::create_path(BBN_USER_TOKEN_PATH.'poller/active');
  $datasource = \bbn\file\dir::create_path(BBN_USER_TOKEN_PATH.'poller/queue');
  if ( $id_user && $datasource && $actsource ){
    $timer = new \bbn\util\timer();
    $timer->start();
    $hasChat = !empty($model->data['chat']);
    if ( $hasChat ){
      $user_system = new \bbn\user\users($model->db);
      $chat_system = new \bbn\appui\chat($model->db, $model->inc->user);
    }
    if ( !empty($model->data['message']) && (!empty($model->data['message']['id_chat']) || !empty($model->data['message']['users'])) ){
      $id_chat = empty($model->data['message']['id_chat']) ? $chat_system->get_chat_by_users($model->data['message']['users']) : $model->data['message']['id_chat'];
      if ( $id_chat ){
        $chat_system->talk($id_chat, $model->data['message']['text']);
      }
    }
    $observer = new \bbn\appui\observer($model->db);
    if ( $files = \bbn\file\dir::get_files($actsource) ){
      foreach ( $files as $f ){
        unlink($f);
      }
    }
    $active_file = $actsource.'/active_'.$now;
    // This file goes with the process
    file_put_contents($active_file, '1');


    $observers = [];
    // If observers are sent we check which ones are not used and delete them
    if ( isset($model->data['observers']) ){
      $observers = $model->data['observers'];
      foreach ( $observer->get_list(BBN_USER_TOKEN_ID) as $ob ){
        $found = false;
        foreach ( $model->data['observers'] as $sent ){
          if ( $sent['id'] === $ob['id'] ){
            $found = true;
            break;
          }
        }
        if ( !$found ){
          $observer->token_delete($ob['id']);
        }
      }
    }

    // main loop
    while ( file_exists($active_file) ) {

      if ( $hasChat ){
        $last = 0;
        $chats = [];
        if ( $timer->measure() < 1 ){
          $chat_users = $user_system->online_list();
          $chat_hash = md5(json_encode($chat_users));
          $res = [];
          if ( $chat_hash !== $model->data['usersHash'] ){
            $res = [
              'users' => $chat_users,
              'hash' => $chat_hash
            ];
          }
          $chats = $chat_system->get_chats();
        }
        if ( count($chats) ){
          foreach ( $chats as $chat ){
            if (
              ($msgs = $chat_system->get_messages($chat, $model->data['lastChat'] ?? null)) &&
              count($msgs['messages'])
            ){
              if ( !isset($res['chats']) ){
                $res['chats'] = [];
                $res['last'] = 0;
              }
              $res['chats'][$chat] = $msgs;
              $res['chats'][$chat]['participants'] = $chat_system->get_participants($chat);
              $max = \bbn\x::max_with_key($msgs['messages'], 'time');
              if ( \bbn\x::compare_floats($max, $res['last'], '>') ){
                $res['last'] = $max;
              }
            }
          }
          if ( !empty($res['last']) ){
            $res['last'] = ceil($res['last'] * 10000) / 10000;
          }
        }
        if ( !empty($res) ){
          if ( isset($id_chat) ){
            $res['id_chat'] = $id_chat;
          }
          return ['chat' => $res];
        }
      }
      // PHP caches file data by default. clearstatcache() clears that cache
      clearstatcache();
      // get files in the poller dir
      $files = \bbn\file\dir::get_files($datasource);
      if ( count($files) ){
        $res = [];
        $returned_obs = [];
        foreach ( $files as $f ){
          if ( $ar = json_decode(file_get_contents($f), true) ){
            if ( isset($ar['observers']) ){
              foreach ( $ar['observers'] as $o ){
                $value = \bbn\x::get_field($observers, ['id' => $o['id']], 'value');
                if ( !$value || ($value !== $o['value']) ){
                  $returned_obs[] = $o;
                }
              }
              if ( count($returned_obs) ){
                $res[] = ['observers' => $returned_obs];
              }
            }
            else{
              $res[] = $ar;
            }
          }
          unlink($f);
        }
        // put data.txt's content and timestamp of last data.txt change into array
        // Leaves the page as it should be called back
        if ( count($res) ){
          unlink($active_file);
          return ['data' => $res];
        }
      }
      // wait for 1 sec
      sleep(1);
      if ( $timer->measure() > 10 ){
        $timer->stop();
        $timer->start();
        $model->inc->user->update_activity();
      }
    }
  }
  //die(var_dump("File does not exist", $active_file, $res));
}