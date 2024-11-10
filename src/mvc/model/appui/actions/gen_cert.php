<?php
/*
 * Describe what it does!
 *
 **/

/** @var bbn\Mvc\Model $model */


$rsa = $model->appPath().'cfg/cert';
if (!is_file($rsa.'_rsa.pub')) {
  try {
    bbn\Util\Enc::generateCertFiles($rsa);
    $model->data['res']['success'] = true;
    $model->data['res']['message'] = _("Certificate created");
  }
  catch (\Exception $e) {
    $model->data['res']['success'] = false;
  	$model->data['res']['error'] = _("Failed to create SSL certificate").": ".$e->getMessage();
  }
  if (is_file($rsa)) {
    $api = new bbn\Appui\Api($model->inc->user, $model->db);
    $reg = $api->register(
      [
        'key' => file_get_contents($rsa),
        'id_project' => $id_project,
        'id_app' => $id_app,
        'site_title' => BBN_SITE_TITLE,
        'user' => $init['admin_email'],
        'id_user' => $id_user,
        'app_name' => BBN_APP_NAME,
        'url' => BBN_URL,
        'hostname' => BBN_HOSTNAME
      ],
      file_get_contents(BBN_APP_PATH.'src/cfg/to_appui_rsa')
    );
    if ($reg && !empty($reg['id_app'])) {
      $appui->setEnvironment(['id_app' => $reg['id_app']]);
      $appui->setSettings(['id_project' => $reg['id_project']]);
      $pass->store($reg['key'], $id_app);
      $installer->report("Application registered with ID ".$reg['id_app']);
    }
    else {
      $installer->report("The application didn't register!");
    }
  }
}
else {
  $model->data['res']['error'] = _("The certificate exists");
}
$rsa .= '_rsa.pub';

return $model->data['res'];