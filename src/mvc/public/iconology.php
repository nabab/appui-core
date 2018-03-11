<?php
/** @var $ctrl \bbn\mvc\controller */
$ctrl->data = $ctrl->get_model();
if ( !empty($ctrl->arguments) && ($ctrl->arguments[0] === 'iconpicker') ){
  if ( !empty($ctrl->data) ){
    $res = [
      'icons' => [],
      'total' => 0
    ];
    $libraries = [
      'faicons' => 'fa fa-',
      'material' => 'zmdi zmdi-',
      'mficons' => 'icon-'
    ];
    $merge_icons = function($lib, $icons) use(&$res){
      $res['icons'] = \bbn\x::merge_arrays($res['icons'], array_map(function($i) use($lib){
        return $lib.$i;
      }, $icons));
    };
    unset($ctrl->data['total']);
    foreach ( $ctrl->data as $lib => $icons ){
      $cl = $libraries[$lib];
      if ( is_array($icons[0]) && isset($icons[0]['icons']) ){
        foreach ( $icons as $ic ){
          $merge_icons($cl, $ic['icons']);
        }
      }
      else {
        $merge_icons($cl, $icons);
      }
    }
    $res['total'] = count($res['icons']);
    $ctrl->obj->success = true;
    $ctrl->obj->data = $res;
  }
}
else {
  /** @todo to change it */
  $ctrl->data['picker'] = (!empty($ctrl->arguments) && ($ctrl->arguments[0] === 'picker'));
  echo $ctrl
    ->set_title($ctrl->data['picker'] ? "Icon picker" : "Iconology")
    ->set_color('purple', 'white')
    ->set_icon('fa fa-image')
    ->add_js(['picker' => $ctrl->data['picker']])
    ->get_view();
}