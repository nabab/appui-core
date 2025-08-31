<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 25/11/2017
 * Time: 06:41
 */
/** @var bbn\Mvc\Controller $ctrl */
//die(var_dump(array_keys($ctrl->files), $ctrl->files));
if ( !\defined('APPUI_CORE_ROOT')){
  define('APPUI_CORE_ROOT', $ctrl->pluginUrl('appui-core').'/');
  $ctrl->addData($ctrl->getModel(APPUI_CORE_ROOT.'_model'));
}
