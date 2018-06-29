<?php
/**
 * User: BBN
 * Date: 18/05/2018
 * Time: 10:50
 */

/** @var \bbn\mvc\controller $ctrl The current controller */
if ( $ctrl->has_plugin('appui-dashboard') ){
  $ctrl->reroute($ctrl->plugin_url('appui-dashboard').'/home');
}
else if ( BBN_APP_PATH.'mvc/home' ){
  $ctrl->reroute('home');
}
else{
  echo '<h2>Welcome in App-UI</h2>';
}

