<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 25/11/2017
 * Time: 06:24
 *
 * @var $ctrl \bbn\Mvc\Controller
 */

/*
$shortcuts = $ctrl->getModel($ctrl->pluginUrl('appui-menu').'/shortcuts/list');
$routes = $ctrl->getRoutes();
$plugins = [];
foreach ( $routes as $r ){
  $plugins[$r['name']] = $r['url'];
}
$ctrl->data = $ctrl->getModel($ctrl->pluginUrl('appui-core').'/_index');
$ctrl->addData([
  'plugins' => $plugins,
  'shortcuts' => $shortcuts
]);
// The whole DOM
if (empty($ctrl->post)) {
  $ctrl->data['custom_css'] = $ctrl->customPluginView('index', 'css', [], 'appui-core') ?: $ctrl->getLess();
  $ctrl->data['token'] = $ctrl->inc->user->addToken();
  $ctrl->combo($ctrl->data['site_title'], $ctrl->data);
}
// Only the data
else {
  $ctrl->addJs();
  $ctrl->data['js_data'] = $ctrl->customPluginView('index', 'js', $ctrl->data, 'appui-core');
  $ctrl->obj->data = $ctrl->data;
}
*/

/** @var string */
if (!empty($ctrl->post['get'])) {
  $ctrl->action();
  if (!empty($ctrl->post['js'])) {
    $ctrl->obj->data->script = $ctrl->getView(APPUI_CORE_ROOT.'/index', 'js');
  }
  
}
else {
  $appui = new bbn\Appui();
  echo $appui->createUI('', [
    'animate-css',
    'font-mfizz',
    'webmin-font',
    'jsPDF',
    'html2canvas'
  ]);
}


/*
echo "HELLO hey";
$items = $ctrl->inc->options->items($ctrl->inc->options->getRoot());
\bbn\X::hdump(\bbn\Str::isUid($ctrl->inc->options->getRoot()));
\bbn\X::hdump(\bbn\Str::isUid($ctrl->inc->options->getDefault()));
\bbn\X::hdump(bin2hex($ctrl->inc->options->getRoot()));
\bbn\X::hdump(bin2hex($ctrl->inc->options->getDefault()));
\bbn\X::hdump(count($ctrl->inc->options->nativeOption($ctrl->inc->options->getRoot())));
\bbn\X::hdump(count($items));
\bbn\X::hdump(\bbn\X::convertUids($items));
\bbn\X::hdump(\bbn\X::convertUids($ctrl->inc->options->fullOptions($items[0])));
*/
