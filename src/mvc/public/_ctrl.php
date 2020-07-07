<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 25/11/2017
 * Time: 06:41
 */
/** @var \bbn\mvc\controller $ctrl */
//die(var_dump(array_keys($ctrl->files), $ctrl->files));
if ( !\defined('APPUI_CORE_ROOT') ){
  define('APPUI_CORE_ROOT', $ctrl->plugin_url('appui-core').'/');
  $ctrl->add_data($ctrl->get_model(APPUI_CORE_ROOT.'_model'));
}
