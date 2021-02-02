<?php
/** @var $model \bbn\Mvc\Model */
if ( $plugins = $model->getPlugins() ){
  return array_values(array_filter(array_keys($plugins), function($p) use($model){
    return $model->hasSubpluginModel('poller', $p, 'appui-core');
  }));
}
return [];