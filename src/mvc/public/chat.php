<?php

/** @var bbn\Mvc\Controller $ctrl */

/*
$ctrl->db->insert('bbn_chats', [
  'creator' => $ctrl->inc->user->getId(),
  'creation' => date('Y-m-d H:i:s')
]);
var_dump($ctrl->db->lastId());
*/
$res = 0;
/*
$res += $ctrl->db->insert('bbn_chats_users', [
  'id_user' => $ctrl->inc->user->getId(),
  'entrance' => date('Y-m-d H:i:s'),
  'id_chat' => 'df0da0bc163911e89bdf366237393031',
  'admin' => 1
]);
foreach ( $ctrl->db->getColArray("SELECT id FROM bbn_users WHERE email LIKE '%bbn.so'") as $id ){
  $res += $ctrl->db->insert('bbn_chats_users', [
    'id_user' => $id,
    'entrance' => date('Y-m-d H:i:s'),
    'id_chat' => 'df0da0bc163911e89bdf366237393031',
    'admin' => $id === $ctrl->inc->user->getId() ? 1 : 0
  ]);
}
*/

var_dump($res);