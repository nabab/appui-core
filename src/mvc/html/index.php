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
  <meta name="Copyright" content="<?=_("Tous droits réservés.")?>">
  <!-- <meta http-equiv="cache-control" content="no-cache"> -->
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
  <link rel="manifest" href="<?=$static_path?>img/favicon/manifest.json">
  <link rel="mask-icon" href="<?=$static_path?>img/favicon/safari-pinned-tab.svg" color="#5bbad5">
  <meta name="msapplication-TileColor" content="#9f00a7">
  <meta name="msapplication-TileImage" content="<?=$static_path?>img/favicon/mstile-144x144.png">
  <meta name="theme-color" content="#ffffff">
  <meta name="viewport" content="initial-scale=0.66, user-scalable=no">
  <title><?=$site_title?></title>
</head>
<body>
<div class="appui bbn-full-screen" style="width: 100%; height: 100%">
  <bbn-appui :cfg="app"
             :root="root"
             :options="options"
             :observer="true"
             :menus="menus"
             :current-menu="currentMenu"
             :shortcuts="shortcuts"
             :plugins="plugins"
             :logo-path="logo"
             :left-shortcuts="leftShortcuts"
             :right-shortcuts="rightShortcuts"
             @setimessage="setImessage"
             :list="list"
             :search-bar="searchBar"
  >
  </bbn-appui>
</div>
<script type="text/javascript" src="<?=$shared_path?>?<?=http_build_query([
  'lang' => $lang,
  'lib' => 'w3-css,bbnjs,kendo-ui-core|latest|'.$theme.',bbn-vue,font-awesome,font-mfizz,devicon,webmin-font,material-design-iconic-font,jquery-jsoneditor,jsPDF',
  'test' => !!$test,
  'dirs' => $cdn_dirs ?? ''
])?>"></script>
<?=$script?>
</body>
</html>
