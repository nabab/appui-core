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
<meta name="viewport" content="initial-scale=0.66, User-scalable=no">
<title><?=$site_title?></title>
<style><?=$css?></style>
</head>
<body>
<div class="appui-password bbn-middle" style="transition: opacity 5s; opacity: 0">
  <bbn-popup ref="popup"></bbn-popup>
	<div v-show="ready" class="appui-password-container">
		<div class="appui-password-logo bbn-c bbn-block">
			<img v-if="logo" :src="logo">
      <svg v-else width="100%" height="auto" version="1.1" viewBox="0 0 37.921 30" xmlns="http://www.w3.org/2000/svg">
       <g transform="translate(-52.823 -101.69)">
        <g transform="translate(50.748 97.989)">
         <polygon class="cls-1" transform="matrix(.35714 0 0 .35714 2.0747 3.7019)" points="50.55 78.18 67.27 61.45 50.55 44.73 39.27 56 33.45 50.18 44.73 38.91 22.55 16.73 0 39.27 28 67.27 33.82 61.45" fill="#b3b3b3"/>
         <polygon transform="matrix(.35714 0 0 .35714 2.0747 3.7019)" points="50.55 44.73 39.27 56 33.45 50.18 83.64 0 106.18 22.55 67.27 61.45" fill="#4d4d4d"/>
         <rect transform="rotate(-45)" x="-11.067" y="28.145" width="2.9392" height="8.4499" fill="#4d4d4d" stroke-width=".35714"/>
        </g>
       </g>
      </svg>
      <!--p v-if="!logo">App-UI</p-->
		</div>
    <h3 v-if="username"><?=_('Hello')?> <span v-text="username"></span></h3>
		<div class="bbn-vmargin bbn-block bbn-c">
      <bbn-form v-if="isValidLink"
                action="index"
								:source="formData"
								:buttons="[]"
								:scrollable="false"
								:fixed-footer="false"
								ref="form"
                @success="submited"
                :validation="validation"
      >
        <div class="bbn-grid-fields">
          <label v-if="login"><?=_('Login name')?></label>
          <div v-if="login"
               v-text="login"
               class="bbn-b"
          ></div>
          <label><?=_("Choose your new password")?></label>
          <div>
            <bbn-input :type="passwordVisible ? 'text' : 'password'"
                      v-model="formData.pass1"
                      required="required"
                      pattern=".{8,}"
                      title="<?=_('Mandatory field, 8 characters minimum')?>"
                      :button-right="passwordVisible ? 'nf nf-fa-eye_slash' : 'nf nf-fa-eye'"
                      ref="pass1"
                      @hook:mounted="setEvents('pass1')"
            ></bbn-input>
          </div>
          <label><?=_("Confirm your new password")?></label>
          <div>
            <bbn-input :type="passwordVisible ? 'text' : 'password'"
                      v-model="formData.pass2"
                      required="required"
                      pattern=".{8,}"
                      title="<?=_('Mandatory field, 8 characters minimum')?>"
                      :button-right="passwordVisible ? 'nf nf-fa-eye_slash' : 'nf nf-fa-eye'"
                      ref="pass2"
                      @hook:mounted="setEvents('pass2')"
            ></bbn-input>
          </div>
          <div class="bbn-grid-full bbn-c bbn-margin">
            <bbn-button :disabled="submitDisabled"
                        @click="$refs.form.submit()"
            ><?=_('Reset')?></bbn-button>
          </div>
        </div>
      </bbn-form>
      <h3 class="bbn-c" v-else>
        <?=_("The link is not valid")?><br><br>
        <a href="<?=$site_url?>" class="bbn-no"><?=_("Back to the home page")?></a>
      </h3>
    </div>
  </div>
</div>
<script type="text/javascript" src="<?=$shared_path?>?<?=http_build_query([
  'lang' => $lang,
  'lib' => 'nerd-fonts,bbn-css|latest|'.$theme.',bbn-vue',
  'test' => !!$test
])?>"></script>
<?=$script?>
</body>
</html>