<?php
/**
 * @var string $lang        The current Language
 * @var string $site_url    The website's URL
 * @var string $static_path The URL to the static libraries
 * @var string $site_title  The website's title
 * @var string $custom_css  A CSS stylesheet URL
 * @var string $is_dev      True if environment is dev
 * @var string $script_src  The URL of the script which will call all the libraries
 * @var string $plugins     Array of the plugins in use
 * @var string $token       A token
 * @var string $noscript    Some text to show if noscript
 */

?><!DOCTYPE html>
<html class="no-js" lang="<?=$lang?>">
<head>
<base href="<?=$site_url?>" target="_self">

<meta charset="utf-8">
<!-- Always force latest IE rendering engine (even in intranet) & Chrome Frame -->
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="author" content="BBN Solutions">
<meta name="Copyright" content="<?=_("All rights reserved.")?>">
<meta http-equiv="expires" content="Fri, 22 Jul 2002 11:12:01 GMT">
<meta http-equiv="Cache-control" content="private">
<meta http-equiv="cache-control" content="no-store">
<link rel="apple-touch-icon" sizes="57x57" href="<?=$static_path?>img/favicon/apple-touch-icon-57x57.png">
<link rel="apple-touch-icon" sizes="60x60" href="<?=$static_path?>img/favicon/apple-touch-icon-60x60.png">
<link rel="apple-touch-icon" sizes="72x72" href="<?=$static_path?>img/favicon/apple-touch-icon-72x72.png">
<link rel="apple-touch-icon" sizes="76x76" href="<?=$static_path?>img/favicon/apple-touch-icon-76x76.png">
<link rel="apple-touch-icon" sizes="114x114" href="<?=$static_path?>img/favicon/apple-touch-icon-114x114.png">
<link rel="apple-touch-icon" sizes="120x120" href="<?=$static_path?>img/favicon/apple-touch-icon-120x120.png">
<link rel="apple-touch-icon" sizes="144x144" href="<?=$static_path?>img/favicon/apple-touch-icon-144x144.png">
<link rel="apple-touch-icon" sizes="152x152" href="<?=$static_path?>img/favicon/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="<?=$static_path?>img/favicon/apple-touch-icon-180x180.png">
<link rel="icon" type="image/png" href="<?=$static_path?>img/favicon/favicon-32x32.png" sizes="32x32">
<link rel="icon" type="image/png" href="<?=$static_path?>img/favicon/android-chrome-192x192.png" sizes="192x192">
<link rel="icon" type="image/png" href="<?=$static_path?>img/favicon/favicon-16x16.png" sizes="16x16">
<?php if (is_file(BBN_PUBLIC . 'manifest.json')) { ?>
<link rel="manifest" href="manifest.json">
<?php } ?>
<link rel="mask-icon" href="<?=$static_path?>img/favicon/safari-pinned-tab.svg" color="#5bbad5">
<meta name="msapplication-TileColor" content="#9f00a7">
<meta name="msapplication-TileImage" content="<?=$static_path?>img/favicon/mstile-144x144.png">
<meta name="theme-color" content="#ffffff">
<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, User-scalable=yes">
<title><?=$site_title?></title>
<style><?=$custom_css?></style>
<script type="text/javascript" src="<?= $script_src ?>"></script>
<script>
(() => {
  /** @var {String} errorMsg An error message to display */
  let errorMsg;

  /** @var {Boolean} isDev True if dev environment */
  const isDev = <?=$is_dev ? '1' : '0'?>;

  /** @var {Boolean} hasServiceWorker True if Service Worker available */
  const hasServiceWorker = !!('serviceWorker' in navigator);

  /** @var {String} scriptSrc The script source */
  const scriptSrc = <?=Str::asVar($script_src ?: '')?>;

  /** @var {Boolean} hasBeenAsked True if it already has been asked to reload because the version is new */
  let hasBeenAsked = false;

  /** @var {Boolean} loaded True after init */
  let loaded = false;

  /** @var {Boolean} DOMLoaded True after DOMContentLoad event */
  let DOMLoaded = false;

  /** @var {Boolean} isReloading True wgen is reloading */
  let isReloading = false;

  /** @var {Function} onDomLoaded Loading the libraries through service worker or Ajax */
  let onDomLoaded = () => {
    loaded = true;
    // Check that bbn is defined
    bbn.fn.post('<?=$plugins['appui-core']?>/index', {get: 1}, init);
    // If bbn is not defined we reload the window
  };
  /*
  let onDomLoaded = () => {
    loaded = true;
    // Check that bbn is defined
    if ('bbn' in window) {
      if (bbn.fn.isMobile()) {
        document.body.classList.add('bbn-mobile');
        if ( bbn.fn.isTabletDevice() ){
          document.body.classList.add('bbn-tablet');
        }
      }
      // Init phase
      // through service worker
      if (hasServiceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.addEventListener('message', function(event) {
          if ( event.data && event.data.data ){
            let d = event.data;
            if ( d.type === 'init' ){
              init(d.data);
            }
            else if ('appui' in window){
              let v = window.localStorage.getItem('bbn.cp-version');
              appui.receive(d);
            }
          }
        });
        bbn.fn.post('<?=$plugins['appui-core']?>/index', {get: 1}, d => {
          navigator.serviceWorker.controller.postMessage({type: "init", token: "<?=$token?>", data: d});
        });
      }
      // Through Ajax
      else {
        bbn.fn.post('<?=$plugins['appui-core']?>/index', {get: 1}, init);
      }
    }
    // If bbn is not defined we reload the window
    else {
      let attempts = window.localStorage.getItem('bbn-load') || 0;
      // and avoid to do it more than 3 times
      if ( attempts < 3 ){
        window.localStorage.setItem('bbn-load', ++attempts);
        alert("RELOADING??");
        location.reload();
      }
    }
  };
  */

  let init = (d) => {
    //bbn.fn.warning("INIT");
    //bbn.fn.log(d)
    //document.getElementById('nojs_bbn').remove();
    //document.querySelectorAll('.appui')[0].style.display = 'block';
    if ( d.data && d.data.version ){
      bbn.cp.version = d.data.version;
      let userOnStorage = window.localStorage.getItem('bbn-user-id');
      if (d.data.app
        && d.data.app.user
        && d.data.app.user.id
        && (userOnStorage !== d.data.app.user.id)
      ){
        window.localStorage.clear();
        window.localStorage.setItem('bbn-user-id', d.data.app.user.id);
      }
      window.localStorage.setItem('bbn.cp-version', bbn.cp.version);
      bbn.version = d.data.version;
    }

    let res = {};
    if (d.script) {
      res = eval(d.script);
    }
    else if (d.data && d.data.script) {
      res = eval(d.data.script);
    }

    if (bbn.fn.isFunction(res)) {
      res(d.data || {});
      bbn.env.token = "<?=$token?>";
    }
  };

  // Only if service worker is enabled and not already registered
  if (hasServiceWorker) {
    // Registration of the service worker
    navigator.serviceWorker.register('/sw', {scope: '/'})
    .then((registration) => {
      window.bbnSW = registration;
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        console.log("SW: STATE CHANGING " + installingWorker.state);
        installingWorker.onstatechange = () => {
          if (!hasBeenAsked
            && !isReloading
            && ['activated', 'installed'].includes(installingWorker.state)
          ) {
            if (('appui' in window)) {
              hasBeenAsked = true;
              if ( confirm(
                <?=Str::asVar(_("The application has been updated but you still use an old version."))?> + "\n" +
                <?=Str::asVar(_("You need to refresh the page to upgrade."))?> + "\n" +
                <?=Str::asVar(_("Do you want to do it now?"))?>
              ) ){
                isReloading = true;
                location.reload();
              }
            }
            else if ((installingWorker.state === 'activated') && !loaded) {
              if (!DOMLoaded) {
                document.addEventListener('DOMContentLoaded', onDomLoaded)
              }
              else {
                onDomLoaded();
              }
            }
          }
          else if ('appui' in window) {
            let v = window.localStorage.getItem('bbn.cp-version');
            console.log(<?=Str::asVar(_("POLLING FROM SERVICE WORKER VERSION"))?> + ' ' + v);
            appui.poll();
          }
        };
      };
      if (navigator.serviceWorker.controller && !loaded) {
        if (!DOMLoaded) {
          document.addEventListener('DOMContentLoaded', onDomLoaded)
        }
        else {
          onDomLoaded();
        }
      }
    })
    .catch((error) => {
      console.log(<?=Str::asVar(_("Service worker registration failed, error"))?>, error);
    });
  }
  else {
    // Adding the function onDOMContentLoaded
    document.addEventListener('DOMContentLoaded', onDomLoaded);
  }
  document.addEventListener('DOMContentLoaded', () => {
    DOMLoaded = true;
  });
})();
</script>
</head>
<body>
<div id="nojs_bbn"
     style="background: #fff url(<?= $logo_big ?>) no-repeat center; position: absolute; width: 100%; height: 100%; top: 0; left: 0">
  <div id="error_message"></div>
</div>
<div class="appui-container"
     style="opacity: 0;">
  <div class="appui">
    <bbn-appui :cfg="app"
              :options="options"
              :plugins="plugins"
              def="home"
              @setimessage="setImessage"
              :source="list"
              :splittable="true"
              :nav="true"
              :header="true"
              :search-bar="searchBar"
              :browser-notification="browserNotification"
              @route1="init"
              :status="true">
  <?php
    if (!empty($slots)) {
      foreach ($slots as $name => $arr) {
        foreach ($arr as $i => $o) {
          ?>
          <component slot="<?= $name ?>"
                    :is="slots.<?= $name ?>[<?= $i ?>].cp"
                    :source="slots.<?= $name ?>[<?= $i ?>].data">
          </component>
          <?php
        }
      }
    }
  ?>
    </bbn-appui>
  </div>
</div>
<noscript>
  <?= $noscript ?? '' ?>
</noscript>
</body>
</html>
