<?php
$observer = new \bbn\appui\observer($model->db);
$id_user = $model->inc->user->get_id();
$queue = \bbn\mvc::get_user_data_path($id_user, 'appui-core') . 'poller/queue';
return [/*[
  'id' => 'appui-core-0',
  'frequency' => 0,
  'function' => function(array $data) use($observer, $id_user){
    // If observers are sent we check which ones are not used and delete them
    if (isset($data['observers'])) {
      foreach ($observer->get_list($id_user) as $ob) {
        if (!\bbn\x::get_row($data['observers'], ['id' => $ob['id']])) {
          $observer->user_delete($ob['id']);
        }
      }
    }
    return ['success' => true];
  }
], */[
  'id' => 'appui-core-1',
  'frequency' => 1,
  'function' => function(array $data) use($queue){
    $res = [
      'success' => true,
      'data' => []
    ];
    // Get files in the poller dir
    if (($files = \bbn\file\dir::get_files($queue)) && count($files)) {
      $returned_obs = [];
      foreach ($files as $f){
        if ($ar = json_decode(file_get_contents($f), true)) {
          if (isset($ar['observers'])) {
            //\bbn\x::log($ar['observers']);
            foreach ($ar['observers'] as $o){
              $value = \bbn\x::get_field($data['observers'], ['id' => $o['id']], 'value');
              if (!$value || ($value !== $o['result'])) {
                $returned_obs[] = $o;
              }
            }
            if (count($returned_obs)) {
              $res['data'][] = ['observers' => $returned_obs];
            }
          }
          else{
            $res['data'][] = $ar;
          }
        }
        unlink($f);
      }
    }
    if (count($res['data']) && !empty($data['active_file']) && is_file($data['active_file'])) {
      unlink($data['active_file']);
    }
    return $res;
  }
]];