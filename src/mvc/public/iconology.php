<?php
/** @var $ctrl \bbn\mvc\controller */
/*$ctrl->data = $ctrl->get_model();


if ( empty($ctrl->arguments) &&
    (!empty($ctrl->arguments) && ($ctrl->arguments[0] === 'iconpicker'))
  ){

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
    //function
    $merge_icons = function($lib, $icons) use(&$res){

        $res['icons'] = \bbn\x::merge_arrays($res['icons'], array_map(function($i) use($lib){
          return $lib.$i;
        }, $icons));

    };

    unset($ctrl->data['total']);

    foreach ( $ctrl->data as $lib => $icons ){
      $cl = $libraries[$lib];
      if( $lib === 'faicons' ){
        $res['icons'] = array_merge($res['icons'], $icons);
      }
      else{
        //case mficons
        if ( is_array($icons[0]) && isset($icons[0]['icons']) ){
          foreach ( $icons as $ic ){
            $merge_icons($cl, $ic['icons']);
          }
        }
        else {
          $merge_icons($cl, $icons);
        }
      }
    }

    $res['total'] = count($res['icons']);
    $ctrl->obj->success = true;
    $ctrl->obj->data = $res;
  }
}
else {
  /** @todo to change it */
  //die(var_dump($ctrl->data));
  //$ctrl->data['picker'] = (!empty($ctrl->arguments) && ($ctrl->arguments[0] === 'picker'));
/*
  echo $ctrl
    ->set_color('purple', 'white')
    ->set_icon('fas fa-image')
    ->combo(($ctrl->data['picker'] ? "Icon picker" : "Iconology"), true);
}
*/


$ctrl->data = $ctrl->get_model();

$res = [
  'icons' => [],
  'total' => 0
];
//for the multitude of different prefixes adopted by faicons we proceeded to insert them directly in the list of the model
$libraries = [
  'material' => 'zmdi zmdi-',
  'mficons' => 'icon-'
];

if ( !empty($ctrl->data) ){
  //function
  $merge_icons = function($lib, $icons) use(&$res){
    $res['icons'] = \bbn\x::merge_arrays($res['icons'], array_map(function($i) use($lib){
      return $lib.$i;
    }, $icons));
  };

  unset($ctrl->data['total']);

  foreach ( $ctrl->data as $lib => $icons ){
    $cl = $libraries[$lib];
    if( $lib === 'faicons' ){
      $res['icons'] = array_merge($res['icons'], $icons);
    }
    else{
      //case mficons
      if ( is_array($icons[0]) && isset($icons[0]['icons']) ){
        foreach ( $icons as $ic ){
          $merge_icons($cl, $ic['icons']);
        }
      }
      else {
        $merge_icons($cl, $icons);
      }
    }
  }

  $res['total'] = count($res['icons']);
  $ctrl->obj->data = $res;
}


if ( !empty($ctrl->arguments) && ($ctrl->arguments[0] === 'iconpicker') ){
  $ctrl->obj->success = $res['total'] > 0 ? true : false;
}
else {
  echo $ctrl
    ->set_color('purple', 'white')
    ->set_icon('fas fa-image')
    ->combo("Iconology");
}
