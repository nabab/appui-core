<?php
if ( 
  !empty($model->data['email']) &&
  ($cfg = $model->inc->user->getClassCfg()) &&
  ($mgr = $model->inc->user->getManager()) &&
  ($id = $model->db->selectOne($cfg['table'], $cfg['arch']['users']['id'], [$cfg['arch']['users']['email'] => $model->data['email']]))
){
  return ['success' => $mgr->makeHotlink($id, 'password')];
}