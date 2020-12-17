<?php
/*
 * Describe what it does!
 *
 **/

/** @var $model \bbn\mvc\model */


$rsa = $model->app_path().'cfg/cert';
if (!is_file($rsa.'_rsa.pub')) {
  try {
    bbn\util\enc::generateCertFiles($rsa);
    $model->data['res']['success'] = true;
    $model->data['res']['message'] = _("Certificate created");
  }
  catch (\Exception $e) {
    $model->data['res']['success'] = false;
  	$model->data['res']['error'] = _("Failed to create SSL certificate").": ".$e->getMessage();
  }
}
$rsa .= '_rsa.pub';
$api = new bbn\appui\api($model->inc->user, $model->db);
if (!isset($model->data['res']['error'])
    && is_file($rsa)
    && ($id_app = $model->inc->options->from_code(BBN_ENV_NAME, 'env', BBN_PROJECT))
    && !$api->has_key()
) {
  $reg = $api->register(
    [
      'key' => file_get_contents($rsa),
      'id_project' => BBN_PROJECT,
      'id_app' => $id_app,
      'site_title' => BBN_SITE_TITLE,
      'user' => $model->inc->user->get_email(),
      'id_user' => $model->inc->user->get_id(),
      'app_name' => BBN_APP_NAME,
      'url' => BBN_URL,
      'hostname' => BBN_HOSTNAME
    ]
  );
  if ($reg && !empty($reg['id_app'])) {
    $pass = new bbn\appui\passwords($model->db);
    $pass->store($reg['key'], $id_app);
    $model->data['res']['success'] = _("Application registered with ID").' '.$reg['id_app'];
  }
  else {
    $model->data['res']['error'] = _("The application didn't register!");
  }
}

return $model->data['res'];