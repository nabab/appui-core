<?php
/** @var \bbn\Mvc\Model $model */
$data = ['success' => false];
if ($model->hasData(['name', 'value'], true)) {
  switch ($model->data['name']) {
    case 'user':
    case 'preferences':
    case 'permissions':
    case 'options':
    case 'history':
      if (is_string($model->data['value'])) {
        if (class_exists($model->data['value'])) {
          $res = $model->data['value'];
        }
      }
      else if ($model->data['value']) {
        $res = true;
      }
      break;
    case 'app_name':
    case 'theme':
    case 'site_title':
    case 'client_name':
      if (is_string($model->data['value'])) {
        $res = $model->data['value'];
      }
      break;
    case 'timezone':
      break;
    case 'sess_lifetime':
      if (\bbn\Str::isInteger($model->data['value'])) {
        $res = $model->data['value'];
      }
      break;
    case 'lang':
      break;
    case 'admin_email':
    case 'external_user_email':
      if (\bbn\Str::isEmail($model->data['value'])) {
        $res = $model->data['value'];
      }
      break;
    case 'external_user_id':
      if ($model->db->count('bbn_users', ['id' => $model->data['value']])) {
        $res = $model->data['value'];
      }
      break;
    case 'is_ssl':
      if (is_bool($model->data['value'])) {
        $res = $model->data['value'];
      }
      break;
    case 'env':
      if (\bbn\X::indexOf(['dev', 'test', 'prod'], $model->data['value']) > -1) {
        $res = $model->data['value'];
      }
      break;
    case 'project':
      break;
    case 'id_app':
      break;
    case 'db_engine':
      break;
    case 'db_host':
      break;
    case 'database':
      break;
    case 'db_user':
      break;
    case 'db_pass':
      break;
    case 'public':
      break;
    case 'shared_path':
      break;
    case 'static_path':
      break;
    case 'cur_path':
      break;
    case 'app_path':
      break;
    case 'lib_path':
      break;
    case 'data_path':
      break;
    case 'log_path':
      break;
    case 'log_path':
      break;
    case 'wp_url':
      break;
    case 'cdn_path':
      break;
    case 'cdn_db':
      break;
    case 'root_checker':
      break;
    case 'server_name':
    case 'hostname':
    case 'encryption_key':
    case 'fingerprint':
      break;
    default:
      break;
  }
  if (isset($res)) {
    if (empty($model->data['env'])) {
      $json = file_get_contents($model->appPath().'cfg/settings.json');
      if ($json) {
        $ar = json_decode($json, true);
        $ar[$model->data['name']] = $res;
        file_put_contents($model->appPath().'cfg/settings.json', Json_encode($ar, JSON_PRETTY_PRINT));
        $data['success'] = true;
      }
    }
    else {
      [$hostname, $app_path] = \bbn\X::split($model->data['env'], '---');
      $json = file_get_contents($model->appPath().'cfg/environment.json');
      if ($json) {
        $ar = json_decode($json, true);
        $idx = \bbn\X::search($ar, [
          'hostname' => $hostname,
          'app_path' => $app_path
        ]);
        if ($idx !== null ) {
          $ar[$idx][$model->data['name']] = $res;
          file_put_contents($model->appPath().'cfg/environment.json', Json_encode($ar, JSON_PRETTY_PRINT));
          $data['success'] = true;
        }
      }
    }
  }
}
elseif ($model->hasData(['url', 'path', 'action'], true)) {
  if ($json = file_get_contents($model->appPath().'cfg/routes.json')) {
    $ar = json_decode($json, true);
    if ($ar && $ar['alias']) {
      if ($model->data['action'] === 'insert') {
        $ar['alias'][$model->data['url']] = $model->data['path'];
      }
      else if (isset($model->data['index'])) {
        $i = 0;
        foreach ($ar['alias'] as $k => $v) {
          if ($i === $model->data['index']) {
            if ($k === $model->data['url']) {
              $ar['alias'][$k] = $model->data['path'];
            }
            else {
              unset($ar['alias'][$k]);
              $ar['alias'][$model->data['url']] = $model->data['path'];
            }
            break;
          }
          $i++;
        }
      }
      file_put_contents($model->appPath().'cfg/routes.json', Json_encode($ar, JSON_PRETTY_PRINT));
      $data['success'] = true;
    }
  }
  
}
return $data;