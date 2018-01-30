<?php
/**
 * Created by PhpStorm.
 * User: BBN
 * Date: 25/11/2017
 * Time: 06:24
 */

$theme = $ctrl->inc->user->get_session('theme');
if ( !$theme ){
  $theme = 'default';
}
$is_admin = $ctrl->inc->user->is_admin();
$mgr = new \apst\manager($ctrl->inc->user);
$menu = new \bbn\appui\menus();
$current_menu = $menu->get_option_id('default', 'menus');
$ctrl->data = [
  'version' => '20170118',
  'site_url' => BBN_URL,
  'site_title' => 'Intranet APST',
  'is_dev' => (bool)BBN_IS_DEV,
  'is_prod' => (bool)BBN_IS_PROD,
  'is_test' => (bool)BBN_IS_TEST,
  'shared_path' => BBN_SHARED_PATH,
  'static_path' => BBN_STATIC_PATH,
  'test' => BBN_IS_DEV ? 1 : 0,
  'year' => date('Y'),
  'is_bootstrap' => $theme === 'bootstrap',
  'is_material' => ($theme === 'material') || ($theme === 'materialblack'),
  'theme' => $theme,
  'ide_theme' => $ctrl->inc->session->get('ide_theme') ?: false,
  'user_id' => $ctrl->inc->user->get_id(),
  'group_id' => $ctrl->inc->user->get_group(),
  'users' => $mgr->full_list(),
  'groups' => $mgr->groups(),
  'menus' => $is_admin ? $menu->get_options_menus() : [],
  'current_menu' => $current_menu,
  'is_admin' => $is_admin,
  'shortcuts' => $ctrl->get_model($ctrl->plugin_url('appui-menu').'/shortcuts/list'),
  'root' => APPUI_CORE_ROOT
];
/** @todo Put this in javascript in adherent (default config) */
if ( !($tmp = $ctrl->inc->user->get_cfg('pdf_cfg')) ){
  $tmp = [
    "infos" => true,
    "actionnariat" => true,
    "succursales" => true,
    "marques" => true,
    "cgar" => true,
    "pad" => true,
    "finances" => true,
  ];
  $ctrl->inc->user->set_cfg(['pdf_cfg' => $tmp])->save_cfg();
}
$ctrl->data['pdf_cfg'] = $tmp;
$ctrl->combo("Intranet APST", true);
/*
echo "HELLO hey";
$items = $ctrl->inc->options->items($ctrl->inc->options->get_root());
\bbn\x::hdump(\bbn\str::is_uid($ctrl->inc->options->get_root()));
\bbn\x::hdump(\bbn\str::is_uid($ctrl->inc->options->get_default()));
\bbn\x::hdump(bin2hex($ctrl->inc->options->get_root()));
\bbn\x::hdump(bin2hex($ctrl->inc->options->get_default()));
\bbn\x::hdump(count($ctrl->inc->options->native_option($ctrl->inc->options->get_root())));
\bbn\x::hdump(count($items));
\bbn\x::hdump(\bbn\x::convert_uids($items));
\bbn\x::hdump(\bbn\x::convert_uids($ctrl->inc->options->full_options($items[0])));
*/