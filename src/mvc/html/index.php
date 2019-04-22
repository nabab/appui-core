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
  <link rel="manifest" href="<?=$static_path?>manifest.json">
  <link rel="mask-icon" href="<?=$static_path?>img/favicon/safari-pinned-tab.svg" color="#5bbad5">
  <meta name="msapplication-TileColor" content="#9f00a7">
  <meta name="msapplication-TileImage" content="<?=$static_path?>img/favicon/mstile-144x144.png">
  <meta name="theme-color" content="#ffffff">
  <meta name="viewport" content="initial-scale=0.66, user-scalable=no">
  <title><?=$site_title?></title>
  <script>
var errorMsg;
if ( !('serviceWorker' in navigator) ){
  errorMsg = "You need to have service workers support in your browser, please update or use another browser";
}
else if ( !('AbortController' in window) ){
  errorMsg = "You need to have abort controller support in your browser, please update or use another browser";
}
else{
  let loaded = false;
  navigator.serviceWorker.register('/sw', {scope: '/'})
  .then((registration) => {
    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      installingWorker.onstatechange = () => {
        console.log("NEW STATE: " + installingWorker.state);
        if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // Preferably, display a message asking the user to reload...
          if ( !loaded ){
            location.reload();
          }
          else{
            console.log("New SW version !");
            if ( window.appui ){
              appui.poll();
            }
          }
        }
        else if ( 'appui' in window ){
          appui.poll();
        }
      };
    };
    console.log('Registration successful, scope is:', registration.scope);
    console.log(registration);
  })
  .catch((error) => {
    console.log('Service worker registration failed, error:', error);
  });
  document.addEventListener('DOMContentLoaded', () => {
    let script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "<?=$script_src?>";
    script.onload = function(){
      if ( window.bbn && navigator.serviceWorker.controller ){
        bbn.fn.log("POSTING INIT");
        navigator.serviceWorker.addEventListener('message', function(event) {
          if ( event.data && event.data.data ){
            let d = event.data;
            if ( d.type === 'init' ){
              document.getElementById('nojs_bbn').remove();
              document.querySelectorAll('.appui')[0].style.display = 'block';
              if ( d.data.version ){
                bbn.version = d.data.version;
              }
              let res = eval(d.data.script);
              if ( bbn.fn.isFunction(res) ){
                res(d.data);
                loaded = true;
              }
            }
            else if ( 'appui' in window ){
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
    document.getElementById('error_message').innerHTML = errorMsg;
  });
}
</script>
</head>
<body>
<div id="nojs_bbn" style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; background: #fff url(<?=$static_path?>/img/logo_big.png) no-repeat center">
  <div id="error_message" style="text-align:center; font-size: large"></div>
</div>
<div class="appui"
     style="position: absolute; top: 0; left: 0; bottom: 0; right: 0; background-color: #EEE;display: none">
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
