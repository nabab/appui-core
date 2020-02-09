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
<style><?=$css?></style>
</head>
<body itemscope itemtype="http://schema.org/WebPage">
<div class="appui-login bbn-middle" style="transition: opacity 5s">
  <bbn-popup ref="popup"></bbn-popup>
	<div class="container bbn-h-100" :style="{maxHeight: clientHeight + 'px'}">
		<div class="logo bbn-c bbn-block">
			<img v-if="logo" :src="logo + '?t=1'">
			<img v-else src="data:image/png;base64,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">
			<p v-if="!logo">App-UI</p>
		</div>
		<div class="bbn-vmargin bbn-block bbn-c">
			<bbn-form v-if="!lostPassForm"
								action="index"
								:source="formData"
								:buttons="[]"
								:scrollable="false"
								:fixed-footer="false"
								ref="form"
								@success="submited"
								key="form"
			>
				<bbn-input class="bbn-c bbn-lg"
									 required="required"
									 placeholder="<?=_("e-Mail address")?>"
                   v-model="formData.user"
			  ></bbn-input>
				<bbn-input type="password"
                   class="bbn-c bbn-lg bbn-vsmargin"
                   required="required"
                   placeholder="<?=_("Password")?>"
                   v-model="formData.pass"
        ></bbn-input>
				<div class="bbn-c bbn-vmargin">
					<bbn-button type="button"
											class="bbn-lg"
                      @click="$refs.form.submit()"
					><?=_('Log in')?></bbn-button>
				</div>
			</bbn-form>
			<bbn-form v-else
								:action="core_root + 'login/lost_pass'"
								:source="lostPassFormData"
								:buttons="[]"
								:scrollable="false"
								:fixed-footer="false"
								ref="formLost"
								@success="lostPasssubmited"
								key="formLost"
			>
				<bbn-input class="bbn-c bbn-lg bbn-vsmargin"
									 required="required"
									 placeholder="<?=_("Enter your e-mail address")?>"
                   v-model="lostPassFormData.email"
			  ></bbn-input>
				<div class="bbn-c bbn-vmargin">
					<bbn-button type="button"
											class="bbn-lg"
                      @click="hideLostPassForm"
					><?=_("Cancel")?></bbn-button>
					<bbn-button type="button"
											class="bbn-lg"
                      @click="$refs.formLost.submit()"
					><?=_('Submit')?></bbn-button>
				</div>
			</bbn-form>
			<div v-if="lost_pass && !lostPassForm"
					 class="bbn-c bbn-vsmargin"
			>
				<a class="bbn-p"
					 @click="lostPassForm = true"
				><?=_("Password forgotten?")?></a>
			</div>
		</div>
	</div>
</div>
<script type="text/javascript" src="<?=$shared_path?>?<?=http_build_query([
  'lang' => $lang,
  'lib' => 'nerd-fonts,bbnjs|latest|'.$theme.',bbn-vue,font-awesome',
  'test' => !!$test
])?>"></script>
<?=$script?>
</body>
</html>
