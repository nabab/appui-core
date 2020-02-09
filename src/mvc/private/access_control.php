<?php
/** @var \bbn\mvc\controller $ctrl*/
$cr = $ctrl->plugin_url('appui-core').'/';
if ( ($definitions = $ctrl->get_cached_model($cr.'_definitions', 86400)) && isset($definitions['data']) ){
  foreach ( $definitions['data'] as $k => $def ){
    $st = 'BBN_'.strtoupper($k);
    if ( !defined($st) ){
      define($st, $def);
    }
  }
}
else{
  die("Impossible to set up the definitions in the root supercontroller");
}

if ( $ctrl->is_cli() ){
  return 1;
}

/** @var \bbn\user\permissions $perm */
$perm =& $ctrl->inc->perm;

/* @var $path string The controller that will be called */
$path = $ctrl->get_path();
$ctrl->db->set_error_mode('die');

/*
$adh = new \apst\adherent($ctrl->db, 5424);
\bbn\x::hdump($adh->infos_fiche([
  'pad' => 1,
  'bilan' => 'bilan'\
]));
die();
*/

/* @var $authorized array The authorized pages for the non logged in users */
$authorized = [];
if ( $path === $cr.'logout' ){
  $ctrl->set_mode('public');
  return true;
}
array_push($authorized, $cr.'login/password', $cr.'login/lost_pass', $cr.'service/index', $cr.'poller');

// Recherche du logo APST pour les stats
if ( !empty($_SERVER['REDIRECT_URL']) && strpos('logo-appui.app.jpg', $_SERVER['REDIRECT_URL']) ){
  $ctrl->reroute('logo_mail');
}
else if ( $ctrl->inc->user->is_just_login() ){
  if ( $err = $ctrl->inc->user->get_error() ){
    die(json_encode(['errorMessage' => $err['text']]));
  }
  die("1");
}
// Dans le cas où l'on veut la structure
else if ( $ctrl->get_mode() === 'dom' ){
  if ( !$ctrl->inc->user->check_session() ){
    // Just for GDPR
    $cookie = $ctrl->get_cookie();
    if ( empty($cookie) || empty($cookie['bbn_accept_cookie']) ){
      $ctrl->reroute('privacy');
    }
    else{
      if ( in_array($path, $authorized, true) ){
        return 1;
      }
      $ctrl->reroute('core/login');
    }
  }
  return 1;
}
else if ( in_array($path, $authorized, true) ){
  return 1;
}

// Checks if the user is connected
if ( !$ctrl->inc->user->check_session() ){
  return false;
}
if (
  ($path !== 'core/poller')
  && !defined("BBN_MVC_ID")
  && defined('BBN_REFERER')
){
  $ctrl->db->insert('bbn_mvc_logs', [
    'id_user' => $ctrl->inc->user->get_id() ?: null,
    'time' => microtime(true) * 1000,
    'path' => $path,
    'params' => count($ctrl->arguments) ? implode("/", $ctrl->arguments) : null,
    'post' => empty($ctrl->post) ? null : json_encode($ctrl->post),
    'referer' => BBN_REFERER
  ]);
  define("BBN_MVC_ID", $ctrl->db->last_id());
}

// The current path
$url = $ctrl->get_url();

// Case where we have a tabNav
if (
  defined('BBN_BASEURL') 
  && (
    empty(BBN_BASEURL)
    || (strpos($url, BBN_BASEURL) === 0)
  )
){
  // Length of the baseURL from the tabNav sending the request
  $len = strlen(BBN_BASEURL);
  // So we will give the first file matching after the base URL sent
  $start = BBN_BASEURL;
  // The baseURL must end with a slash
  if ( $len && (substr($url, -1) !== '/') ){
    $url .= '/';
  }
  // Start the rerouting search only if there is an URL behind - otherwise the normal controller will be launched
  if ( $remain = substr($url, $len) ){
    // Explores each part of the URL
    $bits = explode('/', $remain);
    foreach ( $bits as $i => $b ){
      $new = isset($new) ? $new.'/'.$b : $b;
      if (
        ($route = $ctrl->get_route($start.$new, $ctrl->get_mode())) &&
        ($route['path'] === $route['request'])
      ){
        if ( $route['path'] !== $ctrl->get_path() ){
          $ctrl->baseURL = BBN_BASEURL;
          $ctrl->reroute($start.$new, $ctrl->post, isset($bits[$i+1]) ? array_slice($bits, $i+1) : []);
        }
        break;
      }
    }
  }
  $ctrl->baseURL = BBN_BASEURL;
}
/** @var bbn\user\preferences $pref */
/*
$pref = \bbn\user\preferences::get_instance();
if ( $perms = $pref->get_existing_permissions($path) ){
  die(var_dump($perms));
}
*/
if ( $id_option = $ctrl->inc->perm->is($path) ){
  $ctrl->inc->perm->set_current($id_option);
  if ( $ctrl->inc->perm->has($id_option) ){
    return true;
  }
  else if ( $ctrl->inc->user->is_dev() ){
    return false;
  }
  else {
    $ctrl->obj->errorTitle = _("Unauthorized");
    $ctrl->obj->error = _("Sorry but you don't hasve the permission for ".$ctrl->get_path());
  }
}
return $ctrl->inc->user->is_dev();