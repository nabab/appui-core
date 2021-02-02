<?php
$observer = new \bbn\Appui\Observer($model->db);
$id_user = $model->inc->user->getId();
$queue = \bbn\Mvc::getUserDataPath($id_user, 'appui-core') . 'poller/queue/' . $model->inc->user->getOsession('id_session');
return [[
  'id' => 'appui-core-0',
  'frequency' => 1,
  'function' => function(array $data) use($queue){
    $res = [
      'success' => true,
      'data' => []
    ];
    // Get files in the poller dir
    if (count($data['clients']) && ($files = \bbn\File\Dir::getFiles($queue)) && count($files)) {
      $returned_obs = [];
      $after = false;
      $clients_obs = [];
      foreach ($data['clients'] as $id => $d) {
        if (empty($d)) {
          continue;
        }
        if ($id === $data['client']) {
          $after = true;
          continue;
        }
        if ($after && !empty($d['observers'])) {
          $clients_obs = array_merge($clients_obs, array_map(function($co){
            return $co['id'];
          }, $d['observers']));
        }
      }
      foreach ($files as $f){
        if (($ar = json_decode(file_get_contents($f), true)) && isset($ar['observers'])) {
          foreach ($ar['observers'] as $i => $o){
            $value = \bbn\X::getField($data['data']['observers'] ?? [], ['id' => $o['id']], 'value');
            if (!$value || ($value !== $o['result'])) {
              $returned_obs[] = $o;
            }
            if (!in_array($o['id'], $clients_obs)) {
              unset($ar['observers'][$i]);
            }
          }
          if (empty($ar['observers'])) {
            unset($ar['observers']);
          }
        }
        if (empty($ar)) {
          \bbn\File\Dir::delete($f);
          if (!\bbn\File\Dir::getFiles($queue)) {
            \bbn\File\Dir::delete($queue);
          }
        }
        else {
          file_put_contents($f, Json_encode($ar));
        }
      }
      if (count($returned_obs)) {
        $res['data']['observers'] = $returned_obs;
      }
    }
    if (count($res['data']) && !empty($data['data']['active_file']) && is_file($data['data']['active_file'])) {
      unlink($data['data']['active_file']);
    }
    return $res;
  }
]];