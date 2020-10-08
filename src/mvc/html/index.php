<!DOCTYPE html>
<!--[if lt IE 7 ]> <html class="ie ie6 no-js" lang="<?=$lang?>"> <![endif]-->
<!--[if IE 7 ]>    <html class="ie ie7 no-js" lang="<?=$lang?>"> <![endif]-->
<!--[if IE 8 ]>    <html class="ie ie8 no-js" lang="<?=$lang?>"> <![endif]-->
<!--[if IE 9 ]>    <html class="ie ie9 no-js" lang="<?=$lang?>"> <![endif]-->
<!--[if gt IE 9]><!--><html class="no-js" lang="<?=$lang?>"><!--<![endif]-->
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
<link rel="manifest" href="manifest.json">
<link rel="mask-icon" href="<?=$static_path?>img/favicon/safari-pinned-tab.svg" color="#5bbad5">
<meta name="msapplication-TileColor" content="#9f00a7">
<meta name="msapplication-TileImage" content="<?=$static_path?>img/favicon/mstile-144x144.png">
<meta name="theme-color" content="#ffffff">
<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, user-scalable=yes">
<title><?=$site_title?></title>
<style><?=$custom_css?></style>
<script>
(() => {
  let errorMsg,
      isDev = <?=$is_dev ? '1' : '0'?>;
      isDev = 0;
  if (isDev || !('serviceWorker' in navigator) ){
    // Alternative method
    document.addEventListener('DOMContentLoaded', () => {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "<?=$script_src?>";
      script.onload = function(){
        if ( 'bbn' in window ){
          if ( bbn.fn.isMobile() ){
            document.body.classList.add('bbn-mobile');
            if ( bbn.fn.isTabletDevice() ){
              document.body.classList.add('bbn-tablet');
            }
          }
          bbn.fn.post('<?=$plugins['appui-core']?>/index', {get: 1}, d => {
            document.getElementById('nojs_bbn').remove();
            document.querySelectorAll('.appui')[0].style.display = 'block';
            if ( d.data.version ){
              bbn.vue.version = d.data.version;
              window.localStorage.setItem('bbn-vue-version', bbn.vue.version);
            }
            let res = eval(d.script);
            if ( bbn.fn.isFunction(res) ){
              res(d.data);
            }
          })
        }
        else{
          let attempts = window.localStorage.getItem('bbn-load') || 0;
          if ( attempts < 3 ){
            window.localStorage.setItem('bbn-load', ++attempts);
            location.reload();
          }
        }
      };
      script.onerror = function(){
        console.log("Problem")
      };
      document.getElementsByTagName("head")[0].appendChild(script);
    });
  }
  else if ( !('AbortController' in window) ){
    errorMsg = <?=\bbn\str::as_var(_("You need to have abort controller support in your browser, please update or use another browser"))?>;
  }
  else{
    let hasBeenAsked = false;
    let loaded = false;
    let isReloading = false;
    navigator.serviceWorker.register('/sw', {scope: '/'})
    .then((registration) => {
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          console.log("NEW STATE: " + installingWorker.state);
          if (!hasBeenAsked && !isReloading && ['activated', 'installed'].includes(installingWorker.state)) {
            hasBeenAsked = true;
            if ( 'appui' in window ){
              if ( confirm(
                <?=\bbn\str::as_var(_("The application has been updated but you still use an old version."))?> + "\n" +
                <?=\bbn\str::as_var(_("You need to refresh the page to upgrade."))?> + "\n" +
                <?=\bbn\str::as_var(_("Do you want to do it now?"))?>
              ) ){
                isReloading = true;
                location.reload();
              }
            }
            else{
              isReloading = true;
              location.reload();
            }
          }
          else if ( 'appui' in window ){
            let v = window.localStorage.getItem('bbn-vue-version');
            bbn.fn.log(<?=\bbn\str::as_var(_("POLLING FROM SERVICE WORKER VERSION"))?> + ' ' + v);
            appui.poll();
          }
        };
      };
      console.log(<?=\bbn\str::as_var(_("Registration successful, scope is"))?>, registration.scope);
      console.log(registration);
    })
    .catch((error) => {
      console.log(<?=\bbn\str::as_var(_("Service worker registration failed, error"))?>, error);
    });
    document.addEventListener('DOMContentLoaded', () => {
      let script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "<?=$script_src?>";
      script.onload = function(){
        if ( ('bbn' in window) && navigator.serviceWorker.controller ){
          if ( bbn.fn.isMobile() ){
            document.body.classList.add('bbn-mobile');
            if ( bbn.fn.isTabletDevice() ){
              document.body.classList.add('bbn-tablet');
            }
          }
          navigator.serviceWorker.addEventListener('message', function(event) {
            if ( event.data && event.data.data ){
              let d = event.data;
              if ( d.type === 'init' ){
                document.getElementById('nojs_bbn').remove();
                document.querySelectorAll('.appui')[0].style.display = 'block';
                if ( d.data.version ){
                  bbn.vue.version = d.data.version;
                  window.localStorage.setItem('bbn-vue-version', bbn.vue.version);
                }
                let res = eval(d.data.script);
                if ( bbn.fn.isFunction(res) ){
                  res(d.data);
                  loaded = true;
                }
              }
              else if ( 'appui' in window ){
                let v = window.localStorage.getItem('bbn-vue-version');
                appui.receive(d.data);
              }
            }
          });
          navigator.serviceWorker.controller.postMessage({type: "init"})
        }
        else{
          let attempts = window.localStorage.getItem('bbn-load') || 0;
          if ( attempts < 3 ){
            window.localStorage.setItem('bbn-load', ++attempts);
            location.reload();
          }
        }
      };
      script.onerror = function(){
        console.log("Problem")
      };
      document.getElementsByTagName("head")[0].appendChild(script);
    });
  }
  if ( errorMsg ){
    document.addEventListener('DOMContentLoaded', () => {
      document.getElementById('error_message').innerHTML = errorMsg + '<br><br>' + 
      '<a href="https://vivaldi.com/download/">Vivaldi Browser</a>';
    });
  }
})();
</script>
</head>
<body>
<div id="nojs_bbn"
     style="background: #fff url(<?=$static_path?>/img/logo_big.png) no-repeat center">
  <div id="error_message"></div>
</div>
<div class="appui">
  <bbn-appui :cfg="app"
             :options="options"
             :menus="menus"
             :current-menu="currentMenu"
             :shortcuts="shortcuts"
             :plugins="plugins"
             @setimessage="setImessage"
             :source="list"
             :search-bar="searchBar"
  >
  </bbn-appui>
</div>
</body>
</html>
