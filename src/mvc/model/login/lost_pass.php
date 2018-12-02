<?php
if ( 
  !empty($model->data['email']) &&
  ($cfg = $model->inc->user->get_class_cfg()) &&
  ($mgr = $model->inc->user->get_manager()) &&
  ($id = $model->db->select_one($cfg['table'], $cfg['arch']['users']['id'], [$cfg['arch']['users']['email'] => $model->data['email']]))
){
  return ['success' => $mgr->make_hotlink($id, 'password')];
}