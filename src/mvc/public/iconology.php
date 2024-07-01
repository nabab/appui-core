<?php
/** @var $ctrl \bbn\Mvc\Controller */
/*$ctrl->data = $ctrl->getModel();


if ( empty($ctrl->arguments) &&
    (!empty($ctrl->arguments) && ($ctrl->arguments[0] === 'iconpicker'))
  ){

  if ( !empty($ctrl->data) ){
    $res = [
      'icons' => [],
      'total' => 0
    ];
    $libraries = [
      'faicons' => 'nf nf-fa-',
      'material' => 'zmdi zmdi-',
      'mficons' => 'icon-'
    ];
    //function
    $merge_icons = function($lib, $icons) use(&$res){

        $res['icons'] = \bbn\X::mergeArrays($res['icons'], array_map(function($i) use($lib){
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
    ->setColor('purple', 'white')
    ->setIcon('nf nf-fa-image')
    ->combo(($ctrl->data['picker'] ? "Icon picker" : "Iconology"), true);
}
*/

$ctrl->obj->data = $ctrl->getModel();


if ( !empty($ctrl->arguments) && ($ctrl->arguments[0] === 'iconpicker') ){
  $ctrl->obj->success = $ctrl->obj->data['total'] > 0 ? true : false;
}
else {
  $ctrl
    ->setColor('purple', 'white')
    ->setIcon('nf nf-fa-image')
    ->setObj(['scrollable' => false])
    ->combo("Iconology");
}