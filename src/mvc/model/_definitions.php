<?php
$res = [
  'success' => false
];
if ( $model->db->check() ){
  $res['data'] = [
    'external_user_id' => $model->db->select_one('bbn_users', 'id', ['email' => BBN_EXTERNAL_USER_EMAIL]),
    'client_id' => $model->db->select_one('bbn_clients', 'id', ['nom' => BBN_CLIENT_NAME]),
    'admin_group' => $model->db->select_one('bbn_users_groups', 'id', ['nom' => 'Administrateurs']),
    'dev_group' => $model->db->select_one('bbn_users_groups', 'id', ['nom' => 'Développeurs']),
  ];  
  $res['success'] = true;
}
return $res;
