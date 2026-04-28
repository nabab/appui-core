<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 04/04/2017
 * Time: 05:02
 */

 use bbn\X;

/** @var bbn\Mvc\Controller $ctrl */
if (!empty($ctrl->post)) {
  $css = $ctrl->getPluginView('login/index', 'css') ?: $ctrl->getLess();
  $ctrl->addData([
    'css' => $css,
    'uid' => $ctrl->get['id'] ?? '',
    'key' => $ctrl->get['key'] ?? '',
    'core_root' => $ctrl->pluginUrl('appui-core') . '/',
  ]);
  if ($custom = $ctrl->getPluginView('login/index', 'html')) {
    $ctrl->addData([
      'custom' => $custom
    ]);
  }

  $ctrl->addData($ctrl->getModel());
  if ( ($custom_data = $ctrl->getPluginModel('login/index', $ctrl->data)) && is_array($custom_data) ){
    $ctrl->data = X::mergeArrays($ctrl->data, $custom_data);
  }
  $ctrl->addData([
    'script_src' => [
      constant('BBN_SHARED_PATH') . 'lib/bbn-cp/v2/dist/bbn-cp-all.js?' . http_build_query([
        'lang' => $data['lang'] ?? BBN_LANG,
        'test' => !BBN_IS_PROD,
        'v' => $data['version']
      ]),
    ]
  ]);
  $ctrl->addJs();
}
