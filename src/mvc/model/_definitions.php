<?php
/** @var array The result */
$res = [
  'success' => false
];
if ($model->db->check()) {
  $mgr = $model->inc->user->get_manager();
  $res['data'] = [
    'admin_group' => $mgr->get_admin_group(),
    'dev_group' => $mgr->get_dev_group()
  ];
  if ( defined('BBN_EXTERNAL_USER_EMAIL') ){
    $res['external_user_id'] = $mgr->get_user_id(BBN_EXTERNAL_USER_EMAIL);
  }
  $res['success'] = true;
}
return $res;
