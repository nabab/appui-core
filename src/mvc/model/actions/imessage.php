<?php
/**
 * Created by BBN Solutions.
 * User: Mirko Argentino
 * Date: 16/03/2018
 * Time: 17:05
 */

if ( !empty($model->data['id']) && isset($model->data['hidden']) ){
  $imessages = new \bbn\Appui\Imessages($model->db);
  if ( empty($model->data['hidden']) ){
    $succ = $imessages->unsetHidden($model->data['id'], $model->inc->user->getId());
  }
  else {
    $succ = $imessages->setHidden($model->data['id'], $model->inc->user->getId());
  }
  return ['success' => $succ];
}