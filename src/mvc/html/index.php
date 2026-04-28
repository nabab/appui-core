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
<meta name="theme-color" content="#ffffff">
<meta name="viewport" content="width=device-width, height=device-height, initial-scale=1.0, User-scalable=yes">
<script type="module">
import AppuiInstaller from '/static/lib/appui-core/AppuiInstaller.js';
document.addEventListener("DOMContentLoaded", async () => {
  const installer = new AppuiInstaller();
  await installer.setUp();
});
</script>
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
<noscript>
  <?= $noscript ?? '' ?>
</noscript>
</body>
</html>
