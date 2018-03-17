<?php
/**
 * Created by BBN Solutions.
 * User: Mirko Argentino
 * Date: 16/03/2018
 * Time: 17:05
 */

if ( !empty($model->data['id']) && isset($model->data['hidden']) ){
  $imessages = new \bbn\appui\imessages($model->db);
  if ( empty($model->data['hidden']) ){
    $succ = $imessages->unset_hidden($model->data['id'], $model->inc->user->get_id());
  }
  else {
    $succ = $imessages->set_hidden($model->data['id'], $model->inc->user->get_id());
  }
  return ['success' => $succ];
}