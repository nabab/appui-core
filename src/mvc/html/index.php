<!DOCTYPE html>
<!--[if lt IE 7 ]> <html class="ie ie6 no-js" lang="en"> <![endif]-->
<!--[if IE 7 ]>    <html class="ie ie7 no-js" lang="en"> <![endif]-->
<!--[if IE 8 ]>    <html class="ie ie8 no-js" lang="en"> <![endif]-->
<!--[if IE 9 ]>    <html class="ie ie9 no-js" lang="en"> <![endif]-->
<!--[if gt IE 9]><!--><html class="no-js" lang="fr"><!--<![endif]-->
<head>
  <base href="<?=$site_url?>" target="_self">

  <meta charset="utf-8">
  <!-- Always force latest IE rendering engine (even in intranet) & Chrome Frame -->
  <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1">
  <meta name="author" content="BBN Solutions">
  <meta name="Copyright" content="<?=_("Tous droits réservés.")?>">
  <!-- <meta http-equiv="cache-control" content="no-cache"> -->
  <meta http-equiv="cache-control" content="no-store">
  <link rel="apple-touch-icon" sizes="57x57" href="apple-touch-icon-57x57.png">
  <link rel="apple-touch-icon" sizes="60x60" href="apple-touch-icon-60x60.png">
  <link rel="apple-touch-icon" sizes="72x72" href="apple-touch-icon-72x72.png">
  <link rel="apple-touch-icon" sizes="76x76" href="apple-touch-icon-76x76.png">
  <link rel="apple-touch-icon" sizes="114x114" href="apple-touch-icon-114x114.png">
  <link rel="apple-touch-icon" sizes="120x120" href="apple-touch-icon-120x120.png">
  <link rel="apple-touch-icon" sizes="144x144" href="apple-touch-icon-144x144.png">
  <link rel="apple-touch-icon" sizes="152x152" href="apple-touch-icon-152x152.png">
  <link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon-180x180.png">
  <link rel="icon" type="image/png" href="favicon-32x32.png" sizes="32x32">
  <link rel="icon" type="image/png" href="android-chrome-192x192.png" sizes="192x192">
  <link rel="icon" type="image/png" href="favicon-16x16.png" sizes="16x16">
  <link rel="manifest" href="manifest.json">
  <link rel="mask-icon" href="safari-pinned-tab.svg" color="#5bbad5">
  <meta name="msapplication-TileColor" content="#9f00a7">
  <meta name="msapplication-TileImage" content="mstile-144x144.png">
  <meta name="theme-color" content="#ffffff">
  <title><?=$site_title?></title>
  <style>
    html{
      width: 100%;
      height: 100%;
      font-family: Sans-Serif;
    }
    body{
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
      border: 0;
      overflow: hidden;
    }
    #appui{
      box-sizing: border-box;
    }
  </style>
</head>
<body>
<div id="appui" class="bbn-full-screen" style="width: 100%; height: 100%; opacity: 0;">
  <bbn-splitter orientation="vertical" ref="splitter" v-if="isMounted">
    <div style="height: 50px; overflow: visible" scrollable="false" ref="head">
      <div class="k-header bbn-w-100 bbn-h-100 bbn-flex-width">
        <div class="bbn-block bbn-h-100 bbn-middle bbn-menu-button-container" style="width: 70px">
          <bbn-menu-button v-if="menuMounted"
                           class="bbn-xxxl"
                           menu="$root.$refs.menu"
          ></bbn-menu-button>
        </div>
        <div class="bbn-block bbn-h-100 bbn-vmiddle" style="width: 70px">
          <div class="bbn-global-search bbn-vmiddle bbn-lg">
            <bbn-autocomplete id="recherche"
                              :delay="500"
                              source-text="nom"
                              source-value="id"
                              :clear-button="false"
                              :suggest="true"
                              source="adherents"
                              ref="search"
                              placeholder="?"
                              v-model="search"
                              @focus="focusSearch"
                              @blur="blurSearch"
                              @change="selectSearch"
                              :min-length="1"
                              :template="tplSearch"
                              style="z-index: 10"
            ></bbn-autocomplete>
            <bbn-button icon="fa fa-search" @click="$refs.search.$refs.element.focus()"></bbn-button>
          </div>
        </div>
        <div class="bbn-h-100 bbn-splitter-top-center bbn-flex-fill">
          <bbn-fisheye v-model="shortcuts"
                       del-url="menu/shortcuts/delete"
                       ins-url="menu/shortcuts/insert"
                       :min-index="3"
                       :z-index="3"
                       ref="fisheye"
          @mounted="fisheyeMounted = true"></bbn-fisheye>
        </div>
        <div class="bbn-block bbn-h-100 bbn-logo-container" style="width: 140px">
          <div class="bbn-block apst-logo bbn-100">
            <img src="<?=$static_path?>img/logo.png" border="0" class="bbn-h-90">
          </div>
        </div>
        <div v-if="debug"
             class="k-widget"
             :style="{
               position: 'absolute',
               top: '0px',
               right: '0px',
               width: isOverDebug ? 'auto' : '200px',
               height: isOverDebug ? 'auto' : '200px',
               minWidth: '200px',
               minHeight: '200px',
               maxWidth: '200px',
               maxHeight: 'px',
               overflow: isOverDebug ? 'auto' : 'hidden'
             }"
             @mouseenter="isOverDebug = true"
             @mouseleave="isOverDebug = false"
        >
          <h2>Debug...</h2>
        </div>
      </div>
    </div>
    <div ref="main">
      <bbn-tabnav :autoload="true" :source="list" ref="tabnav"></bbn-tabnav>
    </div>
    <div style="height: 25px" scrollable="false" ref="foot" class="k-header ">
      <bbn-loading ref="loading" style="position: absolute; top: 0px; right: 1em; width: 30%; min-width: 300px"></bbn-loading>
    </div>
  </bbn-splitter>
  <bbn-treemenu source="menu/data"
                v-if="fisheyeMounted"
                ref="menu"
                :menus="menus"
                :current="currentMenu"
                :top="50"
                style="width: 350px"
                :shortcuts="$refs.fisheye"
                @mounted="menuMounted = true"
  ></bbn-treemenu>
  <bbn-popup :source="popups" ref="popup" :z-index="14"></bbn-popup>
  <bbn-notification ref="notification"></bbn-notification>
  <bbn-vlist v-for="(li, idx) in vlist"
             :key="idx"
             :left="li.left"
             :top="li.top"
             :right="li.right"
             :bottom="li.bottom"
             @close="vlist.splice(idx, 1)"
             :source="li.items"
             :unique="li.unique ? true : false"
  ></bbn-vlist>
  <div class="w3-sidebar w3-bar-block w3-card w3-animate-right"
       style="display:none; width: 50%; right:0; z-index: 1000"
       id="rightMenu">
    <button onclick="$(this).parent().hide()" class="w3-bar-item w3-button w3-large">Close &times;</button>
    <a href="#" class="w3-bar-item w3-button">Link 1</a>
    <a href="#" class="w3-bar-item w3-button">Link 2</a>
    <a href="#" class="w3-bar-item w3-button">Link 3</a>
  </div>
</div>
<script type="text/javascript" src="<?=$shared_path?>?<?=http_build_query([
  'lang' => 'fr',
  'lib' => 'w3-css,kendo-ui|latest|'.$theme.',bbn-vue,font-awesome,font-mfizz,devicon,webmin-font,material-design-iconic-font,jquery-jsoneditor,line-awesome',
  'test' => !!$test,
  'dirs' => 'APST-UI/css'
])?>"></script>
<?=$script?>
</body>
</html>