<?php
if ( isset($ctrl->post['type']) && !empty($ctrl->files) ){
  switch ( $ctrl->post['type'] ){
    case 'clipboard':
      if (
        !empty($ctrl->files['file']) &&
        ($path = $ctrl->inc->user->addToTmp($ctrl->files['file']['tmp_name'], $ctrl->files['file']['name']))
      ){
        $m = new \bbn\Appui\Medias($ctrl->db);
        if ( $id_media = $m->insert($path) ){
          die(bbn\X::dump($m->getMedia($id_media, true)));
        }
        else{
          die(bbn\X::dump("BOF"));
        }
      }
      else{
        die(\bbn\X::dump($ctrl->files['file']));
      }
      break;
  }
}
die("kkkk");