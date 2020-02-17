<?php
/** @var array The result */
$res = [
  'success' => false
];
if ($model->db->check()) {
  $mgr = $model->inc->user->get_manager();
  $res['data'] = [
    'external_user_id' => $mgr->get_user_id(BBN_EXTERNAL_USER_EMAIL),
    'admin_group' => $mgr->get_admin_group(),
    'dev_group' => $mgr->get_dev_group()
  ];
  $res['success'] = true;
}
return $res;
