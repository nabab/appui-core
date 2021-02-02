<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 25/11/2017
 * Time: 06:24
 *
 * @var $ctrl \bbn\Mvc\Controller
 */

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
  $ctrl->data['custom_css'] = $ctrl->getPluginView('index', 'css') ?: $ctrl->getLess();
  $ctrl->data['token'] = $ctrl->inc->user->addToken();
  $ctrl->combo($ctrl->data['site_title'], $ctrl->data);
}
// Only the data
else {
  $ctrl->addJs();
  $ctrl->data['js_data'] = $ctrl->customPluginView('index', 'js', $ctrl->data, 'appui-core');
  $ctrl->obj->data = $ctrl->data;
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
