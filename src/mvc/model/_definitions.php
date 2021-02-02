<?php
/** @var array The result */
$res = [
  'success' => false
];
if ($model->db->check()) {
  $mgr = $model->inc->user->getManager();
  $res['data'] = [
    'admin_group' => $mgr->getAdminGroup(),
    'dev_group' => $mgr->getDevGroup()
  ];
  if ( defined('BBN_EXTERNAL_USER_EMAIL') ){
    $res['external_user_id'] = $mgr->getUserId(BBN_EXTERNAL_USER_EMAIL);
  }
  $res['success'] = true;
}
return $res;
