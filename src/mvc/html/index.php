<?php
use bbn\Str;
use bbn\X;
/**
 * @var string $language    The current Language
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
<html class="no-js" lang="<?= $language ?>">
<head>
<base href="<?= $site_url ?>" target="_self">

<meta charset="utf-8">
<!-- Always force latest IE rendering engine (even in intranet) & Chrome Frame -->
<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
<meta name="author" content="BBN Solutions">
<meta name="Copyright" content="<?= _("All rights reserved.") ?>">
<meta http-equiv="expires" content="Fri, 22 Jul 2002 11:12:01 GMT">
<meta http-equiv="Cache-control" content="private">
<meta http-equiv="cache-control" content="no-store">
<link rel="apple-touch-icon" sizes="57x57" href="<?= $static_path ?>img/favicon/apple-touch-icon-57x57.png">
<link rel="apple-touch-icon" sizes="60x60" href="<?= $static_path ?>img/favicon/apple-touch-icon-60x60.png">
<link rel="apple-touch-icon" sizes="72x72" href="<?= $static_path ?>img/favicon/apple-touch-icon-72x72.png">
<link rel="apple-touch-icon" sizes="76x76" href="<?= $static_path ?>img/favicon/apple-touch-icon-76x76.png">
<link rel="apple-touch-icon" sizes="114x114" href="<?= $static_path ?>img/favicon/apple-touch-icon-114x114.png">
<link rel="apple-touch-icon" sizes="120x120" href="<?= $static_path ?>img/favicon/apple-touch-icon-120x120.png">
<link rel="apple-touch-icon" sizes="144x144" href="<?= $static_path ?>img/favicon/apple-touch-icon-144x144.png">
<link rel="apple-touch-icon" sizes="152x152" href="<?= $static_path ?>img/favicon/apple-touch-icon-152x152.png">
<link rel="apple-touch-icon" sizes="180x180" href="<?= $static_path ?>img/favicon/apple-touch-icon-180x180.png">
<link rel="icon" type="image/png" href="<?= $static_path ?>img/favicon/favicon-32x32.png" sizes="32x32">
<link rel="icon" type="image/png" href="<?= $static_path ?>img/favicon/android-chrome-192x192.png" sizes="192x192">
<link rel="icon" type="image/png" href="<?= $static_path ?>img/favicon/favicon-16x16.png" sizes="16x16">
<?php if (is_file(constant('BBN_PUBLIC') . 'manifest.json')) { ?>
<link rel="manifest" href="manifest.json">
<?php } ?>
<link rel="mask-icon" href="<?= $static_path ?>img/favicon/safari-pinned-tab.svg" color="#5bbad5">
<meta name="msapplication-TileColor" content="#9f00a7">
<meta name="msapplication-TileImage" content="<?= $static_path ?>img/favicon/mstile-144x144.png">
<meta name="theme-color" content="#ffffff">
<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, User-scalable=yes">
<title><?= $site_title ?></title>
<style><?= $custom_css ?></style>
</head>
<body>
<div id="nojs_bbn"
     style="background-color: #fff; position: absolute; width: 100%; height: 100%; top: 0; left: 0">
  <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center">
    <img src="<?= $logo_big ?>"
         style="max-width: 80%; max-height: 100%"
         alt="<?= $site_title ?>"/>
  </div>
  <div id="error_message" style="background-color: #fff; position: absolute; top: 90%; left: 50%; transform: translate(-50%, -50%); text-align: center"></div>
  <div id="loading_message" style="background-color: #fff; position: absolute; top: 90%; left: 50%; transform: translate(-50%, -50%); text-align: center"></div>
</div>
<div class="appui-container"
     style="opacity: 0; transition: opacity 0.5s;">
  <div class="appui">
    <template>
      <bbn-appui bbn-if="ready" 
                :cfg="app"
                :options="options"
                :plugins="plugins"
                def="<?= $default ?>"
                @setimessage="setImessage"
                :source="cfg.list"
                :header="cfg.header"
                :mode="cfg.mode"
                :users="users"
                :routes="cfg.routes"
                :groups="groups"
                :user="user"
                :status="cfg.status"
                :splittable="cfg.splittable"
                :search-bar="cfg.searchBar"
                :browser-notification="cfg.browserNotification"
                :service-worker-active="true"
                :pollable="true"
                @shortcut="addShortcut"
                @route1="init">
    <?php
      if (!empty($slots)) {
        foreach ($slots as $name => $arr) {
          foreach ($arr as $i => $o) {
            ?>
            <component bbn-slot:<?= $name ?>
                      :is="appSlots.<?= $name ?>[<?= $i ?>].cp"
                      :source="appSlots.<?= $name ?>[<?= $i ?>].data">
            </component>
            <?php
          }
        }
      }
    ?>
      </bbn-appui>
    </template>
  </div>
</div>
<noscript>
  <?= $noscript ?? '' ?>
</noscript>
<script>
(async () => {
  "use strict";
  const log = (...args) => {
    for (let i = 0; i < args.length; i++) {
      console.log(args[i]);
    }
  };

  window.addEventListener("error", e => {
    log(e);
  });

  window.addEventListener("unhandledrejection", e => {
    log("unhandled rejection:", e);
  });

  function waitFor(check, timeout = 15000, interval = 20) {
    return new Promise((resolve, reject) => {
      const start = Date.now();

      function tick() {
        try {
          if (check()) {
            resolve();
            return;
          }
        }
        catch (e) {
        }

        if (Date.now() - start >= timeout) {
          reject(new Error("Timeout while waiting for library to be ready"));
          return;
        }

        setTimeout(tick, interval);
      }

      tick();
    });
  }

  function loadScript(url, check, timeout = 15000) {
    return new Promise((resolve, reject) => {
      let script = document.querySelector(`script[src="${url}"]`);

      if (!script) {
        script = document.createElement("script");
        script.src = url;
        script.async = false;
        document.head.appendChild(script);
      }

      let settled = false;

      const finish = (fn, value) => {
        if (settled) {
          return;
        }
        settled = true;
        fn(value);
      };

      if (check && check()) {
        finish(resolve);
        return;
      }

      const timer = setTimeout(() => {
        finish(reject, new Error("Timeout while loading script: " + url));
      }, timeout);

      const cleanup = () => {
        clearTimeout(timer);
        script.removeEventListener("load", onLoad);
        script.removeEventListener("error", onError);
      };

      const onLoad = async () => {
        try {
          if (check) {
            await waitFor(check, timeout);
          }
          cleanup();
          finish(resolve);
        }
        catch (err) {
          cleanup();
          finish(reject, err);
        }
      };

      const onError = () => {
        cleanup();
        finish(reject, new Error("Failed to load script: " + url));
      };

      script.addEventListener("load", onLoad, { once: true });
      script.addEventListener("error", onError, { once: true });

      if (check) {
        waitFor(check, timeout)
          .then(() => {
            cleanup();
            finish(resolve);
          })
          .catch(err => {
            cleanup();
            finish(reject, err);
          });
      }
    });
  }

  async function loadLibraries(items) {
    for (const item of items) {
      if (typeof item === "string") {
        await loadScript(item);
      }
      else {
        await loadScript(item.url, item.check, item.timeout);
      }
    }
  }


  /** @var {String} errorMsg An error message to display */
  let errorMsg;

  /** @var {Boolean} isDev True if dev environment */
  const isDev = <?= $is_dev ? '1' : '0' ?>;

  /** @var {Boolean} hasServiceWorker True if Service Worker available */
  const hasServiceWorker = !!('serviceWorker' in navigator);

  /** @var {String} scriptSrc The script source */
  const scriptSrc = <?= Str::asVar($script_src ?: '') ?>;

  /** @var {Boolean} hasBeenAsked True if it already has been asked to reload because the version is new */
  let hasBeenAsked = false;

  /** @var {Boolean} loaded True after init */
  let loaded = false;

  /** @var {Boolean} DOMLoaded True after DOMContentLoad event */
  let DOMLoaded = false;

  /** @var {Boolean} isReloading True wgen is reloading */
  let isReloading = false;

  const messages = [];

  /** @var {Function} onDomLoaded Loading the libraries through service worker or Ajax */
  const onDomLoaded = () => {
    loaded = true;
    if (hasServiceWorker) {
      navigator.serviceWorker.addEventListener("message", async (event) => {
        log(['received event from SW', event]);
        if (event.data?.type === 'data') {
          document.getElementById('loading_message').innerHTML = bbn._("Receiving data from service worker...");
          const fn = eval(event.data.data.script);
          document.getElementById('loading_message').innerHTML = bbn._("Checking data from servioce worker...");
          await fn(event.data.data);
          init(event.data);
        }
        else if (event.data?.type === 'load') {
          if (event.data?.data?.message) {
            document.getElementById('loading_message').innerHTML = event.data.data.message;
            messages.push(event.data.data.message);
          }
        }
      });
      if (navigator?.serviceWorker?.controller) {
        navigator.serviceWorker.controller.postMessage({data: {giveMeTheData: true}, type: 'data'});
      }
    }
  };

  const init = d => {
    //bbn.fn.log(["DATA FROM INDEX", d, eval(d.script)(d.data), eval(d.data.js_data)(d.data)]);
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
    const data = d.data;
    bbn.env.token = "<?= $token ?>";

    setTimeout(() => {
      if ((navigator.serviceWorker.controller === null) && confirm(
        <?= Str::asVar(_("The application has been updated but you still use an old version.")) ?> + "\n" +
        <?= Str::asVar(_("You need to refresh the page to upgrade.")) ?> + "\n" +
        <?= Str::asVar(_("Do you want to do it now?")) ?>
      ) ){
        isReloading = true;
        location.reload();
      }
    }, 500);
  };

  // Only if service worker is enabled and not already registered
  if (hasServiceWorker) {
    await new Promise(resolve => {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', resolve, { once: true });
      }
      else {
        resolve();
      }
    });

    // 2. Register service worker and wait until it's ready
    try {
      const registration = await navigator.serviceWorker.register('/sw', {type: 'module', scope: '/'});

      // This promise resolves when the active SW is controlling the page
      await navigator.serviceWorker.ready;

      // Optional: you can check if we’re actually controlled
      if (!navigator.serviceWorker.controller) {
        console.warn('Service worker is ready but not controlling this page yet.');
      }
      else {
        registration.onupdatefound = () => {
          const installingWorker = registration.installing;
          installingWorker.onstatechange = () => {
            if (['activated', 'installed'].includes(installingWorker.state)) {
              if (!hasBeenAsked && !isReloading) {
                if (confirm(
                  <?= Str::asVar(_("A new version of the application is available.")) ?> + "\n" +
                  <?= Str::asVar(_("Do you want to refresh now to update?")) ?>
                )) {
                  isReloading = true;
                  location.reload();
                }
                hasBeenAsked = true;
              }
            }
          };
        };
      }
    } catch (err) {
      throw new Error('Service worker registration failed:', err);
    }
  }

  // 3. Load libraries dynamically (after SW is ready)
  loadLibraries([
    {
      url: scriptSrc,
      check: () => !!window.bbn
    }
  ]).then(() => {
    //log("Libraries loaded successfully.");
    onDomLoaded();
  }).catch(err => {
    log("Error loading libraries:", err);
    document.getElementById('error_message').innerHTML = <?= Str::asVar(_("Failed to load the application. Please try again later.")) ?>;
  });
})();
</script>
<script><?= $libscript ?></script>
</body>
</html>
