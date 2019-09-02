<?php
if ( isset($ctrl->post['type']) && !empty($ctrl->files) ){
  switch ( $ctrl->post['type'] ){
    case 'clipboard':
      if (
        !empty($ctrl->files['file']) &&
        ($path = $ctrl->inc->user->add_to_tmp($ctrl->files['file']['tmp_name'], $ctrl->files['file']['name']))
      ){
        $m = new \bbn\appui\medias($ctrl->db);
        if ( $id_media = $m->insert($path) ){
          die(bbn\x::dump($m->get_media($id_media, true)));
        }
        else{
          die(bbn\x::dump("BOF"));
        }
      }
      else{
        die(\bbn\x::dump($ctrl->files['file']));
      }
      break;
  }
}
die("kkkk");