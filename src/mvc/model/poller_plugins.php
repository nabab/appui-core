<?php
/** @var $model \bbn\mvc\model */
if ( $plugins = $model->get_plugins() ){
  return array_values(array_filter(array_keys($plugins), function($p) use($model){
    return $model->has_subplugin_model('poller', $p, 'appui-core');
  }));
}
return [];