<?php
/** @var \bbn\Mvc\Controller $ctrl The controller */
$cr = $ctrl->pluginUrl('appui-core').'/';

if (($definitions = $ctrl->getCachedModel($cr.'_definitions', 86400))
    && isset($definitions['data'])
) {
  foreach ($definitions['data'] as $k => $def) {
    $st = 'BBN_'.strtoupper($k);
    if (!defined($st)) {
      define($st, $def);
    }
  }
}
else{
  die("Impossible to set up the definitions in the root supercontroller");
}

if ($ctrl->isCli()) {
  return 1;
}

/** @var \bbn\User\Permissions $perm */
$perm =& $ctrl->inc->perm;

/* @var $path string The controller that will be called */
$path = $ctrl->getPath();
$ctrl->db->setErrorMode('die');

$auth_no_user = [
  $cr.'manifest'
];
if (($ctrl->getMode() === 'dom') && in_array($path, $auth_no_user, true)) {
  return 1;
}

/* @var $authorized array The authorized pages for the non logged in users */
$ctrl->addAuthorizedRoute(
  $cr.'login',
  $cr.'login/index',
  $cr.'service/index',
  $cr.'service',
  $cr.'components',
  $cr.'poller'
);
if ($path === $cr.'logout') {
  $ctrl->setMode('public');
  return true;
}

$err = $ctrl->inc->user->getError();
// Recherche du logo APST pour les stats
if (!empty($_SERVER['REDIRECT_URL'])
    && strpos('logo-appui.app.jpg', $_SERVER['REDIRECT_URL'])
) {
  $ctrl->reroute('logo_mail');
}
elseif ($ctrl->inc->user->isJustLogin()) {
  if ($err) {
    die(json_encode(['errorMessage' => $err['text']]));
  }

  die('1');
}
elseif ($ctrl->inc->user->isReset()) {
  if ($err) {
    die(json_encode(['errorMessage' => $err['text']]));
  }

  die('{"success": 1}');
}
// Dans le cas où l'on veut la structure
elseif ($ctrl->getMode() === 'dom') {
  // Check registered URL
  $urlCls = new \bbn\Appui\Url($ctrl->db);
  if ($urlCls->urlExists($ctrl->getUrl())) {
    $fullUrl = $urlCls->getFullUrl($urlCls->urlToId($ctrl->getUrl()));
    switch ($fullUrl['type_url']) {
      case 'media':
        $ctrl->reroute($ctrl->pluginUrl('appui-note') . '/media/image/index', [], \bbn\X::split($ctrl->getUrl(), '/'));
        return true;
      case 'note':
        break;
    }
  }

  if ($ctrl->hasPlugin('appui-api')
      && ($api = $ctrl->pluginUrl('appui-api'))
      && (      ($ctrl->getRequest() === $api)
      || ($ctrl->getRequest() === $api.'/index'))
  ) {
    $ctrl->addAuthorizedRoute(
      $api.'/index',
      $api
    );
    //die(var_dump($ctrl->getRequest()));
  }
  elseif (!$ctrl->inc->user->checkSession()) {
    if ($ctrl->getPath() === $cr.'service') {
      return 1;
    }

    $rerouted = false;
    if ($ctrl->hasPlugin('appui-gdpr')) {
      $cookie = $ctrl->getCookie();
      if (empty($cookie) || empty($cookie['bbn_accept_cookie'])) {
        $ctrl->reroute($ctrl->pluginUrl('appui-gdpr'));
        $rerouted = true;
      }
    }

    if (!$rerouted) {
      if ($ctrl->isAuthorizedRoute($path)) {
        return 1;
      }

      $ctrl->reroute($cr.'login');
    }
  }

  return 1;
}
elseif ($ctrl->isAuthorizedRoute($path)) {
  return 1;
}

// Checks if the user is connected
if (!$ctrl->inc->user->checkSession()) {
  die(json_encode(['disconnected' => true]));
}

if (defined('BBN_HISTORY') && BBN_HISTORY && class_exists('\\bbn\\Appui\\History')) {
  \bbn\Appui\History::setUser($ctrl->inc->user->getId());
}

if (($path !== $cr.'poller')
    && !defined("BBN_MVC_ID")
    && defined('BBN_REFERER')
) {
  /*
  $ctrl->db->insert(
    'bbn_mvc_logs',
    [
      'id_user' => $ctrl->inc->user->getId() ?: null,
      'time' => microtime(true) * 1000,
      'path' => $path,
      'params' => count($ctrl->arguments) ? implode("/", $ctrl->arguments) : null,
      'post' => empty($ctrl->post) ? null : json_encode(array_keys($ctrl->post)),
      'referer' => BBN_REFERER
    ]
  );
  define("BBN_MVC_ID", $ctrl->db->lastId());
  */
}

// The current path
$url = $ctrl->getUrl();

/** @var string BBN_BASEURL */

// Case where we have a bbn-router (nav)
if (defined('BBN_BASEURL') && (empty(BBN_BASEURL) || (strpos($url, BBN_BASEURL) === 0))) {
  // Length of the baseURL from the bbn-router(nav) sending the request
  $len = strlen(BBN_BASEURL);
  // So we will give the first file matching after the base URL sent
  $start = BBN_BASEURL;
  // The baseURL must end with a slash
  if ($len && (substr($url, -1) !== '/')) {
    $url .= '/';
  }

  // Start the rerouting search only if there is an URL behind
  // otherwise the normal controller will be launched
  if ($remain = substr($url, $len)) {
    // Explores each part of the URL
    $bits = explode('/', $remain);
    foreach ($bits as $i => $b) {
      $new = isset($new) ? $new.'/'.$b : $b;
      if (($route = $ctrl->getRoute($start.$new, $ctrl->getMode()))
          && ($route['path'] === $route['request'])
      ) {
        if ($route['path'] !== $ctrl->getPath()) {
          $ctrl->reroute(
            $start.$new,
            $ctrl->post,
            isset($bits[$i + 1]) ? array_slice($bits, $i + 1) : []
          );
        }

        break;
      }
    }
  }
}

/** @var bbn\User\Preferences $pref */
/*
$pref = \bbn\User\Preferences::getInstance();
if ( $perms = $pref->get_existing_permissions($path) ){
  die(var_dump($perms));
}
*/
if ($id_option = $ctrl->inc->perm->is($path)) {
  if (!defined('BBN_ID_PERMISSION')) {
    define('BBN_ID_PERMISSION', $id_option);
  }

  $ctrl->inc->perm->setCurrent($id_option);
  if ($ctrl->inc->perm->has($id_option)) {
    return true;
  }
  elseif ($ctrl->inc->user->isDev()) {
    return false;
  }
  else {
    $ctrl->obj->errorTitle = _("Unauthorized");
    $ctrl->obj->error      = sprintf(_("Sorry but you don't have the permission for %s"), $ctrl->getPath());
  }
}

return $ctrl->inc->user->isDev();
