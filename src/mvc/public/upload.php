<?php
if ( isset($ctrl->post['type']) && !empty($ctrl->files) ){
  switch ( $ctrl->post['type'] ){
    case 'clipboard':
      var_dump($ctrl->user_tmp_path($ctrl->inc->user->get_id(), 'appui-notes'));
      die(var_dump("UPLOAD IN CORE", $ctrl->post, $ctrl->files));
      break;
  }
}